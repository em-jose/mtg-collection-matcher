import type {
  Card,
  UserCollection,
  ParsedDeck,
  DeckMatchResult,
  SharedCard,
} from '../types';
import { cardNamesMatch } from './cardNormalizer';

/**
 * Find how many copies of a card exist in the collection.
 */
function findInCollection(cardName: string, collection: Card[]): number {
  const found = collection.find(c => cardNamesMatch(c.name, cardName));
  return found ? found.quantity : 0;
}

/**
 * Compare a single deck against the user's collection.
 */
export function matchDeck(
  deck: ParsedDeck,
  collection: UserCollection
): Omit<DeckMatchResult, 'missingPriceUsd' | 'missingPriceEur'> {
  const ownedCards: Card[] = [];
  const missingCards: Card[] = [];

  const allCards = [...deck.mainboard, ...deck.sideboard];

  for (const card of allCards) {
    const owned = findInCollection(card.name, collection.cards);
    const have = Math.min(owned, card.quantity);
    const missing = card.quantity - have;

    if (have > 0) {
      ownedCards.push({ name: card.name, quantity: have, set: card.set });
    }
    if (missing > 0) {
      missingCards.push({ name: card.name, quantity: missing, set: card.set });
    }
  }

  const ownedCount = ownedCards.reduce((s, c) => s + c.quantity, 0);
  const totalCount = allCards.reduce((s, c) => s + c.quantity, 0);
  const percentage = totalCount > 0 ? Math.round((ownedCount / totalCount) * 1000) / 10 : 0;

  return {
    deck,
    ownedCards,
    missingCards,
    ownedCount,
    totalCount,
    percentage,
  };
}

/**
 * Compare multiple decks against the collection.
 */
export function matchAllDecks(
  decks: ParsedDeck[],
  collection: UserCollection
): DeckMatchResult[] {
  return decks.map(deck => ({
    ...matchDeck(deck, collection),
    missingPriceUsd: 0,
    missingPriceEur: 0,
  }));
}

/**
 * Find cards that are shared across multiple decks.
 * Calculates if the user has enough copies for all decks simultaneously.
 */
export function findSharedCards(
  decks: ParsedDeck[],
  collection: UserCollection
): SharedCard[] {
  // Build a map of card -> which decks need it and how many
  const cardMap = new Map<string, { decks: string[]; quantities: number[] }>();

  for (const deck of decks) {
    // Aggregate quantities per card within the same deck (main + side)
    const deckCards = new Map<string, number>();
    for (const card of [...deck.mainboard, ...deck.sideboard]) {
      const key = card.name.toLowerCase();
      deckCards.set(key, (deckCards.get(key) || 0) + card.quantity);
    }

    for (const [key, quantity] of deckCards) {
      const entry = cardMap.get(key) || { decks: [], quantities: [] };
      entry.decks.push(deck.name);
      entry.quantities.push(quantity);
      cardMap.set(key, entry);
    }
  }

  // Only keep cards that appear in 2+ decks
  const shared: SharedCard[] = [];
  for (const [key, entry] of cardMap) {
    if (entry.decks.length < 2) continue;

    const totalNeeded = entry.quantities.reduce((s, q) => s + q, 0);
    const owned = findInCollection(key, collection.cards);
    const shortage = Math.max(0, totalNeeded - owned);

    // Get the original card name (with proper casing)
    const originalName = [...decks]
      .flatMap(d => [...d.mainboard, ...d.sideboard])
      .find(c => c.name.toLowerCase() === key)?.name || key;

    shared.push({
      name: originalName,
      decks: entry.decks,
      totalNeeded,
      owned,
      shortage,
    });
  }

  return shared.sort((a, b) => b.decks.length - a.decks.length);
}

/**
 * Build a combined list of all missing cards across all decks.
 * Takes the maximum quantity needed for each card (not the sum).
 */
export function buildCombinedMissingList(results: DeckMatchResult[]): Card[] {
  const map = new Map<string, Card>();

  for (const result of results) {
    for (const card of result.missingCards) {
      const key = card.name.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        // Take the max quantity needed across decks
        existing.quantity = Math.max(existing.quantity, card.quantity);
      } else {
        map.set(key, { ...card });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
