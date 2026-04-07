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

function loadSavedDecks(): DeckInput[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DECKS);
    if (saved) {
      const parsed = JSON.parse(saved) as DeckInput[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [{ id: generateDeckId(), name: "", content: "" }];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [collectionText, setCollectionText] = useState(loadSavedCollection);
  const [collection, setCollection] = useState<UserCollection | null>(() => {
    const saved = loadSavedCollection();
    return saved ? parseCollection(saved) : null;
  });
  const [deckInputs, setDeckInputs] = useState<DeckInput[]>(loadSavedDecks);
  const [results, setResults] = useState<DeckMatchResult[] | null>(null);
  const [sharedCards, setSharedCards] = useState<SharedCard[]>([]);
  const [combinedMissing, setCombinedMissing] = useState<Card[]>([]);
  const [prices, setPrices] = useState<Map<string, CardPrice>>(new Map());
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesProgress, setPricesProgress] = useState({ loaded: 0, total: 0 });
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem(STORAGE_KEY_CURRENCY) as Currency) || "eur";
  });

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

  const runComparison = useCallback(() => {
    if (!collection) return;

    const parsedDecks = deckInputs
      .filter((d) => d.content.trim())
      .map((d) => parseDeck(d.content, d.id, d.name || undefined));

    if (parsedDecks.length === 0) return;

    const matchResults = matchAllDecks(parsedDecks, collection);
    const shared = findSharedCards(parsedDecks, collection);
    const combined = buildCombinedMissingList(matchResults);

    setResults(matchResults);
    setSharedCards(shared);
    setCombinedMissing(combined);
  }, [collection, deckInputs]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY_CURRENCY, c);
  }, []);

  const resetResults = useCallback(() => {
    setResults(null);
    setSharedCards([]);
    setCombinedMissing([]);
    setPrices(new Map());
  }, []);

  const resetAll = useCallback(() => {
    setCollectionText("");
    setCollection(null);
    setDeckInputs([{ id: generateDeckId(), name: "", content: "" }]);
    setResults(null);
    setSharedCards([]);
    setCombinedMissing([]);
    setPrices(new Map());
    localStorage.removeItem(STORAGE_KEY_COLLECTION);
    localStorage.removeItem(STORAGE_KEY_DECKS);
  }, []);

  const canCompare = Boolean(
    collection &&
    collection.cards.length > 0 &&
    deckInputs.some((d) => d.content.trim()),
  );

  return (
    <AppContext.Provider
      value={{
        collectionText,
        collection,
        deckInputs,
        results,
        sharedCards,
        combinedMissing,
        prices,
        pricesLoading,
        pricesProgress,
        currency,
        setCollectionText,
        importCollection,
        addDeckInput,
        removeDeckInput,
        updateDeckInput,
        runComparison,
        setCurrency,
        setPrices,
        setPricesLoading,
        setPricesProgress,
        resetResults,
        resetAll,
        canCompare,
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
