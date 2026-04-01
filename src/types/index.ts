export interface Card {
  name: string;
  quantity: number;
  set?: string;
  collectorNumber?: string;
}

export interface ParsedDeck {
  id: string;
  name: string;
  mainboard: Card[];
  sideboard: Card[];
  totalCards: number;
}

export interface UserCollection {
  cards: Card[];
  totalCards: number;
  uniqueCards: number;
}

export interface DeckMatchResult {
  deck: ParsedDeck;
  ownedCards: Card[];
  missingCards: Card[];
  ownedCount: number;
  totalCount: number;
  percentage: number;
  missingPriceUsd: number;
  missingPriceEur: number;
}

export interface SharedCard {
  name: string;
  decks: string[];
  totalNeeded: number;
  owned: number;
  shortage: number;
}

export interface CardPrice {
  name: string;
  usd: number | null;
  eur: number | null;
  imageUrl: string | null;
}

export type Currency = 'usd' | 'eur';

export interface DeckInput {
  id: string;
  name: string;
  content: string;
}
