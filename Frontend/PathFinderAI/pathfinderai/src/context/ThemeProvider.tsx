import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContext.js";
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  const toggleDark = () => setDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}