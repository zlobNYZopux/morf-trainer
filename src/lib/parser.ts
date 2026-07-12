const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

function rankIndex(rank: string): number {
  return RANKS.indexOf(rank.toUpperCase());
}

function isValidHand(hand: string): boolean {
  if (hand.length === 2) {
    return hand[0].toUpperCase() === hand[1].toUpperCase() && RANKS.includes(hand[0].toUpperCase());
  }
  if (hand.length === 3) {
    const suit = hand[2].toLowerCase();
    return (
      RANKS.includes(hand[0].toUpperCase()) &&
      RANKS.includes(hand[1].toUpperCase()) &&
      (suit === "s" || suit === "o")
    );
  }
  return false;
}

function normalizeHand(hand: string): string {
  if (hand.length === 2) return hand.toUpperCase();
  if (hand.length === 3) return hand[0].toUpperCase() + hand[1].toUpperCase() + hand[2].toLowerCase();
  return hand.toUpperCase();
}

/**
 * Expand a single range like "AKs-A5s", "AA-TT", "K8s-K2s", "Q7s-Q4s"
 */
function expandSingleRange(range: string): string[] {
  const hands: string[] = [];

  // Pair range: "AA-TT", "88-44", "33-22"
  const pairMatch = range.match(/^([A2-9TJQKA])\2-([A2-9TJQKA])\2$/i);
  if (pairMatch) {
    const startIdx = rankIndex(pairMatch[1]);
    const endIdx = rankIndex(pairMatch[2]);
    const lo = Math.min(startIdx, endIdx);
    const hi = Math.max(startIdx, endIdx);
    for (let i = lo; i <= hi; i++) {
      hands.push(`${RANKS[i]}${RANKS[i]}`);
    }
    return hands;
  }

  // Suited/offsuit range: "AKs-A5s", "K8s-K2s", "ATo-AJo", "Q7s-Q4s"
  const suitedMatch = range.match(/^([A2-9TJQKA])([A2-9TJQKA])([so])-([A2-9TJQKA])([A2-9TJQKA])([so])$/i);
  if (suitedMatch) {
    const firstRank = suitedMatch[1].toUpperCase();
    const startSecond = rankIndex(suitedMatch[2]);
    const endSecond = rankIndex(suitedMatch[4]);
    const suit = suitedMatch[3].toLowerCase();
    const lo = Math.min(startSecond, endSecond);
    const hi = Math.max(startSecond, endSecond);
    for (let i = lo; i <= hi; i++) {
      hands.push(`${firstRank}${RANKS[i]}${suit}`);
    }
    return hands;
  }

  return hands;
}

/**
 * Parse a single hand or range and add to matrix with given weight.
 * Handles: "AA", "AKs", "AKo", "AKs-A5s", "AA-TT", "K8s-K2s"
 */
function parseSingleItem(item: string, weight: number, matrix: Record<string, number>): void {
  if (!item) return;

  // Try as range first (contains dash)
  if (item.includes("-")) {
    const rangeHands = expandSingleRange(item);
    for (const hand of rangeHands) {
      if (isValidHand(hand)) {
        matrix[normalizeHand(hand)] = weight;
      }
    }
    return;
  }

  // Single hand: AA, AKs, AKo, K9s, etc.
  const normalized = normalizeHand(item);
  if (isValidHand(normalized)) {
    matrix[normalized] = weight;
  }
}

/**
 * Parse Flopzilla weighted range format.
 * Format: [99]K9s,QTs,T9s[/99],[97]A9s-A2s,KTs,QJs[/97],88-44,K8s-K2s
 * - [XX] starts a weighted group, [/XX] ends it
 * - Plain items without [XX] = 100% weight
 * - Multiple comma-separated items within a group share the same weight
 */
export function parseFlopzilla(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};

  // Remove line breaks, normalize spaces
  let text = rangeText.replace(/\n/g, ",").replace(/\s+/g, "");

  // Remove closing tags like [/99], [/97], etc.
  text = text.replace(/\[\/\d+\]/g, "");

  // Split by commas
  const parts = text.split(",").filter(Boolean);

  let currentWeight = 100;

  for (const part of parts) {
    if (!part) continue;

    // Check for weight prefix: [99], [97], [10], etc.
    const weightMatch = part.match(/^\[(\d{1,3})\](.+)$/);
    if (weightMatch) {
      currentWeight = parseInt(weightMatch[1], 10);
      const content = weightMatch[2];
      parseSingleItem(content, currentWeight, matrix);
      continue;
    }

    // Regular item (use current weight from group, or 100% if no group)
    parseSingleItem(part, currentWeight, matrix);
  }

  return matrix;
}

/**
 * Parse Anki export format.
 */
export function parseAnki(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};
  const lines = rangeText.split("\n").map((s) => s.trim());

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Z2-9]{2}[so]?)[\s,:\t]+(\d+(?:\.\d+)?)\s*%?\s*$/i);
    if (match) {
      const hand = normalizeHand(match[1]);
      const weight = parseFloat(match[2]);
      if (isValidHand(hand)) {
        matrix[hand] = weight;
      }
      continue;
    }

    const handOnly = line.match(/^([A-Z2-9]{2}[so]?)\s*$/i);
    if (handOnly) {
      const hand = normalizeHand(handOnly[1]);
      if (isValidHand(hand)) {
        matrix[hand] = 100;
      }
    }
  }

  return matrix;
}

/**
 * Parse PioSolver export format.
 */
export function parsePioSolver(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};
  const parts = rangeText.split(/[,\n]+/).map((s) => s.trim());

  for (const part of parts) {
    if (!part) continue;

    const match = part.match(/^([A-Z2-9]{2}[so]?)\s*[:\s]\s*(\d+(?:\.\d+)?)\s*%?\s*$/i);
    if (match) {
      const hand = normalizeHand(match[1]);
      const weight = parseFloat(match[2]);
      if (isValidHand(hand)) {
        matrix[hand] = weight;
      }
      continue;
    }

    const handOnly = part.match(/^([A-Z2-9]{2}[so]?)\s*$/i);
    if (handOnly) {
      const hand = normalizeHand(handOnly[1]);
      if (isValidHand(hand)) {
        matrix[hand] = 100;
      }
    }
  }

  return matrix;
}

/**
 * Parse Simple Postflop export format.
 */
export function parseSimplePostflop(rangeText: string): Record<string, number> {
  const matrix: Record<string, number> = {};

  try {
    const parsed = JSON.parse(rangeText);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const hand = item.hand || item.Hand || item.name;
        const weight = item.weight || item.Weight || item.freq || 100;
        if (hand) {
          const normalized = normalizeHand(String(hand));
          if (isValidHand(normalized)) {
            matrix[normalized] = Number(weight);
          }
        }
      }
      return matrix;
    }
  } catch {
    // Not JSON
  }

  const lines = rangeText.split("\n").map((s) => s.trim());
  for (const line of lines) {
    if (!line) continue;
    const match = line.match(/^([A-Z2-9]{2}[so]?)\s*[:\s,]\s*(\d+(?:\.\d+)?)\s*%?\s*$/i);
    if (match) {
      const hand = normalizeHand(match[1]);
      const weight = parseFloat(match[2]);
      if (isValidHand(hand)) {
        matrix[hand] = weight;
      }
    }
  }

  return matrix;
}

/**
 * Parse JSON format.
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
