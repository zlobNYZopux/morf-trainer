"use client";

import { useState } from "react";

interface RangeTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onParse: (parsed: Record<string, number>) => void;
}

export function RangeTextInput({
  value,
  onChange,
  onParse,
}: RangeTextInputProps) {
  const [error, setError] = useState<string | null>(null);

  const parseRange = (input: string): Record<string, number> => {
    const result: Record<string, number> = {};
    const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
    
    const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
    
    for (const part of parts) {
      // Match exact hands like "AA", "AKs", "AKo"
      const exactMatch = part.match(/^([2-9TJQKA])([2-9TJQKA])([so])?$/i);
      if (exactMatch) {
        const [, rank1, rank2, suit] = exactMatch;
        const r1 = rank1.toUpperCase();
        const r2 = rank2.toUpperCase();
        const s = suit?.toLowerCase() || "";
        
        if (r1 === r2) {
          result[r1 + r1] = 100;
        } else if (s === "s") {
          result[r1 + r2 + "s"] = 100;
        } else if (s === "o") {
          result[r2 + r1 + "o"] = 100;
        } else {
          // No suit specified - add both suited and offsuit
          if (ranks.indexOf(r1) < ranks.indexOf(r2)) {
            result[r1 + r2 + "s"] = 100;
            result[r2 + r1 + "o"] = 100;
          } else {
            result[r2 + r1 + "s"] = 100;
            result[r1 + r2 + "o"] = 100;
          }
        }
        continue;
      }
      
      // Match ranges like "AKs-A5s"
      const rangeMatch = part.match(/^([2-9TJQKA])([2-9TJQKA])([so])?-([2-9TJQKA])([2-9TJQKA])([so])?$/i);
      if (rangeMatch) {
        const [, startRank1, startRank2, startSuit, endRank1, endRank2, endSuit] = rangeMatch;
        const sr1 = startRank1.toUpperCase();
        const sr2 = startRank2.toUpperCase();
        const ss = startSuit?.toLowerCase() || "";
        const er1 = endRank1.toUpperCase();
        const er2 = endRank2.toUpperCase();
        const es = endSuit?.toLowerCase() || "";
        
        // Simple range parsing - just mark the endpoints
        // For a proper implementation, we'd need to iterate through all hands in the range
        if (ss === "s" && es === "s") {
          // Suited range like AKs-A5s
          const startIdx = ranks.indexOf(sr2);
          const endIdx = ranks.indexOf(er2);
          for (let i = startIdx; i >= endIdx; i--) {
            result[sr1 + ranks[i] + "s"] = 100;
          }
        } else if (ss === "o" && es === "o") {
          // Offsuit range
          const startIdx = ranks.indexOf(sr2);
          const endIdx = ranks.indexOf(er2);
          for (let i = startIdx; i >= endIdx; i--) {
            result[ranks[i] + sr1 + "o"] = 100;
          }
        } else {
          // Mixed range - just mark the endpoints
          result[sr1 + sr2 + (ss || "")] = 100;
          result[er1 + er2 + (es || "")] = 100;
        }
        continue;
      }
      
      // If nothing matched, skip
      continue;
    }
    
    return result;
  };

  const handleParse = () => {
    try {
      setError(null);
      const parsed = parseRange(value);
      onParse(parsed);
    } catch {
      setError("Failed to parse range");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="AA, AKs-A5s, KK, KQs-K9s..."
        className="w-full h-20 px-3 py-2 rounded border border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
      />
      <button
        onClick={handleParse}
        className="px-4 py-2 rounded bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-hover)] transition-colors"
      >
        Parse Range
      </button>
      {error && (
        <div className="text-sm text-[var(--color-error,#ef4444)]">{error}</div>
      )}
    </div>
  );
}