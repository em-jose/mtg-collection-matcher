import { useApp } from "@context/AppContext";
import type { DeckInput as DeckInputType } from "@types";

interface DeckInputProps {
  deck: DeckInputType;
  canRemove: boolean;
}

export function DeckInput({ deck, canRemove }: DeckInputProps) {
  const { updateDeckInput, removeDeckInput } = useApp();

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={deck.name}
          onChange={(e) => updateDeckInput(deck.id, "name", e.target.value)}
          placeholder="Deck name (optional)"
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
        />
        {canRemove && (
          <button
            onClick={() => removeDeckInput(deck.id)}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700"
            title="Remove deck"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <textarea
        value={deck.content}
        onChange={(e) => updateDeckInput(deck.id, "content", e.target.value)}
        placeholder={`Paste decklist here...\n\n4 Lightning Bolt\n4 Counterspell\n2 Snapcaster Mage\n\nSideboard\n2 Negate\n1 Dispel`}
        className="w-full h-40 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-y font-mono"
      />
    </div>
  );
}
