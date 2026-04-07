import { useState, useCallback } from "react";
import type { DeckMatchResult, CardPrice, Currency } from "@types";
import { ProgressBar } from "@components/ui/ProgressBar";
import { CardImage } from "@components/ui/CardImage";
import { calculateTotalPrice } from "@services/scryfallApi";

function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return { copied, copy };
}

interface DeckResultProps {
  result: DeckMatchResult;
  prices: Map<string, CardPrice>;
  currency: Currency;
}

export function DeckResult({ result, prices, currency }: DeckResultProps) {
  const [expanded, setExpanded] = useState(false);
  const { copied, copy } = useCopyToClipboard();
  const missingPrice = calculateTotalPrice(
    result.missingCards,
    prices,
    currency,
  );
  const currencySymbol = currency === "eur" ? "\u20AC" : "$";

  const handleCopyMissing = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = result.missingCards
      .map((c) => `${c.quantity} ${c.name}`)
      .join("\n");
    copy(text);
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 hover:bg-gray-800/80 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white">{result.deck.name}</h3>
          <span className="text-2xl font-bold text-amber-500">
            {result.percentage}%
          </span>
        </div>

        <ProgressBar percentage={result.percentage} className="mb-2" />

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            You have{" "}
            <span className="text-white font-medium">{result.ownedCount}</span>{" "}
            of{" "}
            <span className="text-white font-medium">{result.totalCount}</span>{" "}
            cards
          </span>
          {missingPrice > 0 && (
            <span className="text-red-400">
              Missing: {currencySymbol}
              {missingPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center text-xs text-gray-500">
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="ml-1">{expanded ? "Hide" : "Show"} details</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-700 p-5 space-y-4">
          {/* Missing cards */}
          {result.missingCards.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-red-400">
                  Missing (
                  {result.missingCards.reduce((s, c) => s + c.quantity, 0)}{" "}
                  cards)
                </h4>
                <button
                  onClick={handleCopyMissing}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    copied
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  {copied ? "Copied!" : "Copy missing"}
                </button>
              </div>
              <div className="space-y-1">
                {result.missingCards.map((card) => {
                  const price = prices.get(card.name.toLowerCase());
                  const unitPrice = price
                    ? currency === "usd"
                      ? price.usd
                      : price.eur
                    : null;
                  return (
                    <div
                      key={card.name}
                      className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-gray-700/50"
                    >
                      <CardImage cardName={card.name} prices={prices}>
                        <span className="text-gray-300 cursor-help">
                          <span className="text-red-400 font-mono mr-2">
                            {card.quantity}x
                          </span>
                          {card.name}
                        </span>
                      </CardImage>
                      {unitPrice && (
                        <span className="text-gray-500 text-xs">
                          {currencySymbol}
                          {(unitPrice * card.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Owned cards */}
          {result.ownedCards.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-emerald-400 mb-2">
                Owned ({result.ownedCards.reduce((s, c) => s + c.quantity, 0)}{" "}
                cards)
              </h4>
              <div className="space-y-1">
                {result.ownedCards.map((card) => (
                  <div
                    key={card.name}
                    className="flex items-center text-sm py-1 px-2 rounded hover:bg-gray-700/50"
                  >
                    <CardImage cardName={card.name} prices={prices}>
                      <span className="text-gray-400 cursor-help">
                        <span className="text-emerald-400 font-mono mr-2">
                          {card.quantity}x
                        </span>
                        {card.name}
                      </span>
                    </CardImage>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
