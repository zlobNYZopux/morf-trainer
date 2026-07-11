"use client";

interface WeightSelectorProps {
  selectedWeight: number;
  onSelectWeight: (weight: number) => void;
}

const WEIGHTS = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0];

export function WeightSelector({
  selectedWeight,
  onSelectWeight,
}: WeightSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {WEIGHTS.map((weight) => (
        <button
          key={weight}
          onClick={() => onSelectWeight(weight)}
          className={`
            w-full h-9 rounded-md font-semibold text-sm transition-all
            ${
              selectedWeight === weight
                ? "bg-[#E8834A] text-white shadow-md"
                : "bg-[#2a2a2a] text-[#94a3b8] hover:bg-[#333] hover:text-[#e2e8f0]"
            }
          `}
        >
          {weight}
        </button>
      ))}
    </div>
  );
}
