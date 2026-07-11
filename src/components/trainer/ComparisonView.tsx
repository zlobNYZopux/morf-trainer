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
          <div className="w-3 h-3 rounded bg-[var(--color-success,#22c55e)]" />
          <span className="text-[var(--text-primary)]">Correct: {stats.correct}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--color-error,#ef4444)]" />
          <span className="text-[var(--text-primary)]">Wrong: {stats.wrong}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--color-warning,#eab308)]" />
          <span className="text-[var(--text-primary)]">Missing: {stats.missing}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[var(--color-purple,#a855f7)]" />
          <span className="text-[var(--text-primary)]">Extra: {stats.extra}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--text-primary)]">Accuracy: {accuracy}%</span>
        </div>
      </div>

      {/* Hand matrix in comparison mode */}
      <HandMatrix
        matrix={{}}
        selectedHand={null}
        onSelectHand={() => {}}
        mode="comparison"
        referenceMatrix={referenceMatrix}
        userMatrix={userMatrix}
      />
    </div>
  );
}