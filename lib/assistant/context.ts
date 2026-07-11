// Builds the "live data" the Cockpit Intelligence assistant sees, scoped to the
// hub the user is on. Every source is wrapped in try/catch and returns [] on
// failure so a DB/Canvas hiccup can never break the assistant response.

import { prisma } from '@/lib/prisma';
import { fetchCanvasTelemetry } from '@/lib/canvas';

export type IntelligenceHub =
  | 'dashboard' | 'academics' | 'research' | 'fitness'
  | 'tools' | 'archive' | 'identity' | 'ielts';

export interface ContextItem { label: string; value: string }

async function canvasItems(): Promise<ContextItem[]> {
  try {
    const data = await fetchCanvasTelemetry();
    if (!data.subjects.length) return [];
    const scores = data.subjects
      .map((s) => `${s.name} ${s.progress != null ? `${s.progress}%` : 'n/a'}`)
      .join(', ');
    const items: ContextItem[] = [
      { label: 'Canvas scores', value: scores },
      { label: 'Quiz average', value: `${data.metrics.quizzes}%` },
      { label: 'Assignment completion', value: `${data.metrics.assignments}%` },
    ];
    if (data.upcoming?.length) {
      const deadlines = data.upcoming
        .slice(0, 5)
        .map((u) => `${u.courseName}: ${u.name} (due ${new Date(u.dueAt).toISOString().slice(0, 10)})`)
        .join('; ');
      items.push({ label: 'Upcoming Canvas deadlines', value: deadlines });
    }
    return items;
  } catch {
    return [];
  }
}

async function ankiItems(userId: string): Promise<ContextItem[]> {
  try {
    const a = await prisma.ankiTelemetry.findUnique({ where: { userId } });
    if (!a) return [];
    return [
      { label: 'Anki', value: `${a.dueCards} due, ${a.newCards} new, ${a.reviewedToday} reviewed today, ${a.streak}-day streak` },
    ];
  } catch {
    return [];
  }
}

async function taskItems(userId: string): Promise<ContextItem[]> {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId, completed: false },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { title: true, category: true },
    });
    if (!tasks.length) return [{ label: 'Pending tasks', value: 'none' }];
    const list = tasks.map((t) => `${t.title}${t.category && t.category !== 'GENERAL' ? ` [${t.category}]` : ''}`).join('; ');
    return [{ label: `Pending tasks (${tasks.length})`, value: list }];
  } catch {
    return [];
  }
}

async function archiveItems(userId: string): Promise<ContextItem[]> {
  try {
    const docs = await prisma.studyDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { title: true },
    });
    if (!docs.length) return [{ label: 'Archive documents', value: 'none yet' }];
    return [{ label: `Archive documents (${docs.length})`, value: docs.map((d) => d.title).join('; ') }];
  } catch {
    return [];
  }
}

async function researchItems(userId: string): Promise<ContextItem[]> {
  try {
    const [grouped, project] = await Promise.all([
      prisma.researchExtraction.groupBy({
        by: ['status'],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.researchProject.findUnique({ where: { userId } }),
    ]);
    const items: ContextItem[] = [];
    if (grouped.length) {
      const byStatus = grouped.map((g) => `${g.status.toLowerCase()}: ${g._count._all}`).join(', ');
      items.push({ label: 'Research extractions', value: byStatus });
    }
    if (project) {
      items.push({
        label: 'Covidence',
        value: `${project.title} — screening ${project.screening}, full-text ${project.fullText}, extraction ${project.extraction}`,
      });
    }
    return items;
  } catch {
    return [];
  }
}

async function fitnessItems(userId: string): Promise<ContextItem[]> {
  try {
    const log = await prisma.fitnessLog.findUnique({ where: { userId } });
    if (!log) return [];
    return [{ label: 'Fitness', value: `${log.streak}-day streak, last: ${log.lastWorkout}` }];
  } catch {
    return [];
  }
}

async function ieltsItems(userId: string): Promise<ContextItem[]> {
  try {
    const modules = await prisma.ieltsModule.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      select: { text: true },
    });
    if (!modules.length) return [];
    return [{ label: `IELTS notes (${modules.length})`, value: modules.map((m) => m.text).join('; ') }];
  } catch {
    return [];
  }
}

/**
 * Real, server-fetched data for the given hub. Each hub gets only what's
 * relevant to it, so we don't pay for Canvas/DB calls a hub won't use.
 */
export async function buildHubContext(userId: string, hub: IntelligenceHub): Promise<ContextItem[]> {
  switch (hub) {
    case 'academics':
      return [...(await canvasItems()), ...(await ankiItems(userId))];
    case 'dashboard':
      return [...(await taskItems(userId)), ...(await ankiItems(userId)), ...(await canvasItems())];
    case 'tools':
      return taskItems(userId);
    case 'archive':
      return archiveItems(userId);
    case 'research':
      return researchItems(userId);
    case 'fitness':
      return fitnessItems(userId);
    case 'ielts':
      return ieltsItems(userId);
    case 'identity':
    default:
      return [];
  }
}
