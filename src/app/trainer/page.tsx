'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface TableState {
  hero_position: string;
  hero_stack: number;
  villain_position: string;
  villain_stack: number;
  button_position: string;
  blinds: { small: number; big: number };
  action_history: Array<{ player: string; action: string; amount?: number }>;
}

interface TrainingCard {
  id: string;
  name: string;
  question: string;
  table_state: TableState;
  reference_matrix: Record<string, number>;
}

interface UserAnswer {
  [hand: string]: number;
}

const mockCards: TrainingCard[] = [
  {
    id: 'card-001',
    name: 'BTN vs 3bet from MP',
    question: 'Что я колирую на 3бет?',
    table_state: {
      hero_position: 'BTN',
      hero_stack: 100,
      villain_position: 'MP',
      villain_stack: 100,
      button_position: 'BTN',
      blinds: { small: 0.5, big: 1 },
      action_history: [
        { player: 'MP', action: 'open', amount: 3 },
        { player: 'BTN', action: '3bet', amount: 9 },
        { player: 'MP', action: 'call' },
      ],
    },
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
    table_state: {
      hero_position: 'BTN',
      hero_stack: 100,
      villain_position: 'MP',
      villain_stack: 100,
      button_position: 'BTN',
      blinds: { small: 0.5, big: 1 },
      action_history: [{ player: 'MP', action: 'limp' }],
    },
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

function calculateScore(userAnswer: UserAnswer, reference: Record<string, number>): { correct: number; total: number; accuracy: number } {
  let correct = 0;
  let total = 0;

  for (const [hand, refValue] of Object.entries(reference)) {
    const userValue = userAnswer[hand] ?? 0;
    const diff = Math.abs(refValue - userValue);
    if (diff <= 10) correct++;
    total++;
  }

  return { correct, total, accuracy: Math.round((correct / total) * 100) };
}

export default function TrainerPage() {
  const [cards] = useState<TrainingCard[]>(mockCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<UserAnswer>({});
  const [showResult, setShowResult] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionStats, setSessionStats] = useState<{ correct: number; total: number; accuracy: number }[]>([]);

  const currentCard = cards[currentIndex];

  const handleRating = useCallback((hand: string, value: number) => {
    setUserAnswer((prev) => ({ ...prev, [hand]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const result = calculateScore(userAnswer, currentCard.reference_matrix);
    setSessionStats((prev) => [...prev, result]);
    setShowResult(true);
  }, [userAnswer, currentCard]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= cards.length) {
      setSessionDone(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer({});
      setShowResult(false);
    }
  }, [currentIndex, cards.length]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswer({});
    setShowResult(false);
    setSessionDone(false);
    setSessionStats([]);
  }, []);

  if (sessionDone) {
    const totalCorrect = sessionStats.reduce((s, r) => s + r.correct, 0);
    const totalHands = sessionStats.reduce((s, r) => s + r.total, 0);
    const overallAccuracy = totalHands > 0 ? Math.round((totalCorrect / totalHands) * 100) : 0;

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
              <p className="text-2xl font-bold">{sessionStats.length}</p>
              <p className="text-sm text-muted-foreground">Cards Reviewed</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-2xl font-bold">{totalCorrect}/{totalHands}</p>
              <p className="text-sm text-muted-foreground">Hands Correct</p>
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Card Info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold">{currentCard.name}</h1>
          <p className="text-muted-foreground mt-1">{currentCard.question}</p>
        </div>

        {/* Table State */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Hero:</span>{' '}
              <span className="font-medium">{currentCard.table_state.hero_position}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Villain:</span>{' '}
              <span className="font-medium">{currentCard.table_state.villain_position}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Stacks:</span>{' '}
              <span className="font-medium">{currentCard.table_state.hero_stack}bb</span>
            </div>
            <div>
              <span className="text-muted-foreground">Blinds:</span>{' '}
              <span className="font-medium">
                {currentCard.table_state.blinds.small}/{currentCard.table_state.blinds.big}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-muted-foreground text-sm">Action: </span>
            {currentCard.table_state.action_history.map((a, i) => (
              <span key={i} className="text-sm">
                {a.player} {a.action}{a.amount ? ` ${a.amount}` : ''}
                {i < currentCard.table_state.action_history.length - 1 ? ' → ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Hand Matrix */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-3">Rate each hand (0-100%):</p>
          <div className="grid grid-cols-13 gap-1">
            {Object.entries(currentCard.reference_matrix).map(([hand]) => (
              <div key={hand} className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground mb-1">{hand}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={userAnswer[hand] ?? 0}
                  onChange={(e) => handleRating(hand, parseInt(e.target.value))}
                  className="w-full h-2"
                />
                <span className="text-xs font-mono mt-1">{userAnswer[hand] ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result (when shown) */}
        {showResult && (
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            <h2 className="font-semibold mb-3">Result</h2>
            <div className="space-y-2">
              {Object.entries(currentCard.reference_matrix).slice(0, 10).map(([hand, refVal]) => {
                const userVal = userAnswer[hand] ?? 0;
                const diff = Math.abs(refVal - userVal);
                const isCorrect = diff <= 10;
                return (
                  <div key={hand} className="flex items-center gap-3 text-sm">
                    <span className="font-mono w-10">{hand}</span>
                    <span className={`w-6 text-center ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="text-muted-foreground">
                      Your: {userVal}% | Ref: {refVal}%
                    </span>
                  </div>
                );
              })}
              {Object.keys(currentCard.reference_matrix).length > 10 && (
                <p className="text-xs text-muted-foreground">... and {Object.keys(currentCard.reference_matrix).length - 10} more hands</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
            >
              {currentIndex + 1 >= cards.length ? 'See Results' : 'Next Card →'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
