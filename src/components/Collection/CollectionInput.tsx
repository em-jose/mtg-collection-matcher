import { useRef } from "react";
import { useApp } from "@context/AppContext";

export function CollectionInput() {
  const { collectionText, importCollection, collection } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (text: string) => {
    importCollection(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      importCollection(text);
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Your Collection</h2>
        {collection && collection.cards.length > 0 && (
          <span className="text-sm text-emerald-400">
            {collection.uniqueCards} unique cards ({collection.totalCards}{" "}
            total)
          </span>
        )}
      </div>

      <textarea
        value={collectionText}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={`Paste your Moxfield collection here...\n\nFormat examples:\n1 Sol Ring\n4 Lightning Bolt\n1x Counterspell (MKM)\n\nOr upload a Moxfield CSV export below.`}
        className="w-full h-48 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-y font-mono"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors border border-gray-600"
        >
          Upload file (.txt, .csv)
        </button>
        {collectionText && (
          <button
            onClick={() => importCollection("")}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
