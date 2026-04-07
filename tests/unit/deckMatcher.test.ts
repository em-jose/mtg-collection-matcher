import { describe, it, expect } from 'vitest';
import { matchDeck, matchAllDecks, findSharedCards, buildCombinedMissingList } from '../../src/utils/deckMatcher';
import { parseDeck } from '../../src/services/deckParser';
import type { UserCollection, ParsedDeck } from '../../src/types';

// Helper to create a simple collection
function makeCollection(cards: [string, number][]): UserCollection {
  return {
    cards: cards.map(([name, quantity]) => ({ name, quantity })),
    totalCards: cards.reduce((s, [, q]) => s + q, 0),
    uniqueCards: cards.length,
  };
}

describe('deckMatcher', () => {
  describe('matchDeck', () => {
    it('calculates 100% when all cards are owned', () => {
      const collection = makeCollection([
        ['Lightning Bolt', 4],
        ['Counterspell', 4],
      ]);
      const deck: ParsedDeck = {
        id: '1',
        name: 'Test',
        mainboard: [
          { name: 'Lightning Bolt', quantity: 4 },
          { name: 'Counterspell', quantity: 4 },
        ],
        sideboard: [],
        totalCards: 8,
      };

      const result = matchDeck(deck, collection);
      expect(result.percentage).toBe(100);
      expect(result.missingCards).toHaveLength(0);
      expect(result.ownedCount).toBe(8);
    });

    it('calculates 0% when no cards are owned', () => {
      const collection = makeCollection([['Sol Ring', 1]]);
      const deck: ParsedDeck = {
        id: '1',
        name: 'Test',
        mainboard: [{ name: 'Lightning Bolt', quantity: 4 }],
        sideboard: [],
        totalCards: 4,
      };

      const result = matchDeck(deck, collection);
      expect(result.percentage).toBe(0);
      expect(result.missingCards).toHaveLength(1);
      expect(result.missingCards[0].quantity).toBe(4);
    });

    it('handles partial ownership correctly', () => {
      const collection = makeCollection([['Lightning Bolt', 2]]);
      const deck: ParsedDeck = {
        id: '1',
        name: 'Test',
        mainboard: [{ name: 'Lightning Bolt', quantity: 4 }],
        sideboard: [],
        totalCards: 4,
      };

      const result = matchDeck(deck, collection);
      expect(result.percentage).toBe(50);
      expect(result.ownedCount).toBe(2);
      expect(result.missingCards[0].quantity).toBe(2);
    });

    it('includes sideboard in the comparison', () => {
      const collection = makeCollection([
        ['Lightning Bolt', 4],
      ]);
      const deck: ParsedDeck = {
        id: '1',
        name: 'Test',
        mainboard: [{ name: 'Lightning Bolt', quantity: 4 }],
        sideboard: [{ name: 'Negate', quantity: 2 }],
        totalCards: 6,
      };

      const result = matchDeck(deck, collection);
      expect(result.ownedCount).toBe(4);
      expect(result.totalCount).toBe(6);
      expect(result.missingCards).toContainEqual({ name: 'Negate', quantity: 2, set: undefined });
    });
  });

  describe('findSharedCards', () => {
    it('detects cards shared between two decks', () => {
      const collection = makeCollection([['Lightning Bolt', 4]]);
      const deckA: ParsedDeck = {
        id: '1', name: 'Deck A',
        mainboard: [{ name: 'Lightning Bolt', quantity: 4 }],
        sideboard: [],
        totalCards: 4,
      };
      const deckB: ParsedDeck = {
        id: '2', name: 'Deck B',
        mainboard: [{ name: 'Lightning Bolt', quantity: 3 }],
        sideboard: [],
        totalCards: 3,
      };

      const shared = findSharedCards([deckA, deckB], collection);
      expect(shared).toHaveLength(1);
      expect(shared[0].name).toBe('Lightning Bolt');
      expect(shared[0].totalNeeded).toBe(7);
      expect(shared[0].owned).toBe(4);
      expect(shared[0].shortage).toBe(3);
    });

    it('does not list cards only in one deck', () => {
      const collection = makeCollection([]);
      const deckA: ParsedDeck = {
        id: '1', name: 'Deck A',
        mainboard: [{ name: 'Lightning Bolt', quantity: 4 }],
        sideboard: [],
        totalCards: 4,
      };
      const deckB: ParsedDeck = {
        id: '2', name: 'Deck B',
        mainboard: [{ name: 'Counterspell', quantity: 4 }],
        sideboard: [],
        totalCards: 4,
      };

      const shared = findSharedCards([deckA, deckB], collection);
      expect(shared).toHaveLength(0);
    });

    it('does not duplicate a deck when card appears in both mainboard and sideboard', () => {
      const collection = makeCollection([['Krark-Clan Shaman', 4]]);
      const deck: ParsedDeck = {
        id: '1', name: 'Grixis Affinity',
        mainboard: [{ name: 'Krark-Clan Shaman', quantity: 3 }],
        sideboard: [{ name: 'Krark-Clan Shaman', quantity: 1 }],
        totalCards: 4,
      };
      const deckB: ParsedDeck = {
        id: '2', name: 'Other Deck',
        mainboard: [{ name: 'Sol Ring', quantity: 1 }],
        sideboard: [],
        totalCards: 1,
      };

      const shared = findSharedCards([deck, deckB], collection);
      // Krark-Clan Shaman only appears in one deck, so should not be shared
      const shaman = shared.find(c => c.name === 'Krark-Clan Shaman');
      expect(shaman).toBeUndefined();
    });
  });

  describe('buildCombinedMissingList', () => {
    it('combines missing cards from multiple decks without duplicating', () => {
      const results = matchAllDecks(
        [
          {
            id: '1', name: 'Deck A',
            mainboard: [{ name: 'Lightning Bolt', quantity: 4 }, { name: 'Negate', quantity: 2 }],
            sideboard: [],
            totalCards: 6,
          },
          {
            id: '2', name: 'Deck B',
            mainboard: [{ name: 'Lightning Bolt', quantity: 3 }, { name: 'Dispel', quantity: 1 }],
            sideboard: [],
            totalCards: 4,
          },
        ],
        makeCollection([])
      );

      const combined = buildCombinedMissingList(results);
      const bolt = combined.find(c => c.name === 'Lightning Bolt');
      // Takes the max needed: 4 (from Deck A), not 4+3=7
      expect(bolt?.quantity).toBe(4);
      expect(combined).toHaveLength(3);
    });
  });

  describe('integration with real data', () => {
    it('matches Mono Blue Terror against a collection with partial ownership', () => {
      const collection = makeCollection([
        ['Delver of Secrets', 4],
        ['Tolarian Terror', 4],
        ['Counterspell', 4],
        ['Brainstorm', 4],
        ['Ponder', 2],
        ['Island', 20],
      ]);

      const deck = parseDeck(
        `Deck
        4 Delver of Secrets
        4 Cryptic Serpent
        4 Tolarian Terror
        3 Force Spike
        2 Dispel
        4 Mental Note
        4 Thought Scour
        4 Counterspell
        4 Brainstorm
        2 Deem Inferior
        2 Ponder
        4 Lórien Revealed
        2 Sleep of the Dead
        1 Deep Analysis
        16 Island

        Sideboard
        4 Annul
        2 Spreading Seas
        1 Blue Elemental Blast
        4 Gut Shot
        4 Hydroblast`,
        '1',
        'Mono Blue Terror'
      );

      const result = matchDeck(deck, collection);

      // We own: 4 Delver + 4 Tolarian + 4 Counterspell + 4 Brainstorm + 2 Ponder + 16 Island = 34
      expect(result.ownedCount).toBe(34);
      expect(result.totalCount).toBe(75);
      expect(result.percentage).toBeGreaterThan(40);
      expect(result.percentage).toBeLessThan(50);
      expect(result.missingCards.length).toBeGreaterThan(0);

      // Cryptic Serpent should be fully missing
      const serpent = result.missingCards.find(c => c.name === 'Cryptic Serpent');
      expect(serpent?.quantity).toBe(4);
    });
  });
});
