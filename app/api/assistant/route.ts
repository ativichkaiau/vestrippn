import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { resolveUserId } from '@/lib/auth/owner';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Streamed responses can outlive the default function window.
export const maxDuration = 60;

// Sliding-window rate limit: at most RATE_LIMIT requests per RATE_WINDOW_MS,
// per user. Backed by the AssistantUsage table so it holds across serverless
// invocations.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours

type IntelligenceHub =
  | 'dashboard' | 'academics' | 'research' | 'fitness'
  | 'tools' | 'archive' | 'identity' | 'ielts';

const CORE_SYSTEM = `You are the Cockpit Intelligence assistant inside VEStriPPN, a private personal command center for a Thai medical student at CMU (Chiang Mai University). The app has hubs for academics (HMS-2 and HNS-2 completed, HCVS-2 active, Canvas, Anki, clinical cases), research (SRMA screening/extraction), fitness, tools, archive, identity/portfolio, and IELTS prep.

Response rules:
- Be concise and high-signal: a short brief the user can act on, not an essay.
- Plain text only — no markdown headers or tables. Use short paragraphs and "-" bullets.
- Ground every answer in the hub context provided; if context is missing, say what you'd need rather than inventing data.
- Medical, research, and language output must be safe to verify: flag anything the user should double-check against course material or primary sources.
- You cannot modify app data (planner, archive, Anki). Phrase actions as recommendations.`;

const HUB_PERSONA: Record<IntelligenceHub, string> = {
  dashboard: 'Current hub: Dashboard. Help with the day plan, pending tasks, and which module to open next.',
  academics: 'Current hub: Academics. HMS-2 (Human Musculoskeletal System) and HNS-2 (Nervous System and Special Senses) are completed; HCVS-2 (Human Cardiovascular System) is the active target for 4 August 2026, with the exact exam time still TBA. Help with HCVS-2 study plans, Canvas scores, Anki load, and cardiovascular clinical case drills.',
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
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ CRITICAL: Missing OPENAI_API_KEY');
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

  // Rate limit: count this user's requests inside the sliding window.
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS);
  const recent = await prisma.assistantUsage.findMany({
    where: { userId, createdAt: { gte: windowStart } },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true },
  });

  if (recent.length >= RATE_LIMIT) {
    // A slot frees up RATE_WINDOW_MS after the oldest request in the window.
    const resetAt = new Date(recent[0].createdAt.getTime() + RATE_WINDOW_MS);
    const retryAfter = Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
    return NextResponse.json(
      {
        error: 'Rate limit reached',
        detail: `Limit is ${RATE_LIMIT} requests per 5 hours. Try again after ${resetAt.toLocaleString()}.`,
        resetAt: resetAt.toISOString(),
      },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  // Record this request, and opportunistically prune rows outside the window.
  await prisma.assistantUsage.create({ data: { userId } });
  prisma.assistantUsage
    .deleteMany({ where: { userId, createdAt: { lt: windowStart } } })
    .catch(() => { /* best-effort cleanup; never block the response */ });

  const contextLines = (body.context || [])
    .filter((c) => c?.label && c?.value)
    .map((c) => `- ${c.label}: ${c.value}`);

  const userMessage = [
    body.title ? `Action: ${body.title}` : null,
    `Request: ${instruction}`,
    contextLines.length ? `Hub context:\n${contextLines.join('\n')}` : null,
  ].filter(Boolean).join('\n\n');

  const client = new OpenAI();

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    temperature: 0.4,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: CORE_SYSTEM },
      { role: 'system', content: persona },
      { role: 'user', content: userMessage },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (error) {
        console.error('❌ ASSISTANT STREAM ERROR:', error);
        controller.error(error);
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
