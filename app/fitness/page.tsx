import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import FitnessClient from "./FitnessClient";

export default async function FitnessPage() {
  const session = await auth();
  let fitnessData = null;

  if (session?.user?.id) {
    fitnessData = await prisma.fitnessLog.findUnique({
      where: { userId: session.user.id }
    });
  }

  return <FitnessClient cloudFitness={fitnessData} />;
}