'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

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
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {gameType}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
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
      </CardContent>

      <CardFooter className="gap-2">
        <Link
          href={`/trainer?deck=${id}`}
          className={buttonVariants({ variant: 'default', className: 'flex-1' })}
        >
          Train
        </Link>
        <Link
          href={`/editor?deck=${id}`}
          className={buttonVariants({ variant: 'outline', className: 'flex-1' })}
        >
          Edit
        </Link>
      </CardFooter>
    </Card>
  );
}
