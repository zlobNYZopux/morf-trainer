"use client";

import React, { useCallback, useRef, useState } from "react";

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

function getHandName(row: number, col: number): string {
  if (row === col) return `${RANKS[row]}${RANKS[row]}`;
  if (row < col) return `${RANKS[row]}${RANKS[col]}s`;
  return `${RANKS[col]}${RANKS[row]}o`;
}

interface HandMatrixProps {
  matrix: Record<string, number>;
  onChange: (matrix: Record<string, number>) => void;
  mode: "input" | "comparison";
  referenceMatrix?: Record<string, number>;
  selectedWeight?: number;
  action?: "fold" | "call" | "raise" | "check";
}

export function HandMatrix({
  matrix,
  onChange,
  mode,
  referenceMatrix,
  selectedWeight = 100,
  action = "raise",
}: HandMatrixProps) {
  const isDragging = useRef(false);
  const [hoverCell, setHoverCell] = useState<string | null>(null);
  const [fillVertical, setFillVertical] = useState(true);

  const getCellWeight = useCallback(
    (handName: string): number => {
      return matrix[handName] ?? 0;
    },
    [matrix]
  );

  const getComparisonStatus = useCallback(
    (handName: string): "correct" | "wrong" | "missing" | "extra" | null => {
      if (mode !== "comparison" || !referenceMatrix) return null;
      const refWeight = referenceMatrix[handName] ?? 0;
      const userWeight = matrix[handName] ?? 0;
      if (refWeight === userWeight) return "correct";
      if (refWeight > 0 && userWeight === 0) return "missing";
      if (refWeight === 0 && userWeight > 0) return "extra";
      return "wrong";
    },
    [mode, referenceMatrix, matrix]
  );

  const paintCell = useCallback(
    (handName: string) => {
      if (mode !== "input") return;
      const currentWeight = matrix[handName] ?? 0;
      // Toggle: if same weight, reset to 0
      const newWeight = currentWeight === selectedWeight ? 0 : selectedWeight;
      const newMatrix = { ...matrix, [handName]: newWeight };
      onChange(newMatrix);
    },
    [mode, matrix, selectedWeight, onChange]
  );

  const handleMouseDown = useCallback(
    (handName: string) => {
      isDragging.current = true;
      paintCell(handName);
    },
    [paintCell]
  );

  const handleMouseEnter = useCallback(
    (handName: string) => {
      setHoverCell(handName);
      if (isDragging.current) {
        paintCell(handName);
      }
    },
    [paintCell]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Stats for bottom bar
  const allHands: string[] = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      allHands.push(getHandName(r, c));
    }
  }

  const handsWithWeight = allHands.filter((h) => (matrix[h] ?? 0) > 0);
  const totalCombos = handsWithWeight.reduce((sum, h) => {
    const w = matrix[h] ?? 0;
    const combos = getComboCount(h);
    return sum + Math.round((w / 100) * combos);
  }, 0);

  const foldPercent = Math.round(
    ((allHands.length - handsWithWeight.length) / allHands.length) * 100
  );
  const raisePercent = 100 - foldPercent;

  const actionLabel =
    action === "fold"
      ? "Fold"
      : action === "call"
      ? "Call"
      : action === "check"
      ? "Check"
      : "Raise";

  return (
    <div className="flex flex-col items-center select-none">
      {/* Matrix grid */}
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `2rem repeat(13, 3rem)`,
          gridTemplateRows: `1.5rem repeat(13, 3rem)`,
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Top-left corner */}
        <div />

        {/* Column headers */}
        {RANKS.map((rank) => (
          <div
            key={`col-${rank}`}
            className="flex items-center justify-center text-xs font-bold text-[#64748b]"
          >
            {rank}
          </div>
        ))}

        {/* Rows */}
        {RANKS.map((rowRank, rowIdx) => (
          <React.Fragment key={`row-${rowRank}`}>
            {/* Row header */}
            <div
              className="flex items-center justify-center text-xs font-bold text-[#64748b]"
            >
              {rowRank}
            </div>

            {/* Cells */}
            {RANKS.map((colRank, colIdx) => {
              const handName = getHandName(rowIdx, colIdx);
              const weight = getCellWeight(handName);
              const isPair = rowIdx === colIdx;
              const isSuited = rowIdx < colIdx && !isPair;
              const status = getComparisonStatus(handName);

              let cellClass = "hand-cell";
              if (isPair) cellClass += " pair";
              if (status) cellClass += ` compare-${status}`;

              return (
                <div
                  key={handName}
                  className={cellClass}
                  onMouseDown={() => handleMouseDown(handName)}
                  onMouseEnter={() => handleMouseEnter(handName)}
                  title={`${handName}: ${weight}%`}
                >
                  <div
                    className={`hand-cell-fill ${fillVertical ? "fill-vertical" : "fill-horizontal"}`}
                    style={fillVertical 
                      ? { "--fill-h": `${weight}%` } as React.CSSProperties 
                      : { "--fill-w": `${weight}%` } as React.CSSProperties
                    }
                  />
                  <span
                    className="hand-cell-label"
                  >
                    {handName}
                  </span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom stats bar */}
      <div className="mt-4 flex items-center gap-4 text-xs text-[#64748b] font-mono">
        <span>
          <span className="text-[#94a3b8]">{action} </span>
          <span className="text-[#e2e8f0] font-semibold">{raisePercent}%</span>
        </span>
        <span>
          <span className="text-[#94a3b8]">Fold </span>
          <span className="text-[#e2e8f0] font-semibold">{foldPercent}%</span>
        </span>
        <span className="text-[#334155]">|</span>
        <span>
          <span className="text-[#94a3b8]">combos: </span>
          <span className="text-[#e2e8f0] font-semibold">{totalCombos}</span>
        </span>
        {mode === "input" && (
          <>
            <button
              onClick={() => setFillVertical(!fillVertical)}
              className="ml-2 px-3 py-1 rounded bg-[#333] hover:bg-[#444] text-[#94a3b8] hover:text-white text-xs transition-colors"
              title="Toggle fill direction"
            >
              {fillVertical ? "↕" : "↔"}
            </button>
            <button
              onClick={() => {
                const empty: Record<string, number> = {};
                allHands.forEach((h) => (empty[h] = 0));
                onChange(empty);
              }}
              className="px-3 py-1 rounded bg-[#333] hover:bg-[#444] text-[#94a3b8] hover:text-white text-xs transition-colors"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function getComboCount(hand: string): number {
  const isPair = hand.length === 2;
  const isSuited = hand.endsWith("s");
  if (isPair) return 6;
  if (isSuited) return 4;
  return 12;
}
