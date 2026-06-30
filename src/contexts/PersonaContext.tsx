import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Persona = "sme" | "corporate" | "individual" | null;

type PersonaContextValue = {
  persona: Persona;
  setPersona: (p: Persona) => void;
};

const STORAGE_KEY = "moments_persona";

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "sme" || stored === "corporate" || stored === "individual") {
        setPersonaState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    if (typeof window === "undefined") return;
    try {
      if (p === null) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, p);
      }
    } catch {
      // ignore
    }
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return ctx;
}
