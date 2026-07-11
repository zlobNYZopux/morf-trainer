"use client";

import { useState } from "react";

interface HandMatrixProps {
  matrix: Record<string, number>;
  selectedHand: string | null;
  onSelectHand: (hand: string) => void;
  mode: "input" | "comparison";
  referenceMatrix?: Record<string, number>;
  userMatrix?: Record<string, number>;
}

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

export function HandMatrix({
  matrix,
  selectedHand,
  onSelectHand,
  mode,
  referenceMatrix,
  userMatrix,
}: HandMatrixProps) {
  const getHandName = (row: number, col: number): string => {
    if (row === col) {
      return `${RANKS[row]}${RANKS[row]}`;
    }
    if (row < col) {
      return `${RANKS[row]}${RANKS[col]}s`;
    }
    return `${RANKS[col]}${RANKS[row]}o`;
  };

  const getCellWeight = (row: number, col: number): number => {
    const handName = getHandName(row, col);
    if (mode === "comparison" && referenceMatrix && userMatrix) {
      const refWeight = referenceMatrix[handName] ?? 0;
      const userWeight = userMatrix[handName] ?? 0;
      return userWeight;
    }
    return matrix[handName] ?? 0;
  };

  const getComparisonStyle = (row: number, col: number): string => {
    if (mode !== "comparison" || !referenceMatrix || !userMatrix) return "";
    
    const handName = getHandName(row, col);
    const refWeight = referenceMatrix[handName] ?? 0;
    const userWeight = userMatrix[handName] ?? 0;
    
    if (refWeight === userWeight) {
      return "border-2 border-[var(--color-success,#22c55e)]";
    }
    if (refWeight > 0 && userWeight === 0) {
      return "border-2 border-[var(--color-warning,#eab308)]";
    }
    if (refWeight === 0 && userWeight > 0) {
      return "border-2 border-[var(--color-purple,#a855f7)]";
    }
    return "border-2 border-[var(--color-error,#ef4444)]";
  };

  const getWeightOpacity = (weight: number): number => {
    return 0.3 + (weight / 100) * 0.7;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Column headers */}
      <div className="flex">
        <div className="w-10 h-10" /> {/* Spacer for row headers */}
        {RANKS.map((rank) => (
          <div
            key={rank}
            className="w-10 h-10 flex items-center justify-center font-mono text-sm font-bold text-[var(--text-secondary)]"
          >
            {rank}
          </div>
        ))}
      </div>

      {/* Matrix rows */}
      {RANKS.map((rowRank, rowIdx) => (
        <div key={rowRank} className="flex">
          {/* Row header */}
          <div className="w-10 h-10 flex items-center justify-center font-mono text-sm font-bold text-[var(--text-secondary)]">
            {rowRank}
          </div>
          
          {/* Cells */}
          {RANKS.map((colRank, colIdx) => {
            const handName = getHandName(rowIdx, colIdx);
            const weight = getCellWeight(rowIdx, colIdx);
            const isSelected = selectedHand === handName;
            const comparisonStyle = getComparisonStyle(rowIdx, colIdx);
            
            return (
              <button
                key={handName}
                onClick={() => onSelectHand(handName)}
                className={`
                  w-10 h-10 flex flex-col items-center justify-center
                  border border-[var(--border-default)] rounded
                  transition-all duration-150
                  ${isSelected ? "ring-2 ring-[var(--accent-primary)]" : ""}
                  ${comparisonStyle}
                  ${weight > 0 ? "bg-[var(--accent-primary)]" : "bg-[var(--bg-secondary)]"}
                `}
                style={{
                  opacity: weight > 0 ? getWeightOpacity(weight) : 1,
                }}
              >
                <span className="font-mono text-[10px] leading-tight text-[var(--text-primary)]">
                  {handName}
                </span>
                {weight > 0 && (
                  <span className="font-mono text-[8px] leading-tight text-[var(--text-primary)] opacity-80">
                    {weight}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}