import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  Card,
  UserCollection,
  DeckInput,
  DeckMatchResult,
  SharedCard,
  CardPrice,
  Currency,
} from "@types";

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

export function AppProvider({ children }: { children: ReactNode }) {
  const canCompare = true;
  const [collectionText, setCollectionText] = useState("");
  const [deckInputs, setDeckInputs] = useState<DeckInput[]>([]);

  return (
    <AppContext.Provider
      value={{
        canCompare,
        collectionText,
        setCollectionText,
        deckInputs,
        setDeckInputs,
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
