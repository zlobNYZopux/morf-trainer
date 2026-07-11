"use client";

import { HandMatrix } from "./HandMatrix";

interface ComparisonViewProps {
  userMatrix: Record<string, number>;
  referenceMatrix: Record<string, number>;
}

export function ComparisonView({
  userMatrix,
  referenceMatrix,
}: ComparisonViewProps) {
  const calculateStats = () => {
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

    return { correct, wrong, missing, extra };
  };

  const stats = calculateStats();
  const total = stats.correct + stats.wrong + stats.missing + stats.extra;
  const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats display */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span className="text-foreground">Correct: {stats.correct}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-danger" />
          <span className="text-foreground">Wrong: {stats.wrong}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning" />
          <span className="text-foreground">Missing: {stats.missing}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-foreground">Extra: {stats.extra}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">Accuracy: {accuracy}%</span>
        </div>
      </div>

      {/* Hand matrix in comparison mode */}
      <HandMatrix
        matrix={userMatrix}
        onChange={() => {}}
        mode="comparison"
        referenceMatrix={referenceMatrix}
      />
    </div>
  );
}
