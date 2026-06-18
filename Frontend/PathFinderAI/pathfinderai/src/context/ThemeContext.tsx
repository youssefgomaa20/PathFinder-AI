import { createContext } from "react";

interface ThemeContextType {
  dark: boolean;
  toggleDark: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  dark: true,
  toggleDark: () => {},
});