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

  const membership = await db.userDeck.findUnique({
    where: { userId_deckId: { userId: session.user.id, deckId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const cards = await db.card.findMany({
    where: { deckId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cards });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId, name, question, heroPosition, villainPosition, heroStack, villainStack, buttonPosition, blinds, actionHistory, referenceMatrix, notes } = await req.json();

  if (!deckId || !name || !question || !heroPosition || !referenceMatrix) {
    return NextResponse.json(
      { error: "deckId, name, question, heroPosition, and referenceMatrix required" },
      { status: 400 }
    );
  }

  const membership = await db.userDeck.findUnique({
    where: { userId_deckId: { userId: session.user.id, deckId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const card = await db.card.create({
    data: {
      deckId,
      name,
      question,
      heroPosition,
      villainPosition,
      heroStack: heroStack ?? 100,
      villainStack: villainStack ?? 100,
      buttonPosition,
      blinds: blinds ?? { small: 0.5, big: 1 },
      actionHistory: actionHistory ?? [],
      referenceMatrix,
      notes,
    },
  });

  return NextResponse.json({ card }, { status: 201 });
}
