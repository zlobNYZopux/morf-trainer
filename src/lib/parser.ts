const SUITS = ["s", "o"];
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

function rankIndex(rank: string): number {
  return RANKS.indexOf(rank);
}

function expandRange(
  start: string,
  end: string,
  suitType: "s" | "o" | "pair"
): string[] {
  const sRank = start.replace(/[so]$/, "");
  const eRank = end.replace(/[so]$/, "");
  const si = rankIndex(sRank);
  const ei = rankIndex(eRank);
  if (si === -1 || ei === -1) return [];

  const hands: string[] = [];
  const lo = Math.max(si, ei);
  const hi = Math.min(si, ei);
  for (let i = hi; i <= lo; i++) {
    const rank = RANKS[i];
    if (suitType === "pair") {
      hands.push(`${rank}${rank}`);
    } else {
      hands.push(`${rank}${rank}${suitType}`);
    }
  }
  return hands;
}

function handToKey(hand: string): string {
  if (hand.length === 2) return hand;
  if (hand.length === 4 && hand[2] === hand[3]) return hand.slice(0, 2);
  return hand;
}

function isSuited(hand: string): boolean {
  return hand.endsWith("s") && hand.length === 3;
}

function isOffsuit(hand: string): boolean {
  return hand.endsWith("o") && hand.length === 3;
}

export function parseRange(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};
  const parts = rangeText.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (!part) continue;

    const rangeMatch = part.match(/^([A-Z2-9][so]?)-([A-Z2-9][so]?)$/);
    if (rangeMatch) {
      const [, start, end] = rangeMatch;
      const startSuited = isSuited(start);
      const startOffsuit = isOffsuit(start);
      const endSuited = isSuited(end);
      const endOffsuit = isOffsuit(end);

      let suitType: "s" | "o" | "pair";
      if (startSuited || endSuited) suitType = "s";
      else if (startOffsuit || endOffsuit) suitType = "o";
      else suitType = "pair";

      const hands = expandRange(start, end, suitType);
      for (const hand of hands) {
        const key = handToKey(hand);
        matrix[key] = (matrix[key] || 0) + 100;
      }
      continue;
    }

    const pairMatch = part.match(/^([A-Z2-9])2$/);
    if (pairMatch) {
      matrix[pairMatch[1] + pairMatch[1]] = 100;
      continue;
    }

    if (part.length === 3 && SUITS.includes(part[2])) {
      const key = handToKey(part);
      matrix[key] = (matrix[key] || 0) + 100;
    } else if (part.length === 2) {
      matrix[part] = (matrix[part] || 0) + 100;
    }
  }

  return matrix;
}
