import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FitnessClient from "./FitnessClient";
import MotionPolicy from '@/components/system/MotionPolicy';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fitness',
  description: 'Training cadence, nutrition log and streaks.',
};

export default async function FitnessPage() {
  const session = await auth();
  let fitnessData = null;

  if (session?.user?.id) {
    fitnessData = await prisma.fitnessLog.findUnique({
      where: { userId: session.user.id }
    });
  }

  return (
    <MotionPolicy>
      <FitnessClient cloudFitness={fitnessData} />
    </MotionPolicy>
  );
}