"use client";

interface WeightSelectorProps {
  selectedWeight: number;
  onSelectWeight: (weight: number) => void;
}

const PRIMARY_WEIGHTS = [100, 75, 50, 25, 0];
const SECONDARY_WEIGHTS = [90, 80, 70, 60, 40, 30, 20, 10];

export function WeightSelector({
  selectedWeight,
  onSelectWeight,
}: WeightSelectorProps) {
  return (
    <div className="flex gap-1">
      {/* Primary column: 100, 75, 50, 25, 0 */}
      <div className="flex flex-col gap-1">
        {PRIMARY_WEIGHTS.map((weight) => (
          <button
            key={weight}
            onClick={() => onSelectWeight(weight)}
            className={`weight-btn ${selectedWeight === weight ? "active" : ""}`}
          >
            {weight}%
          </button>
        ))}
      </div>

      {/* Secondary column: 90-10 */}
      <div className="flex flex-col gap-1">
        {SECONDARY_WEIGHTS.map((weight) => (
          <button
            key={weight}
            onClick={() => onSelectWeight(weight)}
            className={`weight-btn ${selectedWeight === weight ? "active" : ""}`}
          >
            {weight}%
          </button>
        ))}
      </div>
    </div>
  );
}
