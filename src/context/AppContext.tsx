import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  Card,
  UserCollection,
  DeckInput,
  DeckMatchResult,
  SharedCard,
  CardPrice,
  Currency,
} from "@types";
import { parseCollection } from "@services/collectionParser";
import { parseDeck } from "@services/deckParser";
import {
  buildCombinedMissingList,
  findSharedCards,
  matchAllDecks,
} from "@utils/deckMatcher";

const STORAGE_KEY_COLLECTION = "mtg-collection";
const STORAGE_KEY_DECKS = "mtg-decks";
const STORAGE_KEY_CURRENCY = "mtg-currency";

interface AppState {
  // Input state
  collectionText: string;
  collection: UserCollection | null;
  deckInputs: DeckInput[];

  // Results state
  results: DeckMatchResult[] | null;
  sharedCards: SharedCard[];
  combinedMissing: Card[];

  // Prices
  prices: Map<string, CardPrice>;
  pricesLoading: boolean;
  pricesProgress: { loaded: number; total: number };

  // Settings
  currency: Currency;
}

interface AppContextType extends AppState {
  setCollectionText: (text: string) => void;
  importCollection: (text: string) => void;
  addDeckInput: () => void;
  removeDeckInput: (id: string) => void;
  updateDeckInput: (
    id: string,
    field: "name" | "content",
    value: string,
  ) => void;
  runComparison: () => void;
  setCurrency: (currency: Currency) => void;
  setPrices: (prices: Map<string, CardPrice>) => void;
  setPricesLoading: (loading: boolean) => void;
  setPricesProgress: (progress: { loaded: number; total: number }) => void;
  resetResults: () => void;
  resetAll: () => void;
  canCompare: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

function generateDeckId(): string {
  return crypto.randomUUID();
}

function loadSavedCollection(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_COLLECTION) || "";
  } catch {
    return "";
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const canCompare = true;
  const [collectionText, setCollectionText] = useState(loadSavedCollection);
  const [collection, setCollection] = useState<UserCollection | null>(() => {
    const saved = loadSavedCollection();
    return saved ? parseCollection(saved) : null;
  });
  const [deckInputs, setDeckInputs] = useState<DeckInput[]>([]);
  const [results, setResults] = useState<DeckMatchResult[] | null>(null);
  const [sharedCards, setSharedCards] = useState<SharedCard[]>([]);
  const [combinedMissing, setCombinedMissing] = useState<Card[]>([]);

  // Persist collection text to localStorage
  useEffect(() => {
    try {
      if (collectionText) {
        localStorage.setItem(STORAGE_KEY_COLLECTION, collectionText);
      } else {
        localStorage.removeItem(STORAGE_KEY_COLLECTION);
      }
    } catch {
      /* storage full or unavailable */
    }
  }, [collectionText]);

  // Persist deck inputs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DECKS, JSON.stringify(deckInputs));
    } catch {
      /* storage full or unavailable */
    }
  }, [deckInputs]);

  // Auto-run comparison on mount if we have saved data
  useEffect(() => {
    if (
      collection &&
      collection.cards.length > 0 &&
      deckInputs.some((d) => d.content.trim())
    ) {
      const parsedDecks = deckInputs
        .filter((d) => d.content.trim())
        .map((d) => parseDeck(d.content, d.id, d.name || undefined));

      if (parsedDecks.length > 0) {
        const matchResults = matchAllDecks(parsedDecks, collection);
        const shared = findSharedCards(parsedDecks, collection);
        const combined = buildCombinedMissingList(matchResults);
        setResults(matchResults);
        setSharedCards(shared);
        setCombinedMissing(combined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const importCollection = useCallback((text: string) => {
    setCollectionText(text);
    const parsed = parseCollection(text);
    setCollection(parsed);
  }, []);

  const addDeckInput = useCallback(() => {
    setDeckInputs((prev) => [
      ...prev,
      { id: generateDeckId(), name: "", content: "" },
    ]);
  }, []);

  const removeDeckInput = useCallback((id: string) => {
    setDeckInputs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const updateDeckInput = useCallback(
    (id: string, field: "name" | "content", value: string) => {
      setDeckInputs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
      );
    },
    [],
  );

  return (
    <AppContext.Provider
      value={{
        canCompare,
        collectionText,
        deckInputs,
        results,
        sharedCards,
        combinedMissing,
        setDeckInputs,
        setCollectionText,
        importCollection,
        addDeckInput,
        removeDeckInput,
        updateDeckInput,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
