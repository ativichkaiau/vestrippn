import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/owner';
import { prisma } from '@/lib/prisma';

async function mutate(request: Request, method: 'POST' | 'PATCH' | 'DELETE') {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Sign in to edit your agenda.' }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4096) throw new Error();
    body = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch { return NextResponse.json({ error: 'Invalid agenda item.' }, { status: 400 }); }
  if (body.kind !== 'task' && body.kind !== 'milestone') return NextResponse.json({ error: 'Choose a task or research milestone.' }, { status: 400 });
  if (method !== 'POST' && (typeof body.id !== 'string' || !body.id || body.id.length > 100)) return NextResponse.json({ error: 'Invalid item ID.' }, { status: 400 });
  const id = typeof body.id === 'string' ? body.id : '';
  const data: { title?: string; dueAt?: Date | null; estimatedMinutes?: number; priority?: number; completed?: boolean } = {};
  if (method !== 'DELETE') {
    if (method === 'POST' || 'title' in body) {
      if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 200) return NextResponse.json({ error: 'Enter a title of 1–200 characters.' }, { status: 400 });
      data.title = body.title.trim();
    }
    if ('dueAt' in body) {
      if (body.dueAt === null || body.dueAt === '') data.dueAt = null;
      else if (typeof body.dueAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(body.dueAt) && Number.isFinite(Date.parse(body.dueAt))) data.dueAt = new Date(body.dueAt);
      else return NextResponse.json({ error: 'Enter a valid due date.' }, { status: 400 });
    }
    if ('estimatedMinutes' in body) {
      if (!Number.isInteger(body.estimatedMinutes) || Number(body.estimatedMinutes) < 5 || Number(body.estimatedMinutes) > 480) return NextResponse.json({ error: 'Estimated work must be 5–480 minutes.' }, { status: 400 });
      data.estimatedMinutes = Number(body.estimatedMinutes);
    }
    if ('priority' in body) {
      if (!Number.isInteger(body.priority) || ![0, 1, 2].includes(Number(body.priority))) return NextResponse.json({ error: 'Invalid priority.' }, { status: 400 });
      if (body.kind === 'task') data.priority = Number(body.priority);
    }
    if ('completed' in body) {
      if (typeof body.completed !== 'boolean') return NextResponse.json({ error: 'Invalid completion state.' }, { status: 400 });
      data.completed = body.completed;
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'No changes supplied.' }, { status: 400 });
  }
  try {
    if (method === 'POST') {
      const create = { ...data, title: data.title!, userId };
      const item = body.kind === 'task' ? await prisma.task.create({ data: create }) : await prisma.researchMilestone.create({ data: create });
      revalidatePath('/');
      return NextResponse.json({ id: item.id }, { status: 201 });
    }
    const where = { id, userId };
    const result = method === 'DELETE'
      ? body.kind === 'task' ? await prisma.task.deleteMany({ where }) : await prisma.researchMilestone.deleteMany({ where })
      : body.kind === 'task' ? await prisma.task.updateMany({ where, data }) : await prisma.researchMilestone.updateMany({ where, data });
    if (!result.count) return NextResponse.json({ error: 'Item not found.' }, { status: 404 });
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[STUDY PLAN] Item write failed:', error);
    return NextResponse.json({ error: 'Could not save this agenda item. Please retry.' }, { status: 500 });
  }
}

export const POST = (request: Request) => mutate(request, 'POST');
export const PATCH = (request: Request) => mutate(request, 'PATCH');
export const DELETE = (request: Request) => mutate(request, 'DELETE');
