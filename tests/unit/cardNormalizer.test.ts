import { describe, it, expect } from 'vitest';
import { normalizeCardName, cardNamesMatch } from '../../src/utils/cardNormalizer';

describe('cardNormalizer', () => {
  describe('normalizeCardName', () => {
    it('trims whitespace', () => {
      expect(normalizeCardName('  Lightning Bolt  ')).toBe('lightning bolt');
    });

    it('lowercases the name', () => {
      expect(normalizeCardName('Lightning Bolt')).toBe('lightning bolt');
    });

    it('handles split cards', () => {
      expect(normalizeCardName('Fire // Ice')).toBe('fire // ice');
    });
  });

  describe('cardNamesMatch', () => {
    it('matches identical names', () => {
      expect(cardNamesMatch('Lightning Bolt', 'Lightning Bolt')).toBe(true);
    });

    it('matches case-insensitively', () => {
      expect(cardNamesMatch('lightning bolt', 'Lightning Bolt')).toBe(true);
    });

    it('matches with extra whitespace', () => {
      expect(cardNamesMatch('  Lightning Bolt ', 'Lightning Bolt')).toBe(true);
    });

    it('matches front face of split card to short name', () => {
      expect(cardNamesMatch('Fire // Ice', 'Fire')).toBe(true);
    });

    it('matches short name to front face of split card', () => {
      expect(cardNamesMatch('Fire', 'Fire // Ice')).toBe(true);
    });

    it('does not match different cards', () => {
      expect(cardNamesMatch('Lightning Bolt', 'Counterspell')).toBe(false);
    });

    it('does not match partial names that are not split cards', () => {
      expect(cardNamesMatch('Lightning', 'Lightning Bolt')).toBe(false);
    });
  });
});
