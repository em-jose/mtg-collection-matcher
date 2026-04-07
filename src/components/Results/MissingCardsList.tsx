import { useState } from "react";
import type { Card, CardPrice, Currency } from "@types";
import { calculateTotalPrice } from "@services/scryfallApi";
import { CardImage } from "@components/ui/CardImage";

interface MissingCardsListProps {
  cards: Card[];
  prices: Map<string, CardPrice>;
  currency: Currency;
}

export function MissingCardsList({
  cards,
  prices,
  currency,
}: MissingCardsListProps) {
  const [copied, setCopied] = useState(false);
  const totalPrice = calculateTotalPrice(cards, prices, currency);
  const currencySymbol = currency === "eur" ? "\u20AC" : "$";

  if (cards.length === 0) return null;

  const textList = cards.map((c) => `${c.quantity} ${c.name}`).join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textList);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = textList;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">All Missing Cards</h3>
          <p className="text-sm text-gray-400 mt-1">
            {cards.reduce((s, c) => s + c.quantity, 0)} cards total
            {totalPrice > 0 && (
              <span className="text-amber-500 ml-2">
                {currencySymbol}
                {totalPrice.toFixed(2)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-amber-600 hover:bg-amber-500 text-white"
          }`}
        >
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 max-h-80 overflow-y-auto font-mono text-sm">
        {cards.map((card) => {
          const price = prices.get(card.name.toLowerCase());
          const unitPrice = price
            ? currency === "usd"
              ? price.usd
              : price.eur
            : null;
          return (
            <div
              key={card.name}
              className="flex items-center justify-between py-0.5 text-gray-300"
            >
              <CardImage cardName={card.name} prices={prices}>
                <span className="cursor-help">
                  {card.quantity} {card.name}
                </span>
              </CardImage>
              {unitPrice && (
                <span className="text-gray-500 ml-4">
                  {currencySymbol}
                  {(unitPrice * card.quantity).toFixed(2)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
