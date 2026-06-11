import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { resolveUserId } from '@/lib/auth/owner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Streamed Claude responses can outlive the default function window.
export const maxDuration = 60;

type IntelligenceHub =
  | 'dashboard' | 'academics' | 'research' | 'fitness'
  | 'tools' | 'archive' | 'identity' | 'ielts';

// Stable shared core — first system block, cache breakpoint lives here so the
// prefix stays byte-identical across every hub and request.
const CORE_SYSTEM = `You are the Cockpit Intelligence assistant inside VEStriPPN, a private personal command center for a Thai medical student at CMU (Chiang Mai University). The app has hubs for academics (HMS-2 musculoskeletal module, Canvas, Anki, clinical cases), research (SRMA screening/extraction), fitness, tools, archive, identity/portfolio, and IELTS prep.

Response rules:
- Be concise and high-signal: a short brief the user can act on, not an essay.
- Plain text only — no markdown headers or tables. Use short paragraphs and "-" bullets.
- Ground every answer in the hub context provided; if context is missing, say what you'd need rather than inventing data.
- Medical, research, and language output must be safe to verify: flag anything the user should double-check against course material or primary sources.
- You cannot modify app data (planner, archive, Anki). Phrase actions as recommendations.`;

const HUB_PERSONA: Record<IntelligenceHub, string> = {
  dashboard: 'Current hub: Dashboard. Help with the day plan, pending tasks, and which module to open next.',
  academics: 'Current hub: Academics. Help with study plans for HMS-2 (Human Musculoskeletal System), exam targets, Anki load, and clinical case drills.',
  research: 'Current hub: Research. Help with SRMA extraction notes, literature summaries, screening rationale, and source triage (PubMed, Europe PMC, Scopus).',
  fitness: 'Current hub: Fitness. Help with weekly training structure, recovery rhythm, and streak strategy.',
  tools: 'Current hub: Tools. Help choose and sequence utilities, planner flows, and shortcuts.',
  archive: 'Current hub: Archive. Help find related notes, summarize entries, and draft saves.',
  identity: 'Current hub: Identity/Portfolio. Help draft profile summaries, frame project evidence, and shape outreach copy.',
  ielts: 'Current hub: IELTS. Help build writing drills (Task 2), speaking practice (Part 2/3), and vocabulary review loops.',
};

interface AssistantRequest {
  hub: IntelligenceHub;
  title?: string;
  instruction: string;
  context?: Array<{ label: string; value: string }>;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ CRITICAL: Missing ANTHROPIC_API_KEY');
    return NextResponse.json({ error: 'Config Missing' }, { status: 500 });
  }

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: AssistantRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const persona = HUB_PERSONA[body.hub];
  const instruction = body.instruction?.trim();
  if (!persona || !instruction) {
    return NextResponse.json({ error: 'hub and instruction are required' }, { status: 400 });
  }

  const contextLines = (body.context || [])
    .filter((c) => c?.label && c?.value)
    .map((c) => `- ${c.label}: ${c.value}`);

  const userMessage = [
    body.title ? `Action: ${body.title}` : null,
    `Request: ${instruction}`,
    contextLines.length ? `Hub context:\n${contextLines.join('\n')}` : null,
  ].filter(Boolean).join('\n\n');

  const client = new Anthropic();

  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    system: [
      { type: 'text', text: CORE_SYSTEM, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: persona },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error('❌ ASSISTANT STREAM ERROR:', error);
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
