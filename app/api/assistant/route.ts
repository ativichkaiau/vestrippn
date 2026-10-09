import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireUserId } from '@/lib/auth/owner';
import { buildHubContext } from '@/lib/assistant/context';
import { HUB_CONFIG, isHub, type IntelligenceHub } from '@/lib/assistant/hubs';
import { assistantConfigured, assistantModel, limitError, limitState, recordRequest, recordTokens } from '@/lib/assistant/limit';
import { captureError } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Streamed responses can outlive the default function window.
export const maxDuration = 60;

const CORE_SYSTEM = `You are the VESTRIPPN assistant: a private assistant inside a personal environment that belongs to a Thai medical student at Chiang Mai University (CMU). VESTRIPPN holds study hubs (academics, workspace, clinical cases, analytics), research (systematic reviews), fitness, tools, an archive and a portfolio.

Response rules:
- Be concise and high-signal: a short brief the user can act on, not an essay.
- Plain text only — no markdown headers or tables. Use short paragraphs and "-" bullets.
- The "Live data" block, when present, is real and current — pulled from the user's own Canvas, Anki, curriculum, tasks and documents. Treat its numbers and dates as authoritative and reference them specifically. If the data you'd need isn't there, say what you'd need rather than inventing it.
- Medical, research and language output must be safe to verify: flag anything the user should double-check against course material or primary sources.
- You cannot modify app data. Phrase actions as recommendations; the user can save a reply as a task.`;

const MAX_HISTORY = 12;
const MAX_TURN_CHARS = 8_000;

interface AssistantRequest {
  hub: IntelligenceHub;
  title?: string;
  instruction: string;
  context?: Array<{ label: string; value: string }>;
  /** Earlier turns in this conversation, oldest first. */
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/** GET /api/assistant → whether the assistant is configured, and this user's budget. */
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ configured: assistantConfigured(), model: assistantModel(), usage: await limitState(userId) });
  } catch (error) {
    captureError('assistant.status', error, { userId });
    return NextResponse.json({ configured: assistantConfigured(), model: assistantModel(), usage: null });
  }
}

export async function POST(req: Request) {
  if (!assistantConfigured()) {
    console.error('❌ CRITICAL: Missing OPENAI_API_KEY');
    return NextResponse.json({ error: 'Assistant is not configured', detail: 'OPENAI_API_KEY is not set on this deployment.' }, { status: 503 });
  }

  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: AssistantRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const instruction = typeof body.instruction === 'string' ? body.instruction.trim().slice(0, MAX_TURN_CHARS) : '';
  if (!isHub(body.hub) || !instruction) {
    return NextResponse.json({ error: 'hub and instruction are required' }, { status: 400 });
  }
  const persona = HUB_CONFIG[body.hub].persona;

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((turn) => (turn?.role === 'user' || turn?.role === 'assistant') && typeof turn.content === 'string' && turn.content.trim())
    .slice(-MAX_HISTORY)
    .map((turn) => ({ role: turn.role, content: turn.content.slice(0, MAX_TURN_CHARS) }));

  const state = await limitState(userId);
  if (!state.allowed) {
    const retryAfter = state.resetAt ? Math.max(1, Math.ceil((new Date(state.resetAt).getTime() - Date.now()) / 1000)) : 60;
    return NextResponse.json(limitError(state), { status: 429, headers: { 'Retry-After': String(retryAfter) } });
  }

  // Real, server-fetched data for this hub (Canvas, Anki, curriculum, tasks,
  // documents …). The authoritative source; client-passed context is only a
  // hint. Failures degrade to an empty list, never an error.
  const liveContext = await buildHubContext(userId, body.hub);
  const liveLines = liveContext.filter((c) => c?.label && c?.value).map((c) => `- ${c.label}: ${c.value}`);
  const contextLines = (Array.isArray(body.context) ? body.context : [])
    .filter((c) => c?.label && c?.value)
    .slice(0, 12)
    .map((c) => `- ${String(c.label).slice(0, 80)}: ${String(c.value).slice(0, 400)}`);

  const userMessage = [
    body.title ? `Action: ${String(body.title).slice(0, 120)}` : null,
    `Request: ${instruction}`,
    liveLines.length ? `Live data (authoritative — pulled from the app):\n${liveLines.join('\n')}` : null,
    contextLines.length ? `Page context:\n${contextLines.join('\n')}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const model = assistantModel();
  const client = new OpenAI();

  // Open the stream first. If this throws (bad key, upstream error, network)
  // nothing was generated, so it is not counted against the limit.
  let completion;
  try {
    completion = await client.chat.completions.create({
      model,
      stream: true,
      stream_options: { include_usage: true },
      temperature: 0.4,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: CORE_SYSTEM },
        { role: 'system', content: persona },
        ...history,
        { role: 'user', content: userMessage },
      ],
    });
  } catch (error) {
    captureError('assistant.openai', error, { userId, hub: body.hub });
    return NextResponse.json({ error: 'Assistant unavailable', detail: 'The model provider did not accept the request. Try again shortly.' }, { status: 502 });
  }

  const usageId = await recordRequest(userId, model);

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let usage: { prompt_tokens?: number; completion_tokens?: number } | null = null;
      try {
        for await (const chunk of completion) {
          // With include_usage the final chunk carries usage and no choices.
          if (chunk.usage) usage = chunk.usage;
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (error) {
        captureError('assistant.stream', error, { userId, hub: body.hub });
        controller.error(error);
      }
      if (usage) {
        recordTokens(usageId, model, usage.prompt_tokens ?? 0, usage.completion_tokens ?? 0).catch((e) =>
          captureError('assistant.usage_write', e, { userId }),
        );
      }
    },
    cancel() {
      completion.controller.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
