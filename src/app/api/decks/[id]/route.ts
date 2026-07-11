import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deck = await db.deck.findFirst({
    where: {
      id,
      userDecks: { some: { userId: session.user.id } },
    },
    include: {
      cards: { orderBy: { createdAt: "desc" } },
      _count: { select: { cards: true } },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  return NextResponse.json({ deck });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.userDeck.findUnique({
    where: { userId_deckId: { userId: session.user.id, deckId: id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const { name, gameType, description, isPublic } = await req.json();
  const deck = await db.deck.update({
    where: { id },
    data: { ...(name && { name }), ...(gameType && { gameType }), ...(description !== undefined && { description }), ...(isPublic !== undefined && { isPublic }) },
  });

  return NextResponse.json({ deck });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.userDeck.findUnique({
    where: { userId_deckId: { userId: session.user.id, deckId: id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  await db.deck.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
