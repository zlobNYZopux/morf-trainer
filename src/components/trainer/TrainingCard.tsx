"use client";

import { useState } from "react";
import { PokerTable } from "./PokerTable";
import { HandMatrix } from "./HandMatrix";
import { WeightSelector } from "./WeightSelector";
import { RangeTextInput } from "./RangeTextInput";
import { ComparisonView } from "./ComparisonView";

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

interface TrainingCardProps {
  card: Card;
  onAnswer: (userMatrix: Record<string, number>, rating: number) => void;
}

export function TrainingCard({ card, onAnswer }: TrainingCardProps) {
  const [userMatrix, setUserMatrix] = useState<Record<string, number>>({});
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<number>(50);
  const [showAnswer, setShowAnswer] = useState(false);
  const [rangeText, setRangeText] = useState("");

  const handleSelectHand = (hand: string) => {
    setSelectedHand(hand);
  };

  const handleSelectWeight = (weight: number) => {
    setSelectedWeight(weight);
    if (selectedHand) {
      setUserMatrix((prev) => ({
        ...prev,
        [selectedHand]: weight,
      }));
    }
  };

  const handleParseRange = (parsed: Record<string, number>) => {
    setUserMatrix((prev) => ({
      ...prev,
      ...parsed,
    }));
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRate = (rating: number) => {
    onAnswer(userMatrix, rating);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-default)]">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          {card.name}
        </h2>
      </div>

      {/* Poker table */}
      <PokerTable
        heroPosition={card.table_state.heroPosition}
        villainPositions={card.table_state.villainPositions}
        buttonPosition={card.table_state.buttonPosition}
        blinds={card.table_state.blinds}
        heroStack={card.table_state.heroStack}
        pot={card.table_state.pot}
        random={card.table_state.random}
      />

      {/* Question */}
      <div className="text-[var(--text-primary)]">{card.question}</div>

      {/* Hand matrix for input */}
      {!showAnswer && (
        <div className="flex flex-col gap-4">
          <HandMatrix
            matrix={userMatrix}
            selectedHand={selectedHand}
            onSelectHand={handleSelectHand}
            mode="input"
          />

          {/* Weight selector */}
          <WeightSelector
            selectedWeight={selectedWeight}
            onSelectWeight={handleSelectWeight}
          />

          {/* Range text input */}
          <RangeTextInput
            value={rangeText}
            onChange={setRangeText}
            onParse={handleParseRange}
          />

          {/* Show answer button */}
          <button
            onClick={handleShowAnswer}
            className="px-4 py-2 rounded bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            Show Answer
          </button>
        </div>
      )}

      {/* Comparison view */}
      {showAnswer && (
        <div className="flex flex-col gap-4">
          <ComparisonView
            userMatrix={userMatrix}
            referenceMatrix={card.reference_matrix}
          />

          {/* Rating buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleRate(0)}
              className="flex-1 px-4 py-2 rounded bg-[var(--color-error,#ef4444)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Again
            </button>
            <button
              onClick={() => handleRate(1)}
              className="flex-1 px-4 py-2 rounded bg-[var(--color-warning,#eab308)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Hard
            </button>
            <button
              onClick={() => handleRate(2)}
              className="flex-1 px-4 py-2 rounded bg-[var(--color-success,#22c55e)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Good
            </button>
            <button
              onClick={() => handleRate(3)}
              className="flex-1 px-4 py-2 rounded bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Easy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}