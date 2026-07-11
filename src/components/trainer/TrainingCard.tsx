"use client";

import { useState } from "react";
import { PokerTable } from "./PokerTable";
import { HandMatrix } from "./HandMatrix";
import { WeightSelector } from "./WeightSelector";
import { RangeTextInput } from "./RangeTextInput";
import { ComparisonView } from "./ComparisonView";

interface TableState {
  heroPosition: string;
  villainPositions: Array<{ position: string; stack: number; action?: string; folded?: boolean }>;
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
  const [selectedWeight, setSelectedWeight] = useState<number>(100);
  const [showAnswer, setShowAnswer] = useState(false);
  const [rangeText, setRangeText] = useState("");

  // Determine action from question text
  const getAction = (): "fold" | "call" | "raise" | "check" => {
    const q = card.question.toLowerCase();
    if (q.includes("кол") || q.includes("колиру")) return "call";
    if (q.includes("фолд") || q.includes("сброс")) return "fold";
    if (q.includes("чек") || q.includes("чекаю")) return "check";
    return "raise";
  };
  const action = getAction();

  const handleMatrixChange = (matrix: Record<string, number>) => {
    setUserMatrix(matrix);
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

  // Build action history string
  const getActionHistory = () => {
    const parts: string[] = [];
    const allPositions = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
    for (const pos of allPositions) {
      if (pos === card.table_state.heroPosition) {
        parts.push(`${pos} ${card.table_state.heroStack}`);
      } else {
        const v = card.table_state.villainPositions.find((vp) => vp.position === pos);
        if (v) {
          parts.push(`${pos} ${v.stack}`);
        } else {
          parts.push(`${pos} 100`);
        }
      }
    }
    return parts;
  };

  const actionParts = getActionHistory();

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-[var(--background)] overflow-hidden">
      {/* LEFT: Poker Table - 40% */}
      <div className="w-[40%] flex flex-col border-r border-[var(--border)]">
        {/* Action history bar - above table, centered, large */}
        <div className="px-4 py-4 border-b border-[var(--border)] bg-[#0a0c10]">
          <div className="flex items-center justify-center gap-3 flex-wrap text-base font-mono">
            {card.table_state.villainPositions.map((v, i) => (
              <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-base text-[#94a3b8] font-semibold">{v.position}</span>
                <span className="text-sm text-[#64748b]">{v.stack}</span>
                <span
                  className={`
                    px-3 py-1.5 rounded-md font-bold text-sm
                    ${
                      v.action === "fold"
                        ? "bg-[#1a1d27] text-[#475569] border border-[#333]"
                        : v.action?.includes("3bet") || v.action?.includes("4bet")
                        ? "bg-[#e8834A]/20 text-[#e8834A] border border-[#e8834A]/30"
                        : v.action?.includes("raise") || v.action?.includes("open")
                        ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30"
                        : v.action?.includes("call")
                        ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
                        : "bg-[#1a1d27] text-[#64748b] border border-[#333]"
                    }
                  `}
                >
                  {v.action === "fold" ? "Fold" : v.action}
                </span>
              </span>
            ))}
            <span className="text-[#333] mx-2 text-lg">|</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[#22c55e] font-bold text-lg">{card.table_state.heroPosition}</span>
              <span className="text-[#94a3b8] text-base">{card.table_state.heroStack}</span>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 flex items-center justify-center p-4">
          <PokerTable
            heroPosition={card.table_state.heroPosition}
            villainPositions={card.table_state.villainPositions}
            buttonPosition={card.table_state.buttonPosition}
            blinds={card.table_state.blinds}
            heroStack={card.table_state.heroStack}
            situation={`${card.table_state.heroPosition} vs. ${card.table_state.villainPositions[0]?.position || '?'}${card.table_state.random ? `, ${card.table_state.random}` : ''}`}
            pot={card.table_state.pot}
            random={card.table_state.random}
          />
        </div>
      </div>

      {/* RIGHT: Matrix + Weights - 60% */}
      <div className="w-[60%] flex flex-col overflow-auto">
        {/* Card header */}
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {card.name}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">{card.question}</p>
        </div>

        {/* Matrix + Weight selector row */}
        <div className="flex flex-1 min-h-0">
          {/* Hand matrix */}
          <div className="flex-1 p-4 overflow-auto">
            {!showAnswer && (
              <HandMatrix
                matrix={userMatrix}
                onChange={handleMatrixChange}
                mode="input"
                selectedWeight={selectedWeight}
                action={action}
              />
            )}
            {showAnswer && (
              <ComparisonView
                userMatrix={userMatrix}
                referenceMatrix={card.reference_matrix}
              />
            )}
          </div>

          {/* Vertical weight buttons */}
          {!showAnswer && (
            <div className="w-20 border-l border-[var(--border)] p-2 flex flex-col">
              <WeightSelector
                selectedWeight={selectedWeight}
                onSelectWeight={setSelectedWeight}
              />
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="border-t border-[var(--border)] p-4">
          {!showAnswer && (
            <div className="flex flex-col gap-3">
              <RangeTextInput
                value={rangeText}
                onChange={setRangeText}
                onParse={handleParseRange}
              />
              <button
                onClick={handleShowAnswer}
                className="w-full px-4 py-2.5 rounded-lg bg-[#E8834A] text-white font-semibold hover:bg-[#d67540] transition-colors"
              >
                Show Answer
              </button>
            </div>
          )}

          {showAnswer && (
            <div className="flex gap-2">
              <button
                onClick={() => handleRate(0)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#ef4444] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Again
              </button>
              <button
                onClick={() => handleRate(1)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#eab308] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Hard
              </button>
              <button
                onClick={() => handleRate(2)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#22c55e] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Good
              </button>
              <button
                onClick={() => handleRate(3)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#6366f1] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Easy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
