import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { processReview, type SRSData } from "@/lib/srs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId, rating, userMatrix, responseTimeMs } = await req.json();
  if (!cardId || !rating) {
    return NextResponse.json({ error: "cardId and rating required" }, { status: 400 });
  }

  const card = await db.card.findUnique({ where: { id: cardId } });
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  let progress = await db.userProgress.findUnique({
    where: { userId_cardId: { userId: session.user.id, cardId } },
  });

  const srsData: SRSData = progress
    ? {
        easeFactor: progress.easeFactor,
        interval: progress.intervalDays,
        repetitions: progress.repetitions,
      }
    : { easeFactor: 2.5, interval: 0, repetitions: 0 };

  const updated = processReview(srsData, rating);

  const now = new Date();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + updated.interval);

  let accuracy = 0;
  if (userMatrix && card.referenceMatrix) {
    const ref = card.referenceMatrix as Record<string, number>;
    const user = userMatrix as Record<string, number>;
    const keys = new Set([...Object.keys(ref), ...Object.keys(user)]);
    let totalDiff = 0;
    for (const key of keys) {
      totalDiff += Math.abs((ref[key] || 0) - (user[key] || 0));
    }
    accuracy = Math.max(0, 100 - totalDiff / keys.size);
  }

  await db.reviewHistory.create({
    data: {
      userId: session.user.id,
      cardId,
      userMatrix: userMatrix ?? {},
      accuracy,
      responseTimeMs,
      rating,
    },
  });

  if (progress) {
    progress = await db.userProgress.update({
      where: { userId_cardId: { userId: session.user.id, cardId } },
      data: {
        easeFactor: updated.easeFactor,
        intervalDays: updated.interval,
        repetitions: updated.repetitions,
        nextReview,
        lastReview: now,
        totalReviews: { increment: 1 },
        correctReviews: rating === "good" || rating === "easy" ? { increment: 1 } : undefined,
      },
    });
  } else {
    progress = await db.userProgress.create({
      data: {
        userId: session.user.id,
        cardId,
        easeFactor: updated.easeFactor,
        intervalDays: updated.interval,
        repetitions: updated.repetitions,
        nextReview,
        lastReview: now,
        totalReviews: 1,
        correctReviews: rating === "good" || rating === "easy" ? 1 : 0,
      },
    });
  }

  return NextResponse.json({ progress, accuracy });
}
