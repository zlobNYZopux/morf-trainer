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
    <div className="flex flex-col gap-2 w-full">
      {/* Quick buttons */}
      {QUICK_WEIGHTS.map((weight) => (
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

      {/* Divider */}
      <div className="border-t border-[#333] my-1" />

      {/* Slider */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={selectedWeight}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #E8834A ${selectedWeight}%, #2a2a2a ${selectedWeight}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-[#64748b]">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Manual input */}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-14 h-8 rounded bg-[#1a1d27] border border-[#333] text-center text-sm text-[#e2e8f0] font-mono outline-none focus:border-[#E8834A]"
          maxLength={3}
        />
        <span className="text-xs text-[#64748b]">%</span>
      </div>
    </div>
  );
}
