import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decks = await db.deck.findMany({
    where: {
      userDecks: { some: { userId: session.user.id } },
    },
    include: { _count: { select: { cards: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ decks });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, gameType, description, isPublic } = await req.json();
  if (!name || !gameType) {
    return NextResponse.json({ error: "Name and game type required" }, { status: 400 });
  }

  const deck = await db.deck.create({
    data: {
      name,
      gameType,
      description,
      isPublic,
      userDecks: { create: { userId: session.user.id } },
    },
    include: { _count: { select: { cards: true } } },
  });

  return NextResponse.json({ deck }, { status: 201 });
}
