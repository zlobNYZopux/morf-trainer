"use client";

interface WeightSelectorProps {
  selectedWeight: number;
  onSelectWeight: (weight: number) => void;
}

const TEN_PERCENT_WEIGHTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const QUARTER_WEIGHTS = [25, 50, 75];

export function WeightSelector({
  selectedWeight,
  onSelectWeight,
}: WeightSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: 10% increments */}
      <div className="flex flex-wrap gap-1">
        {TEN_PERCENT_WEIGHTS.map((weight) => (
          <button
            key={weight}
            onClick={() => onSelectWeight(weight)}
            className={`
              px-2 py-1 rounded text-sm font-mono
              ${selectedWeight === weight
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              }
            `}
          >
            {weight}
          </button>
        ))}
      </div>
      
      {/* Row 2: 25% increments */}
      <div className="flex flex-wrap gap-1">
        {QUARTER_WEIGHTS.map((weight) => (
          <button
            key={weight}
            onClick={() => onSelectWeight(weight)}
            className={`
              px-2 py-1 rounded text-sm font-mono
              ${selectedWeight === weight
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              }
            `}
          >
            {weight}
          </button>
        ))}
      </div>
    </div>
  );
}