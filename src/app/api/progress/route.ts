import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const deckId = searchParams.get("deckId");
  if (!deckId) {
    return NextResponse.json({ error: "deckId required" }, { status: 400 });
  }

  const progress = await db.userProgress.findMany({
    where: {
      userId: session.user.id,
      card: { deckId },
    },
    include: { card: { select: { id: true, name: true } } },
    orderBy: { nextReview: "asc" },
  });

  const totalCards = await db.card.count({ where: { deckId } });
  const dueCards = progress.filter((p: { nextReview: Date }) => p.nextReview <= new Date()).length;
  const masteredCards = progress.filter((p: { intervalDays: number }) => p.intervalDays >= 21).length;

  const totalReviews = progress.reduce((sum: number, p: { totalReviews: number }) => sum + p.totalReviews, 0);
  const correctReviews = progress.reduce((sum: number, p: { correctReviews: number }) => sum + p.correctReviews, 0);
  const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;

  return NextResponse.json({
    stats: {
      totalCards,
      dueCards,
      masteredCards,
      totalReviews,
      accuracy: Math.round(accuracy * 10) / 10,
    },
    progress,
  });
}
