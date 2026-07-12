'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { TrainingCard } from '@/components/trainer/TrainingCard';

interface BetAction {
  player: string;
  action: string;
  amount: number;
  isMultiplier: boolean;
  multiplier?: number;
}

interface Card {
  id: string;
  name: string;
  question: string;
  heroPosition: string;
  villainPosition: string;
  heroStack: number;
  villainStack: number;
  blinds: { small: number; big: number };
  actions: BetAction[];
  referenceMatrix: Record<string, number>;
}

interface SessionResult {
  correct: number;
  wrong: number;
  missing: number;
  extra: number;
  accuracy: number;
}

const MOCK_CARDS: Card[] = [
  {
    id: 'card-001',
    name: 'SB vs 3bet from BTN',
    question: 'Что я колирую на 3бет?',
    heroPosition: 'SB',
    villainPosition: 'BTN',
    heroStack: 100,
    villainStack: 100,
    blinds: { small: 0.5, big: 1 },
    actions: [
      // Poker order: UTG folds, MP opens 2.5, CO folds, BTN 3bets 8, SB (hero) decides, BB still in
      { player: 'UTG', action: 'fold', amount: 0, isMultiplier: false },
      { player: 'MP', action: 'open', amount: 2.5, isMultiplier: false },
      { player: 'CO', action: 'fold', amount: 0, isMultiplier: false },
      { player: 'BTN', action: '3bet', amount: 8, isMultiplier: false },
      // Hero (SB) decides now
      // BB is still in the hand (will act after hero)
    ],
    referenceMatrix: {
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
    name: 'BB vs Open from CO',
    question: 'Что я колирую на опен из CO?',
    heroPosition: 'BB',
    villainPosition: 'CO',
    heroStack: 100,
    villainStack: 100,
    blinds: { small: 0.5, big: 1 },
    actions: [
      // Poker order: CO opens, BTN folds, SB folds, BB (hero) decides
      { player: 'CO', action: 'open', amount: 2.5, isMultiplier: false },
      { player: 'BTN', action: 'fold', amount: 0, isMultiplier: false },
      { player: 'SB', action: 'fold', amount: 0, isMultiplier: false },
      // Hero (BB) decides now
    ],
    referenceMatrix: {
      AA: 100, AKs: 100, AQs: 100, AJs: 100, ATs: 100,
      A9s: 100, A8s: 100, A7s: 100, A6s: 100, A5s: 100,
      A4s: 100, A3s: 100, A2s: 100,
      AKo: 100, AQo: 100, AJo: 100, ATo: 100,
      KK: 100, KQs: 100, KJs: 100, KTs: 100,
      K9s: 80, K8s: 60, KQo: 100, KJo: 100, KTo: 100,
      QQ: 100, JJs: 100, JTs: 100, J9s: 80,
      QJs: 100, QTs: 100, Q9s: 80,
      TT: 100, 99: 100, 88: 100, 77: 100,
      66: 100, 55: 100, 44: 80, 33: 60, 22: 50,
    },
  },
];

function generateRandoms(count: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 1);
}

export default function TrainerPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const randoms = useMemo(() => generateRandoms(MOCK_CARDS.length), []);

  const cards = useMemo(() => {
    return MOCK_CARDS.map((card, i) => ({
      ...card,
      random: randoms[i],
    }));
  }, [randoms]);

  const currentCard = cards[currentIndex];

  const handleAnswer = useCallback(
    (userMatrix: Record<string, number>, _rating: number) => {
      const refMatrix = currentCard.referenceMatrix;
      let correct = 0;
      let wrong = 0;
      let missing = 0;
      let extra = 0;

      const allHands = new Set([...Object.keys(refMatrix), ...Object.keys(userMatrix)]);
      for (const hand of allHands) {
        const ref = refMatrix[hand] ?? 0;
        const user = userMatrix[hand] ?? 0;
        if (ref === user) correct++;
        else if (ref > 0 && user === 0) missing++;
        else if (ref === 0 && user > 0) extra++;
        else wrong++;
      }

      const accuracy = allHands.size > 0 ? Math.round((correct / allHands.size) * 100) : 0;
      setResults((prev) => [...prev, { correct, wrong, missing, extra, accuracy }]);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionComplete(true);
      }
    },
    [currentIndex, cards.length, currentCard]
  );

  if (sessionComplete) {
    const totalCorrect = results.reduce((s, r) => s + r.correct, 0);
    const totalHands = results.reduce((s, r) => s + r.correct + r.wrong + r.missing + r.extra, 0);
    const avgAccuracy = results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length)
      : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <h1 className="text-3xl font-bold">Тренировка завершена!</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-[#1a1d27] border border-[#242836]">
              <div className="text-2xl font-bold text-[#22c55e]">{avgAccuracy}%</div>
              <div className="text-[#94a3b8]">Средняя точность</div>
            </div>
            <div className="p-4 rounded-lg bg-[#1a1d27] border border-[#242836]">
              <div className="text-2xl font-bold text-[#e2e8f0]">{totalCorrect}/{totalHands}</div>
              <div className="text-[#94a3b8]">Всего рук</div>
            </div>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between text-sm p-2 rounded bg-[#0f1117]">
                <span className="text-[#94a3b8]">Карточка {i + 1}</span>
                <span className="text-[#e2e8f0] font-mono">{r.accuracy}%</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setResults([]);
                setSessionComplete(false);
              }}
              className="px-6 py-2 rounded-lg bg-[#e8834A] text-white font-semibold hover:bg-[#d4733e]"
            >
              Ещё раз
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-2 rounded-lg border border-[#242836] text-[#e2e8f0] hover:bg-[#1a1d27]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#242836] bg-[#0f1117]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-[#94a3b8] hover:text-[#e2e8f0]">
            ← Назад
          </Link>
          <span className="text-sm text-[#e2e8f0] font-semibold">{currentCard.name}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
          <span>Карточка {currentIndex + 1}/{cards.length}</span>
        </div>
      </div>

      {/* Training Card */}
      <div className="flex-1 min-h-0">
        <TrainingCard
          key={currentCard.id}
          card={{
            ...currentCard,
            table_state: {
              heroPosition: currentCard.heroPosition,
              villainPositions: (["UTG", "MP", "CO", "BTN", "SB", "BB"] as string[])
                .filter((p) => p !== currentCard.heroPosition)
                .map((pos) => {
                  const act = currentCard.actions.find((a) => a.player === pos);
                  return {
                    position: pos,
                    stack: currentCard.villainStack,
                    action: act?.action,
                    folded: act ? act.action === 'fold' : true,
                  };
                }),
              buttonPosition: 'BTN',
              blinds: currentCard.blinds,
              heroStack: currentCard.heroStack,
              random: currentCard.random,
              actions: currentCard.actions,
            },
            reference_matrix: currentCard.referenceMatrix,
          }}
          onAnswer={handleAnswer}
        />
      </div>
    </div>
  );
}
