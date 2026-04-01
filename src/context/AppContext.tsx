import { createContext, type ReactNode } from "react";

interface AppContextType {
  canCompare: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const canCompare = true;

  return (
    <AppContext.Provider value={{ canCompare }}>{children}</AppContext.Provider>
  );
}
