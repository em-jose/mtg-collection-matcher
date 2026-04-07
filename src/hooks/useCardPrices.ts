import { useEffect } from 'react';
import type { Card } from '@types';
import { fetchCardPrices } from '@services/scryfallApi';
import { useApp } from '@context/AppContext';

/**
 * Hook that fetches prices from Scryfall for the given cards.
 * Automatically triggers when cards change.
 */
export function useCardPrices(cards: Card[]) {
  const { setPrices, setPricesLoading, setPricesProgress } = useApp();

  useEffect(() => {
    if (cards.length === 0) return;

    let cancelled = false;

    async function load() {
      setPricesLoading(true);
      setPricesProgress({ loaded: 0, total: cards.length });

      try {
        const result = await fetchCardPrices(cards, (loaded, total) => {
          if (!cancelled) {
            setPricesProgress({ loaded, total });
          }
        });
        if (!cancelled) {
          setPrices(result);
        }
      } catch (error) {
        console.error('Failed to fetch card prices:', error);
      } finally {
        if (!cancelled) {
          setPricesLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [cards, setPrices, setPricesLoading, setPricesProgress]);
}
