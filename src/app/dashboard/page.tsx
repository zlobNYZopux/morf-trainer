'use client';

import { useState } from 'react';
import StatsOverview from '@/components/dashboard/StatsOverview';
import DeckCard from '@/components/dashboard/DeckCard';

const mockDecks = [
  {
    id: 'deck-001',
    name: '3bet Spots',
    gameType: 'NLH Cash',
    cardCount: 42,
    accuracy: 78,
    masteredCount: 12,
  },
  {
    id: 'deck-002',
    name: 'Preflop Opens',
    gameType: 'NLH Cash',
    cardCount: 65,
    accuracy: 85,
    masteredCount: 28,
  },
  {
    id: 'deck-003',
    name: 'MTT ICM',
    gameType: 'Tournament',
    cardCount: 30,
    accuracy: 62,
    masteredCount: 5,
  },
];

export default function DashboardPage() {
  const [decks] = useState(mockDecks);

  const totalReviews = decks.reduce((sum, d) => sum + Math.floor(d.cardCount * (d.accuracy / 100) * 3), 0);
  const avgAccuracy = Math.round(decks.reduce((sum, d) => sum + d.accuracy, 0) / decks.length);
  const totalMastered = decks.reduce((sum, d) => sum + d.masteredCount, 0);
  const totalCards = decks.reduce((sum, d) => sum + d.cardCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">MORF Trainer</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Player 1</span>
            <button className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <StatsOverview
            totalReviews={totalReviews}
            accuracy={avgAccuracy}
            currentStreak={7}
            cardsMastered={totalMastered}
            totalCards={totalCards}
          />
        </section>

        {/* Decks Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Decks</h2>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              + New Deck
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <DeckCard key={deck.id} {...deck} />
            ))}
          </div>
        </section>

        {/* Stats Charts Placeholder */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-6 h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Accuracy over time — chart placeholder</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Reviews per day — chart placeholder</p>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Subscription</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Current plan: <span className="font-medium text-foreground">Free</span> — 3 decks, 100 cards
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                Pro — $9/mo
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Unlimited — $19/mo
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
