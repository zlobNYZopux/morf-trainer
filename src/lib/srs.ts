export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

type Rating = "again" | "hard" | "good" | "easy";

const RATING_MAP: Record<Rating, number> = {
  again: 0,
  hard: 1,
  good: 2,
  easy: 3,
};

export function processReview(card: SRSData, rating: Rating): SRSData {
  const q = RATING_MAP[rating];
  let { easeFactor, interval, repetitions } = card;

  if (q < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02))
  );

  return { easeFactor, interval, repetitions };
}
