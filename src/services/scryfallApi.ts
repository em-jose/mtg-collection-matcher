import type { Card, CardPrice } from '@types';

const API_BASE = 'https://api.scryfall.com';
const BATCH_SIZE = 75;
const DELAY_MS = 100;

interface ScryfallCardIdentifier {
  name: string;
}

interface ScryfallCard {
  name: string;
  prices: {
    usd: string | null;
    eur: string | null;
  };
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
  card_faces?: Array<{
    image_uris?: {
      small: string;
      normal: string;
      large: string;
    };
  }>;
}

interface ScryfallCollectionResponse {
  data: ScryfallCard[];
  not_found: ScryfallCardIdentifier[];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get the image URL for a card, handling double-faced cards.
 */
function getImageUrl(card: ScryfallCard): string | null {
  if (card.image_uris?.large) return card.image_uris.large;
  if (card.card_faces?.[0]?.image_uris?.large) return card.card_faces[0].image_uris.large;
  return null;
}

/**
 * Fetch prices and images for a batch of cards from Scryfall.
 * Uses POST /cards/collection endpoint (max 75 cards per request).
 */
async function fetchBatch(cardNames: string[]): Promise<Map<string, CardPrice>> {
  const identifiers: ScryfallCardIdentifier[] = cardNames.map(name => ({ name }));

  const response = await fetch(`${API_BASE}/cards/collection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiers }),
  });

  if (!response.ok) {
    throw new Error(`Scryfall API error: ${response.status}`);
  }

  const data: ScryfallCollectionResponse = await response.json();
  const prices = new Map<string, CardPrice>();

  for (const card of data.data) {
    prices.set(card.name.toLowerCase(), {
      name: card.name,
      usd: card.prices.usd ? parseFloat(card.prices.usd) : null,
      eur: card.prices.eur ? parseFloat(card.prices.eur) : null,
      imageUrl: getImageUrl(card),
    });
  }

  return prices;
}

/**
 * Fetch prices for a list of cards, batching into groups of 75.
 * Returns a Map of normalized card name -> CardPrice.
 */
export async function fetchCardPrices(
  cards: Card[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, CardPrice>> {
  const uniqueNames = [...new Set(cards.map(c => c.name))];
  const allPrices = new Map<string, CardPrice>();
  const batches: string[][] = [];

  // Split into batches of BATCH_SIZE
  for (let i = 0; i < uniqueNames.length; i += BATCH_SIZE) {
    batches.push(uniqueNames.slice(i, i + BATCH_SIZE));
  }

  let loaded = 0;
  for (const batch of batches) {
    const batchPrices = await fetchBatch(batch);
    for (const [key, value] of batchPrices) {
      allPrices.set(key, value);
    }
    loaded += batch.length;
    onProgress?.(loaded, uniqueNames.length);

    // Rate limit
    if (batches.indexOf(batch) < batches.length - 1) {
      await delay(DELAY_MS);
    }
  }

  return allPrices;
}

/**
 * Calculate the total price for a list of cards.
 */
export function calculateTotalPrice(
  cards: Card[],
  prices: Map<string, CardPrice>,
  currency: 'usd' | 'eur'
): number {
  let total = 0;
  for (const card of cards) {
    const price = prices.get(card.name.toLowerCase());
    if (price) {
      const unitPrice = currency === 'usd' ? price.usd : price.eur;
      if (unitPrice) {
        total += unitPrice * card.quantity;
      }
    }
  }
  return Math.round(total * 100) / 100;
}
