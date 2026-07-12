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
  actions?: Array<{ player: string; action: string; amount: number }>;
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

  // Calculate pot from actions
  const calculatePot = () => {
    let pot = card.table_state.blinds.small + card.table_state.blinds.big;
    for (const act of card.table_state.actions || []) {
      if (act.action !== "fold" && act.amount > 0) {
        pot += act.amount;
      }
    }
    return Math.round(pot * 10) / 10;
  };
  const pot = calculatePot();

  // Build action history
  const buildActionHistory = () => {
    const history: Array<{ position: string; stack: number; action?: string; amount?: number; isHero: boolean }> = [];
    const allPositions = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
    const actions = card.table_state.actions || [];

    for (const pos of allPositions) {
      const isHero = pos === card.table_state.heroPosition;
      const villain = card.table_state.villainPositions.find((vp) => vp.position === pos);
      const act = actions.find((a) => a.player === pos);

      history.push({
        position: pos,
        stack: isHero ? card.table_state.heroStack : (villain?.stack ?? 100),
        action: act?.action,
        amount: act?.amount,
        isHero,
      });
    }
    return history;
  };

  const actionHistory = buildActionHistory();
  const showHeroAsQuestion = !showAnswer;

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-[var(--background)] overflow-hidden">
      {/* LEFT: Poker Table - 40% */}
      <div className="w-[40%] flex flex-col border-r border-[var(--border)]">
        {/* Action history bar - above table */}
        <div className="px-4 py-4 border-b border-[var(--border)] bg-[#0a0c10]">
          <div className="flex items-center justify-center gap-3 flex-wrap text-base font-mono">
            {/* Action history */}
            <div className="flex items-center justify-center gap-3 flex-wrap text-base font-mono">
            {actionHistory.map((h, i) => {
              const isRaiser = h.action && (h.action.includes("open") || h.action.includes("raise") || h.action.includes("3bet") || h.action.includes("4bet"));
              const isHeroTurn = h.isHero && showHeroAsQuestion;
              return (
                <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className={`
                    px-2 py-1 rounded-md font-semibold
                    ${isRaiser ? "bg-[#e8834A]/20 text-[#e8834A]" : isHeroTurn ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30" : h.isHero ? "text-[#22c55e]" : "text-[#94a3b8]"}
                  `}>{h.position}</span>
                  <span className={`${isRaiser ? "text-[#e8834A]" : "text-[#64748b]"}`}>{h.stack}</span>
                  {h.action && (
                    <span className={`
                      px-2.5 py-1 rounded-md font-bold text-sm
                      ${h.action === "fold" ? "bg-[#1a1d27] text-[#475569] border border-[#333]"
                        : isRaiser ? "bg-[#e8834A] text-white"
                        : h.action.includes("call") ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
                        : "bg-[#1a1d27] text-[#64748b] border border-[#333]"}
                    `}>
                      {h.action === "fold" ? "Fold" : h.action}
                      {h.amount !== undefined && h.amount > 0 && h.action !== "fold" && (
                        <span className="ml-1 opacity-80">{h.amount}</span>
                      )}
                    </span>
                  )}
                  {isHeroTurn && !h.action && (
                    <span className="px-2.5 py-1 rounded-md font-bold text-sm bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30">???</span>
                  )}
                </span>
              );
            })}
            </div>
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
            situation={`${card.table_state.heroPosition} vs. ${card.table_state.villainPositions.find(v => v.action !== "fold")?.position || '?'}${card.table_state.random ? `, ${card.table_state.random}` : ''}`}
            pot={pot}
            random={card.table_state.random}
            showHeroAsQuestion={showHeroAsQuestion}
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
