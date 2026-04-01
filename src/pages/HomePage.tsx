import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CollectionInput } from "@components/Collection/CollectionInput";
import { DeckInputList } from "@components/Decks/DeckInputList";
import { ConfirmModal } from "@components/ui/ConfirmModal";
import { useApp } from "@context/AppContext";

export function HomePage() {
  const { canCompare, runComparison, resetAll, collectionText, deckInputs } =
    useApp();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleCompare = () => {
    runComparison();
    navigate("/results");
  };

  const handleReset = () => {
    resetAll();
    setShowResetModal(false);
  };

  // Show reset button only if there's data to clear
  const hasData =
    collectionText.trim() ||
    deckInputs.some((d) => d.content.trim() || d.name.trim());

  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          MTG Collection <span className="text-amber-500">Matcher</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Import your card collection and paste the decks you want to build.
          We'll show you what you already have and what you're missing.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left column: Collection */}
        <div>
          <CollectionInput />
        </div>

        {/* Right column: Decks */}
        <div>
          <DeckInputList />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 pb-8">
        {hasData && (
          <button
            onClick={() => setShowResetModal(true)}
            className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 rounded-xl transition-all"
          >
            Reset all
          </button>
        )}
        <button
          onClick={handleCompare}
          disabled={!canCompare}
          className={`px-8 py-3 text-lg font-semibold rounded-xl transition-all shadow-lg ${
            canCompare
              ? "bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-500/25 hover:shadow-amber-500/40 cursor-pointer"
              : "bg-gray-700 text-gray-500 cursor-not-allowed shadow-none"
          }`}
        >
          Compare Collection
        </button>
      </div>

      <ConfirmModal
        open={showResetModal}
        title="Reset everything?"
        message="This will clear your collection, all decks, and any results. This action cannot be undone."
        confirmLabel="Reset all"
        cancelLabel="Cancel"
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}
