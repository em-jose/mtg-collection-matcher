import { describe, it, expect } from 'vitest';
import { parseCollection } from '../../src/services/collectionParser';

describe('collectionParser', () => {
  describe('plain text format', () => {
    it('parses basic "quantity name" format', () => {
      const text = '4 Lightning Bolt\n2 Counterspell\n1 Sol Ring';
      const result = parseCollection(text);

      expect(result.uniqueCards).toBe(3);
      expect(result.totalCards).toBe(7);
      expect(result.cards).toContainEqual({ name: 'Lightning Bolt', quantity: 4, set: undefined });
      expect(result.cards).toContainEqual({ name: 'Counterspell', quantity: 2, set: undefined });
    });

    it('parses "quantityx name" format', () => {
      const text = '4x Lightning Bolt\n2x Counterspell';
      const result = parseCollection(text);

      expect(result.uniqueCards).toBe(2);
      expect(result.cards).toContainEqual({ name: 'Lightning Bolt', quantity: 4, set: undefined });
    });

    it('parses cards with set codes in parentheses', () => {
      const text = '1x Sol Ring (CMR)\n4 Lightning Bolt (M21)';
      const result = parseCollection(text);

      expect(result.cards).toContainEqual({ name: 'Sol Ring', quantity: 1, set: 'CMR' });
      expect(result.cards).toContainEqual({ name: 'Lightning Bolt', quantity: 4, set: 'M21' });
    });

    it('parses cards with set codes in brackets', () => {
      const text = '2 Brainstorm [ICE]';
      const result = parseCollection(text);

      expect(result.cards).toContainEqual({ name: 'Brainstorm', quantity: 2, set: 'ICE' });
    });

    it('ignores comment lines and empty lines', () => {
      const text = '// My collection\n\n4 Lightning Bolt\n# Another comment\n2 Counterspell\n\n';
      const result = parseCollection(text);

      expect(result.uniqueCards).toBe(2);
      expect(result.totalCards).toBe(6);
    });

    it('merges duplicate card names', () => {
      const text = '2 Lightning Bolt\n3 Lightning Bolt';
      const result = parseCollection(text);

      expect(result.uniqueCards).toBe(1);
      expect(result.totalCards).toBe(5);
      expect(result.cards[0].quantity).toBe(5);
    });

    it('returns empty collection for empty input', () => {
      const result = parseCollection('');
      expect(result.cards).toHaveLength(0);
      expect(result.totalCards).toBe(0);
      expect(result.uniqueCards).toBe(0);
    });

    it('returns empty collection for whitespace-only input', () => {
      const result = parseCollection('   \n  \n  ');
      expect(result.cards).toHaveLength(0);
    });
  });

  describe('CSV format (Moxfield export)', () => {
    it('parses Moxfield CSV export format', () => {
      const csv = `"Count","Tradelist Count","Name","Edition","Condition","Language","Foil","Tags","Last Modified","Collector Number","Alter","Proxy","Purchase Price"
"1","1","Aang's Journey","tla","Near Mint","English","","","2025-11-15 16:33:07.270000","1","False","False","0.17"
"2","2","Abandoned Campground","dsk","Near Mint","English","","","2024-12-21 09:48:30.027000","255","False","False",""`;

      const result = parseCollection(csv);

      expect(result.uniqueCards).toBe(2);
      expect(result.totalCards).toBe(3);
      expect(result.cards).toContainEqual(
        expect.objectContaining({ name: "Aang's Journey", quantity: 1 })
      );
      expect(result.cards).toContainEqual(
        expect.objectContaining({ name: 'Abandoned Campground', quantity: 2 })
      );
    });

    it('handles CSV with quoted fields containing commas', () => {
      const csv = `"Count","Name","Edition"
"1","Jace, the Mind Sculptor","2xm"`;

      const result = parseCollection(csv);
      expect(result.cards).toContainEqual(
        expect.objectContaining({ name: 'Jace, the Mind Sculptor', quantity: 1 })
      );
    });
  });
});
