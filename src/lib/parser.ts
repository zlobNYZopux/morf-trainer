const SUITS = ["s", "o"];
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

function rankIndex(rank: string): number {
  return RANKS.indexOf(rank);
}

function expandRange(
  firstRank: string,
  startRank: string,
  endRank: string,
  suitType: "s" | "o" | "pair"
): string[] {
  const fi = rankIndex(firstRank);
  const si = rankIndex(startRank);
  const ei = rankIndex(endRank);
  if (fi === -1 || si === -1 || ei === -1) return [];

  const hands: string[] = [];
  const lo = Math.min(si, ei);
  const hi = Math.max(si, ei);
  for (let i = lo; i <= hi; i++) {
    const rank = RANKS[i];
    if (suitType === "pair") {
      hands.push(`${rank}${rank}`);
    } else {
      hands.push(`${firstRank}${rank}${suitType}`);
    }
  }
  return hands;
}

function isValidHand(hand: string): boolean {
  if (hand.length === 2) {
    return hand[0] === hand[1] && RANKS.includes(hand[0]);
  }
  if (hand.length === 3) {
    return (
      RANKS.includes(hand[0]) &&
      RANKS.includes(hand[1]) &&
      SUITS.includes(hand[2].toLowerCase())
    );
  }
  return false;
}

/** Normalize hand to canonical format: ranks uppercase, suit lowercase */
function normalizeHandKey(hand: string): string {
  if (hand.length === 2) return hand.toUpperCase();
  if (hand.length === 3) {
    return hand[0].toUpperCase() + hand[1].toUpperCase() + hand[2].toLowerCase();
  }
  return hand.toUpperCase();
}

/**
 * Parse a Flopzilla-style range string.
 * Supports: pairs (AA), suited (AKs), offsuit (AKo), ranges (AKs-A5s, AA-TT)
 */
export function parseFlopzilla(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};
  const parts = rangeText.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (!part) continue;

    // Range: "AKs-A5s", "AA-TT", "AKo-AJo", "KK-QQ", etc.
    // Match: 2 chars + optional suit, dash, 2 chars + optional suit
    const rangeMatch = part.match(
      /^([A-Z2-9])([A-Z2-9])([so])?-([A-Z2-9])([A-Z2-9])([so])?$/i
    );
    if (rangeMatch) {
      const s1 = rangeMatch[1].toUpperCase();
      const s2 = rangeMatch[2].toUpperCase();
      const sSuit = rangeMatch[3]?.toLowerCase();
      const e1 = rangeMatch[4].toUpperCase();
      const e2 = rangeMatch[5].toUpperCase();
      const eSuit = rangeMatch[6]?.toLowerCase();

      let suitType: "s" | "o" | "pair";
      if (sSuit === "s" || eSuit === "s") suitType = "s";
      else if (sSuit === "o" || eSuit === "o") suitType = "o";
      else if (s1 === s2 && e1 === e2) suitType = "pair";
      else suitType = "s"; // default for ambiguous ranges

      if (suitType === "pair") {
        // Pair range: AA-TT → expand from A to T
        const hands = expandRange(s1, s1, e1, "pair");
        for (const hand of hands) {
          if (isValidHand(hand)) {
            matrix[hand] = 100;
          }
        }
      } else {
        // Suited/offsuit range: AKs-A5s → first rank fixed, second rank expands
        const hands = expandRange(s1, s2, e2, suitType);
        for (const hand of hands) {
          if (isValidHand(hand)) {
            matrix[hand] = 100;
          }
        }
      }
      continue;
    }

    // Single pair: "AA", "KK"
    if (part.length === 2 && part[0].toUpperCase() === part[1].toUpperCase() && RANKS.includes(part[0].toUpperCase())) {
      matrix[part.toUpperCase()] = 100;
      continue;
    }

    // Suited or offsuit hand: "AKs", "AKo" → normalize to "AKs" (ranks upper, suit lower)
    if (part.length === 3 && SUITS.includes(part[2].toLowerCase())) {
      const normalized = part[0].toUpperCase() + part[1].toUpperCase() + part[2].toLowerCase();
      if (isValidHand(normalized)) {
        matrix[normalized] = 100;
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
      /^([A-Z2-9]{2}[so]?)[\s,:\t]+(\d+(?:\.\d+)?)\s*%?\s*$/i
    );
    if (match) {
      const hand = normalizeHandKey(match[1]);
      const weight = parseFloat(match[2]);
      if (isValidHand(hand)) {
        matrix[hand] = weight;
      }
      continue;
    }

    // Try just hand name (default 100%)
    const handOnly = line.match(/^([A-Z2-9]{2}[so]?)\s*$/i);
    if (handOnly) {
      const hand = normalizeHandKey(handOnly[1]);
      if (isValidHand(hand)) {
        matrix[hand] = 100;
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
      /^([A-Z2-9]{2}[so]?)\s*[:\s]\s*(\d+(?:\.\d+)?)\s*%?\s*$/i
    );
    if (match) {
      const hand = normalizeHandKey(match[1]);
      const weight = parseFloat(match[2]);
      if (isValidHand(hand)) {
        matrix[hand] = weight;
      }
      continue;
    }

    // Try just hand name (default 100%)
    const handOnly = part.match(/^([A-Z2-9]{2}[so]?)\s*$/i);
    if (handOnly) {
      const hand = normalizeHandKey(handOnly[1]);
      if (isValidHand(hand)) {
        matrix[hand] = 100;
      }
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
        if (hand) {
          const normalized = normalizeHandKey(String(hand));
          if (isValidHand(normalized)) {
            matrix[normalized] = Number(weight);
          }
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
      /^([A-Z2-9]{2}[so]?)\s*[:\s,]\s*(\d+(?:\.\d+)?)\s*%?\s*$/i
    );
    if (match) {
      const hand = normalizeHandKey(match[1]);
      const weight = parseFloat(match[2]);
      if (isValidHand(hand)) {
        matrix[hand] = weight;
      }
      continue;
    }

    const handOnly = line.match(/^([A-Z2-9]{2}[so]?)\s*$/i);
    if (handOnly) {
      const hand = normalizeHandKey(handOnly[1]);
      if (isValidHand(hand)) {
        matrix[hand] = 100;
      }
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
