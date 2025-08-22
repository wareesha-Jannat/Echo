"use client";
import { createContext, useState, useContext, ReactNode } from "react";

interface QodContextType {
  qod: boolean;
  setQod: (val: boolean) => void;
}
const QodContext = createContext<QodContextType | null>(null);

export function QodProvider({ children }: { children: ReactNode }) {
  const [qod, setQod] = useState(false);
  return (
    <QodContext.Provider value={{ qod, setQod }}>
      {children}
    </QodContext.Provider>
  );
}

export function useQod() {
  const context = useContext(QodContext);
  if (!context) {
    throw new Error("useQod must be used within a QodProvider");
  }
  return context;
}
