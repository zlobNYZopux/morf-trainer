"use client";

import { useState, useEffect } from "react";

interface WeightSelectorProps {
  selectedWeight: number;
  onSelectWeight: (weight: number) => void;
}

const QUICK_WEIGHTS = [100, 90, 75, 70, 60, 50, 40, 30, 25, 20, 10, 0];

export function WeightSelector({
  selectedWeight,
  onSelectWeight,
}: WeightSelectorProps) {
  const [inputValue, setInputValue] = useState(String(selectedWeight));

  useEffect(() => {
    setInputValue(String(selectedWeight));
  }, [selectedWeight]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onSelectWeight(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(val);
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num)) {
      onSelectWeight(Math.max(0, Math.min(100, num)));
    } else {
      setInputValue(String(selectedWeight));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 h-full py-2">
      {/* Quick buttons */}
      <div className="flex flex-col gap-1.5">
        {QUICK_WEIGHTS.map((weight) => (
          <button
            key={weight}
            onClick={() => onSelectWeight(weight)}
            className={`
              w-14 h-8 rounded-md font-semibold text-xs transition-all
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

      {/* Divider */}
      <div className="w-full border-t border-[#333]" />

      {/* Vertical slider */}
      <div className="flex-1 flex items-center justify-center min-h-[160px]">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={selectedWeight}
          onChange={handleSliderChange}
          className="slider-vertical"
          style={{
            writingMode: "vertical-lr" as const,
            direction: "rtl",
            width: "8px",
            height: "160px",
            appearance: "none" as const,
            background: `linear-gradient(to top, #E8834A ${selectedWeight}%, #2a2a2a ${selectedWeight}%)`,
            borderRadius: "4px",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Manual input */}
      <div className="flex flex-col items-center gap-0.5">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-14 h-8 rounded bg-[#1a1d27] border border-[#333] text-center text-sm text-[#e2e8f0] font-mono outline-none focus:border-[#E8834A]"
          maxLength={3}
        />
        <span className="text-[10px] text-[#64748b]">%</span>
      </div>
    </div>
  );
}
