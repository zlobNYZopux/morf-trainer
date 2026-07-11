'use client';

import Link from 'next/link';

interface DeckCardProps {
  id: string;
  name: string;
  gameType: string;
  cardCount: number;
  accuracy: number;
  masteredCount: number;
}

export default function DeckCard({
  id,
  name,
  gameType,
  cardCount,
  accuracy,
  masteredCount,
}: DeckCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
            {gameType}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-xl font-bold">{cardCount}</p>
          <p className="text-xs text-muted-foreground">Cards</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-xl font-bold">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-xl font-bold">{masteredCount}</p>
          <p className="text-xs text-muted-foreground">Mastered</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/trainer?deck=${id}`}
          className="flex-1 text-center py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Train
        </Link>
        <Link
          href={`/editor?deck=${id}`}
          className="flex-1 text-center py-2 px-4 rounded-lg border border-border font-medium hover:bg-muted transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
