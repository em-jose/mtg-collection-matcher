import { useApp } from "@context/AppContext";
import { DeckInput } from "@components/Decks/DeckInput";

export function DeckInputList() {
  const { deckInputs, addDeckInput } = useApp();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Decks to Build</h2>

      <div className="space-y-4">
        {deckInputs.map((deck) => (
          <DeckInput
            key={deck.id}
            deck={deck}
            canRemove={deckInputs.length > 1}
          />
        ))}
      </div>

      <button
        onClick={addDeckInput}
        className="w-full py-3 border-2 border-dashed border-gray-600 hover:border-amber-500/50 rounded-lg text-gray-400 hover:text-amber-500 transition-colors text-sm font-medium"
      >
        + Add another deck
      </button>
    </div>
  );
}
