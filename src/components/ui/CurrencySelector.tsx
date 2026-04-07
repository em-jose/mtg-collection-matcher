import type { Currency } from "@types";

interface CurrencySelectorProps {
  currency: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySelector({
  currency,
  onChange,
}: CurrencySelectorProps) {
  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-gray-600">
      <button
        onClick={() => onChange("eur")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          currency === "eur"
            ? "bg-amber-600 text-white"
            : "bg-gray-800 text-gray-400 hover:text-gray-200"
        }`}
      >
        EUR
      </button>
      <button
        onClick={() => onChange("usd")}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          currency === "usd"
            ? "bg-amber-600 text-white"
            : "bg-gray-800 text-gray-400 hover:text-gray-200"
        }`}
      >
        USD
      </button>
    </div>
  );
}
