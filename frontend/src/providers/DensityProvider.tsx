import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Table density preference shared between ProjectsTable and ProfileModal,
 * ported from REHUB WORK V8.html script block 1 (~lines 163-170).
 */
export type Density = "comfortable" | "compact";

export interface DensityContextValue {
  density: Density;
  setDensity: (density: Density) => void;
}

const STORAGE_KEY = "rh-density";

const DensityCtx = createContext<DensityContextValue>({
  density: "comfortable",
  setDensity: () => {},
});

function readInitialDensity(): Density {
  try {
    return localStorage.getItem(STORAGE_KEY) === "compact" ? "compact" : "comfortable";
  } catch {
    return "comfortable";
  }
}

export function DensityProvider({ children }: { children: ReactNode }) {
  const [density, setDensity] = useState<Density>(readInitialDensity);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, density);
    } catch {
      /* ignore persistence errors (e.g. private browsing) */
    }
  }, [density]);

  return <DensityCtx.Provider value={{ density, setDensity }}>{children}</DensityCtx.Provider>;
}

export function useDensity(): DensityContextValue {
  return useContext(DensityCtx);
}
