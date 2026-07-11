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
  // Higher rank index = lower card (e.g. index 0=A, index 12=2)
  const lo = Math.min(si, ei); // higher card in hand terms
  const hi = Math.max(si, ei); // lower card in hand terms
  for (let i = lo; i <= hi; i++) {
    const rank = RANKS[i];
    if (suitType === "pair") {
      hands.push(`${rank}${rank}`);
    } else {
      hands.push(`${RANKS[lo]}${rank}${suitType}`);
    }
  }
  return hands;
}

function normalizeHand(hand: string): string {
  // "AA" -> "AA", "AKs" -> "AKs", "AKo" -> "AKo"
  return hand;
}

function isValidHand(hand: string): boolean {
  if (hand.length === 2) {
    return hand[0] === hand[1] && RANKS.includes(hand[0]);
  }
  if (hand.length === 3) {
    return (
      RANKS.includes(hand[0]) &&
      RANKS.includes(hand[1]) &&
      SUITS.includes(hand[2])
    );
  }
  return false;
}

/**
 * Parse a Flopzilla-style range string.
 * Supports: pairs (AA), suited (AKs), offsuit (AKo), ranges (AKs-A5s, AA-TT)
 */
export function parseFlopzilla(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};
  const parts = rangeText.split(",").map((s) => s.trim().toUpperCase());

  for (const part of parts) {
    if (!part) continue;

    // Range: "AKs-A5s", "AA-TT", "AKo-AJo", etc.
    const rangeMatch = part.match(
      /^([A-Z2-9])([A-Z2-9])([so])?-([A-Z2-9])([A-Z2-9])([so])?$/
    );
    if (rangeMatch) {
      const [, s1, s2, sSuit, e1, e2, eSuit] = rangeMatch;
      const startKey = s1 + s2 + (sSuit || "");
      const endKey = e1 + e2 + (eSuit || "");

      let suitType: "s" | "o" | "pair";
      if (sSuit === "s" || eSuit === "s") suitType = "s";
      else if (sSuit === "o" || eSuit === "o") suitType = "o";
      else if (s1 === s2 && e1 === e2) suitType = "pair";
      else suitType = "s"; // default for ambiguous ranges

      const hands = expandRange(startKey, endKey, suitType);
      for (const hand of hands) {
        if (isValidHand(hand)) {
          matrix[hand] = 100;
        }
      }
      continue;
    }

    // Single pair: "AA", "KK"
    if (part.length === 2 && part[0] === part[1] && RANKS.includes(part[0])) {
      matrix[part] = 100;
      continue;
    }

    // Suited or offsuit hand: "AKs", "AKo"
    if (part.length === 3 && SUITS.includes(part[2])) {
      if (isValidHand(part)) {
        matrix[part] = 100;
      }
      continue;
    }
  }

  return matrix;
}

/**
 * Parse Anki export format.
 * Expected: lines like "AA:100", "AKs:50", or tab-separated "AA\t100"
 */
export function parseAnki(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};
  const lines = rangeText.split("\n").map((s) => s.trim());

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;

    // Try "hand:weight" or "hand,weight" or "hand\tweight"
    const match = line.match(
      /^([A-Z2-9][so]?)[\s,:\t]+(\d+(?:\.\d+)?)\s*%?\s*$/
    );
    if (match) {
      const [, hand, weight] = match;
      if (isValidHand(hand)) {
        matrix[hand] = parseFloat(weight);
      }
      continue;
    }

    // Try just hand name (default 100%)
    const handOnly = line.match(/^([A-Z2-9][so]?)\s*$/);
    if (handOnly) {
      if (isValidHand(handOnly[1])) {
        matrix[handOnly[1]] = 100;
      }
    }
  }

  return matrix;
}

/**
 * Parse PioSolver export format.
 * Expected: comma or newline separated hands, optionally with weights.
 * Format: "AA 100, AKs 50, AKo 30" or "AA:100\nAKs:50"
 */
export function parsePioSolver(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};

  // Split on commas or newlines
  const parts = rangeText.split(/[,\n]+/).map((s) => s.trim());

  for (const part of parts) {
    if (!part) continue;

    // Try "hand weight" or "hand:weight"
    const match = part.match(
      /^([A-Z2-9][so]?)\s*[:\s]\s*(\d+(?:\.\d+)?)\s*%?\s*$/
    );
    if (match) {
      const [, hand, weight] = match;
      if (isValidHand(hand)) {
        matrix[hand] = parseFloat(weight);
      }
      continue;
    }

    // Try just hand name (default 100%)
    const handOnly = part.match(/^([A-Z2-9][so]?)\s*$/);
    if (handOnly && isValidHand(handOnly[1])) {
      matrix[handOnly[1]] = 100;
    }
  }

  return matrix;
}

/**
 * Parse Simple Postflop export format.
 * Expected: JSON array of { hand, weight } or CSV-like format.
 */
export function parseSimplePostflop(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};

  // Try JSON first
  try {
    const parsed = JSON.parse(rangeText);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const hand = item.hand || item.Hand || item.name;
        const weight = item.weight || item.Weight || item.freq || 100;
        if (hand && isValidHand(String(hand).toUpperCase())) {
          matrix[String(hand).toUpperCase()] = Number(weight);
        }
      }
      return matrix;
    }
  } catch {
    // Not JSON, try line-based format
  }

  // Line-based: "hand weight" or "hand:weight"
  const lines = rangeText.split("\n").map((s) => s.trim());
  for (const line of lines) {
    if (!line) continue;

    const match = line.match(
      /^([A-Z2-9][so]?)\s*[:\s,]\s*(\d+(?:\.\d+)?)\s*%?\s*$/
    );
    if (match) {
      const [, hand, weight] = match;
      if (isValidHand(hand)) {
        matrix[hand] = parseFloat(weight);
      }
      continue;
    }

    const handOnly = line.match(/^([A-Z2-9][so]?)\s*$/);
    if (handOnly && isValidHand(handOnly[1])) {
      matrix[handOnly[1]] = 100;
    }
  }

  return matrix;
}

/**
 * Parse JSON format.
 * Expected: { "name": "...", "reference_matrix": { "AA": 100, ... } }
 * or array of such objects.
 */
export function parseJSON(rangeText: string): Array<{ name: string; referenceMatrix: Record<string, number> }> {
  const parsed = JSON.parse(rangeText);
  const cards = Array.isArray(parsed) ? parsed : [parsed];

  return cards.map((c: Record<string, unknown>) => ({
    name: String((c.name as string) || "Imported Card"),
    referenceMatrix: (c.reference_matrix as Record<string, number>) || {},
  }));
}

export type ParseFormat = "flopzilla" | "anki" | "piosolver" | "simplepostflop" | "json";

export function parse(
  input: string,
  format: ParseFormat
): Array<{ name: string; referenceMatrix: Record<string, number> }> {
  const trimmed = input.trim();
  if (!trimmed) return [];

  switch (format) {
    case "json":
      return parseJSON(trimmed);
    case "flopzilla": {
      const matrix = parseFlopzilla(trimmed);
      return Object.keys(matrix).length > 0
        ? [{ name: "Flopzilla Import", referenceMatrix: matrix }]
        : [];
    }
    case "anki": {
      const matrix = parseAnki(trimmed);
      return Object.keys(matrix).length > 0
        ? [{ name: "Anki Import", referenceMatrix: matrix }]
        : [];
    }
    case "piosolver": {
      const matrix = parsePioSolver(trimmed);
      return Object.keys(matrix).length > 0
        ? [{ name: "PioSolver Import", referenceMatrix: matrix }]
        : [];
    }
    case "simplepostflop": {
      const matrix = parseSimplePostflop(trimmed);
      return Object.keys(matrix).length > 0
        ? [{ name: "Simple Postflop Import", referenceMatrix: matrix }]
        : [];
    }
    default:
      return [];
  }
}
