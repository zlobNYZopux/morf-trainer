"use client";

import { useCallback } from "react";

interface HandMatrixProps {
  matrix: Record<string, number>;
  selectedHand: string | null;
  onSelectHand: (hand: string) => void;
  mode: "input" | "comparison" | "editable";
  referenceMatrix?: Record<string, number>;
  userMatrix?: Record<string, number>;
  onMatrixChange?: (hand: string, value: number) => void;
}

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

export function HandMatrix({
  matrix,
  selectedHand,
  onSelectHand,
  mode,
  referenceMatrix,
  userMatrix,
  onMatrixChange,
}: HandMatrixProps) {
  const getHandName = useCallback((row: number, col: number): string => {
    if (row === col) {
      return `${RANKS[row]}${RANKS[row]}`;
    }
    if (row < col) {
      return `${RANKS[row]}${RANKS[col]}s`;
    }
    return `${RANKS[col]}${RANKS[row]}o`;
  }, []);

  const getCellWeight = (row: number, col: number): number => {
    const handName = getHandName(row, col);
    if (mode === "comparison" && referenceMatrix && userMatrix) {
      return userMatrix[handName] ?? 0;
    }
    return matrix[handName] ?? 0;
  };

  const getComparisonStatus = (row: number, col: number): "correct" | "wrong" | "missing" | "extra" | null => {
    if (mode !== "comparison" || !referenceMatrix || !userMatrix) return null;
    const handName = getHandName(row, col);
    const refWeight = referenceMatrix[handName] ?? 0;
    const userWeight = userMatrix[handName] ?? 0;

    if (refWeight === userWeight) return "correct";
    if (refWeight > 0 && userWeight === 0) return "missing";
    if (refWeight === 0 && userWeight > 0) return "extra";
    return "wrong";
  };

  const getWeightColor = (weight: number, isPair: boolean, isSuited: boolean): string => {
    if (weight === 0) return "bg-muted text-muted-foreground";
    if (isPair) return "bg-primary/20 text-primary border-primary/30";
    if (isSuited) return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
    return "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30";
  };

  const getComparisonClass = (status: "correct" | "wrong" | "missing" | "extra" | null): string => {
    if (!status) return "";
    switch (status) {
      case "correct": return "bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400";
      case "wrong": return "bg-yellow-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-400";
      case "missing": return "bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-400";
      case "extra": return "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-400";
    }
  };

  const handleCellClick = (handName: string) => {
    if (mode === "editable" && onMatrixChange) {
      const currentWeight = matrix[handName] ?? 0;
      onMatrixChange(handName, currentWeight > 0 ? 0 : 100);
    }
    onSelectHand(handName);
  };

  const handleWheel = (handName: string, e: React.WheelEvent) => {
    if (mode !== "editable" || !onMatrixChange) return;
    e.preventDefault();
    const currentWeight = matrix[handName] ?? 0;
    const delta = e.deltaY < 0 ? 10 : -10;
    const newWeight = Math.max(0, Math.min(100, currentWeight + delta));
    onMatrixChange(handName, newWeight);
  };

  return (
    <div className="flex flex-col items-center gap-1 overflow-x-auto">
      {/* Column headers */}
      <div className="grid gap-px" style={{ gridTemplateColumns: `2.25rem repeat(13, 2.75rem)` }}>
        <div />
        {RANKS.map((rank) => (
          <div
            key={rank}
            className="flex items-center justify-center font-mono text-xs font-bold text-muted-foreground"
          >
            {rank}
          </div>
        ))}
      </div>

      {/* Matrix rows */}
      {RANKS.map((rowRank, rowIdx) => (
        <div
          key={rowRank}
          className="grid gap-px"
          style={{ gridTemplateColumns: `2.25rem repeat(13, 2.75rem)` }}
        >
          <div className="flex items-center justify-center font-mono text-xs font-bold text-muted-foreground">
            {rowRank}
          </div>

          {RANKS.map((colRank, colIdx) => {
            const handName = getHandName(rowIdx, colIdx);
            const weight = getCellWeight(rowIdx, colIdx);
            const isSelected = selectedHand === handName;
            const status = getComparisonStatus(rowIdx, colIdx);
            const isPair = rowIdx === colIdx;
            const isSuited = rowIdx < colIdx && !isPair;
            const colorClass = status
              ? getComparisonClass(status)
              : getWeightColor(weight, isPair, isSuited);

            return (
              <button
                key={handName}
                onClick={() => handleCellClick(handName)}
                onWheel={(e) => handleWheel(handName, e)}
                className={`
                  h-11 flex flex-col items-center justify-center
                  border border-border rounded-md transition-all duration-100
                  ${isSelected ? "ring-2 ring-primary shadow-md z-10" : ""}
                  ${colorClass}
                  ${mode === "editable" ? "cursor-pointer hover:brightness-90" : "cursor-pointer hover:brightness-110"}
                `}
                title={mode === "editable" ? `${handName}: ${weight}% (click to toggle, scroll to adjust)` : handName}
              >
                <span
                  className={`font-mono text-[10px] leading-tight ${
                    isPair
                      ? "font-bold"
                      : isSuited
                      ? "font-medium"
                      : "opacity-80"
                  }`}
                >
                  {handName}
                </span>
                <span className="font-mono text-[8px] leading-tight opacity-70">
                  {weight}%
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
