import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Security Check: Protect your endpoint from spam
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ANKI_SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized Uplink' }, { status: 401 });
    }

    // 2. Parse the incoming telemetry
    const body = await req.json();
    const { email, due, newCards, reviewedToday, streak } = body;

    if (!email) {
      return NextResponse.json({ error: 'Operator email required' }, { status: 400 });
    }

    // 3. Find the Operator in your database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    // 4. Upsert the telemetry data
    const telemetry = await prisma.ankiTelemetry.upsert({
      where: { userId: user.id },
      update: {
        dueCards: due,
        newCards: newCards,
        reviewedToday: reviewedToday,
        streak: streak,
        lastSync: new Date(),
      },
      create: {
        userId: user.id,
        dueCards: due,
        newCards: newCards,
        reviewedToday: reviewedToday,
        streak: streak,
      },
    });

    return NextResponse.json({ success: true, telemetry }, { status: 200 });

  } catch (error) {
    console.error('[ANKI API ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}