import { useMemo } from "react";
import { useApp } from "@context/AppContext";
import { useCardPrices } from "@hooks/useCardPrices";
import { DeckResult } from "@components/Results/DeckResult";
import { SharedCards } from "@components/Results/SharedCards";
import { MissingCardsList } from "@components/Results/MissingCardsList";
import { PriceSummary } from "@components/Results/PriceSummary";
import { CurrencySelector } from "@components/ui/CurrencySelector";
import { LoadingSpinner } from "@components/ui/LoadingSpinner";

export function ResultsDashboard() {
  const {
    results,
    sharedCards,
    combinedMissing,
    prices,
    pricesLoading,
    pricesProgress,
    currency,
    setCurrency,
    collection,
  } = useApp();

  // Fetch prices/images for ALL cards across all decks (not just missing)
  const allDeckCards = useMemo(() => {
    if (!results) return [];
    const map = new Map<string, { name: string; quantity: number }>();
    for (const r of results) {
      for (const card of [...r.ownedCards, ...r.missingCards]) {
        const key = card.name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { name: card.name, quantity: card.quantity });
        }
      }
    }
    return Array.from(map.values());
  }, [results]);
  useCardPrices(allDeckCards);

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4 opacity-50">&#127183;</div>
        <h2 className="text-xl font-semibold text-gray-400 mb-2">
          No results yet
        </h2>
        <p className="text-gray-500">
          Import your collection and add some decks to compare.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Results</h2>
          <p className="text-sm text-gray-400 mt-1">
            Comparing {results.length} deck{results.length > 1 ? "s" : ""}{" "}
            against your collection of {collection?.uniqueCards || 0} unique
            cards
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pricesLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <LoadingSpinner size="sm" />
              <span>
                Loading prices ({pricesProgress.loaded}/{pricesProgress.total})
              </span>
            </div>
          )}
          <CurrencySelector currency={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* Deck results */}
      <div className="grid gap-4">
        {results
          .sort((a, b) => b.percentage - a.percentage)
          .map((result) => (
            <DeckResult
              key={result.deck.id}
              result={result}
              prices={prices}
              currency={currency}
            />
          ))}
      </div>

      {/* Shared cards */}
      {sharedCards.length > 0 && (
        <SharedCards sharedCards={sharedCards} prices={prices} />
      )}

      {/* Price summary */}
      <PriceSummary results={results} prices={prices} currency={currency} />

      {/* Combined missing list */}
      <MissingCardsList
        cards={combinedMissing}
        prices={prices}
        currency={currency}
      />
    </div>
  );
}
