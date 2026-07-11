'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { TrainingCard } from '@/components/trainer/TrainingCard';

interface TableState {
  heroPosition: string;
  villainPositions: Array<{ position: string; stack: number; action?: string }>;
  buttonPosition: string;
  blinds: { small: number; big: number };
  heroStack: number;
  pot?: number;
  random?: number;
}

interface Card {
  id: string;
  name: string;
  question: string;
  table_state: TableState;
  reference_matrix: Record<string, number>;
}

interface SessionResult {
  correct: number;
  wrong: number;
  missing: number;
  extra: number;
  accuracy: number;
  rating: number;
}

const baseMockCards: Omit<Card, 'table_state'>[] = [
  {
    id: 'card-001',
    name: 'BTN vs 3bet from MP',
    question: 'Что я колирую на 3бет?',
    reference_matrix: {
      AA: 100, AKs: 100, AQs: 100, AJs: 100, ATs: 100,
      A9s: 80, A8s: 70, A7s: 50, A6s: 50, A5s: 100,
      A4s: 80, A3s: 70, A2s: 50,
      AKo: 100, AQo: 100, AJo: 100, ATo: 90,
      KK: 100, KQs: 100, KJs: 100, KTs: 90,
      KQo: 90, KJo: 80,
      QQ: 100, JJs: 100, JTs: 90,
      TT: 100, 99: 90, 88: 80, 77: 70,
      66: 60, 55: 50, 44: 40, 33: 30, 22: 20,
    },
  },
  {
    id: 'card-002',
    name: 'BTN vs Limp from MP',
    question: 'Что я опеню с BTN против лимпа?',
    reference_matrix: {
      AA: 100, AKs: 100, AQs: 100, AJs: 100, ATs: 100,
      A9s: 100, A8s: 100, A7s: 100, A6s: 100, A5s: 100,
      A4s: 100, A3s: 100, A2s: 100,
      AKo: 100, AQo: 100, AJo: 100, ATo: 100,
      KK: 100, KQs: 100, KJs: 100, KTs: 100,
      K9s: 100, KQo: 100, KJo: 100, KTo: 100,
      QQ: 100, JJs: 100, JTs: 100, J9s: 100,
      QJs: 100, QTs: 100, Q9s: 100,
      TT: 100, 99: 100, 88: 100, 77: 100,
      66: 100, 55: 100, 44: 100, 33: 100, 22: 100,
    },
  },
];

function buildTableStates(randoms: number[]): TableState[] {
  return [
    {
      heroPosition: 'BTN',
      villainPositions: [
        { position: 'MP', stack: 100, action: 'call' },
      ],
      buttonPosition: 'BTN',
      blinds: { small: 0.5, big: 1 },
      heroStack: 100,
      random: randoms[0],
    },
    {
      heroPosition: 'BTN',
      villainPositions: [
        { position: 'MP', stack: 100, action: 'limp' },
      ],
      buttonPosition: 'BTN',
      blinds: { small: 0.5, big: 1 },
      heroStack: 100,
      random: randoms[1],
    },
  ];
}

function generateRandoms(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 1);
}

function calculateComparisonStats(
  userMatrix: Record<string, number>,
  referenceMatrix: Record<string, number>
): { correct: number; wrong: number; missing: number; extra: number; accuracy: number } {
  let correct = 0;
  let wrong = 0;
  let missing = 0;
  let extra = 0;

  const allHands = Array.from(new Set([
    ...Object.keys(referenceMatrix),
    ...Object.keys(userMatrix),
  ]));

  for (const hand of allHands) {
    const refWeight = referenceMatrix[hand] ?? 0;
    const userWeight = userMatrix[hand] ?? 0;

    if (refWeight === userWeight) {
      correct++;
    } else if (refWeight > 0 && userWeight === 0) {
      missing++;
    } else if (refWeight === 0 && userWeight > 0) {
      extra++;
    } else {
      wrong++;
    }
  }

  const total = correct + wrong + missing + extra;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { correct, wrong, missing, extra, accuracy };
}

export default function TrainerPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionRandoms] = useState(() => generateRandoms(baseMockCards.length));
  const [startTime] = useState(() => Date.now());

  const cards: Card[] = useMemo(() => {
    const tableStates = buildTableStates(sessionRandoms);
    return baseMockCards.map((card, i) => ({
      ...card,
      table_state: tableStates[i],
    }));
  }, [sessionRandoms]);

  const currentCard = cards[currentIndex];

  const handleAnswer = useCallback((userMatrix: Record<string, number>, rating: number) => {
    const stats = calculateComparisonStats(userMatrix, currentCard.reference_matrix);
    setResults((prev) => [...prev, { ...stats, rating }]);

    if (currentIndex + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length, currentCard]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setSessionDone(false);
  }, []);

  const elapsed = useMemo(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [startTime, sessionDone]);

  if (sessionDone) {
    const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
    const totalWrong = results.reduce((s, r) => s + r.wrong, 0);
    const totalMissing = results.reduce((s, r) => s + r.missing, 0);
    const totalExtra = results.reduce((s, r) => s + r.extra, 0);
    const totalHands = totalCorrect + totalWrong + totalMissing + totalExtra;
    const overallAccuracy = totalHands > 0 ? Math.round((totalCorrect / totalHands) * 100) : 0;
    const avgRating = results.length > 0
      ? (results.reduce((s, r) => s + r.rating, 0) / results.length).toFixed(1)
      : '0';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-4 rounded-xl border border-border bg-card p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold">Session Complete!</h1>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-primary">{overallAccuracy}%</p>
            <p className="text-muted-foreground">Overall Accuracy</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold">{results.length}</p>
              <p className="text-sm text-muted-foreground">Cards Reviewed</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold">{elapsed}</p>
              <p className="text-sm text-muted-foreground">Time</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold">{totalCorrect}/{totalHands}</p>
              <p className="text-sm text-muted-foreground">Hands Correct</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetSession}
              className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Train Again
            </button>
            <Link
              href="/dashboard"
              className="flex-1 py-2 px-4 rounded-lg border border-border font-medium hover:bg-muted text-center"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)]">
        <TrainingCard
          key={currentCard.id}
          card={currentCard}
          onAnswer={handleAnswer}
        />
      </main>
    </div>
  );
}
