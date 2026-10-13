export const CARD_LEVELS = ['new', 'again', 'hard', 'good', 'easy'] as const;
export type CardLevel = (typeof CARD_LEVELS)[number];

export const REVIEW_RATINGS = ['again', 'hard', 'good', 'easy'] as const;
export type ReviewRating = (typeof REVIEW_RATINGS)[number];

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/** Tiempo (ms) hasta que la card vuelve a mostrarse según la respuesta. */
export const REVIEW_INTERVALS: Record<ReviewRating, number> = {
  again: 5 * MINUTE,
  hard: 10 * MINUTE,
  good: 3 * DAY,
  easy: 7 * DAY,
};

export interface Card {
  id: string;
  cardFront: string;
  cardBack: string;
  level: CardLevel;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  /** Cuenta propietaria del mazo. */
  ownerId: string;
  title: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}
