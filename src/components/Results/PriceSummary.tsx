import type { DeckMatchResult, CardPrice, Currency } from "@types";
import { calculateTotalPrice } from "@services/scryfallApi";

interface PriceSummaryProps {
  results: DeckMatchResult[];
  prices: Map<string, CardPrice>;
  currency: Currency;
}

export function PriceSummary({ results, prices, currency }: PriceSummaryProps) {
  const currencySymbol = currency === "eur" ? "\u20AC" : "$";

  const deckPrices = results.map((r) => ({
    name: r.deck.name,
    price: calculateTotalPrice(r.missingCards, prices, currency),
  }));

  const totalPrice = deckPrices.reduce((s, d) => s + d.price, 0);

  if (totalPrice === 0) return null;

  return (
    <div className="bg-linear-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-5">
      <h3 className="text-lg font-bold text-white mb-4">Price Summary</h3>

      <div className="space-y-2">
        {deckPrices.map((deck) => (
          <div
            key={deck.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-400">{deck.name}</span>
            <span className="text-gray-200 font-medium">
              {currencySymbol}
              {deck.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
        <span className="text-gray-300 font-semibold">Total</span>
        <span className="text-2xl font-bold text-amber-500">
          {currencySymbol}
          {totalPrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
