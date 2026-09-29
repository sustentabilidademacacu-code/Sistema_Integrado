import React, { createContext, useContext, useState } from 'react';

export type ThemeColors = {
  isDark: boolean;
  bg: string;
  bgSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  headerBg: string;
  headerBorder: string;
  badgeBg: string;
  badgeBorder: string;
  inputBg: string;
  inputBorder: string;
  mapOverlay: string;
};

const lightColors: ThemeColors = {
  isDark: false,
  bg: '#f8fafc',
  bgSecondary: '#f1f5f9',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  primary: '#0f40d4',
  primaryLight: '#eff6ff',
  primaryDark: '#0a2b8e',
  accent: '#f59e0b',
  headerBg: '#ffffff',
  headerBorder: '#f1f5f9',
  badgeBg: '#eff6ff',
  badgeBorder: '#bfdbfe',
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  mapOverlay: 'rgba(15, 64, 212, 0.08)',
};

const darkColors: ThemeColors = {
  isDark: true,
  bg: '#061325',
  bgSecondary: '#0a1d38',
  card: '#0d2547',
  cardBorder: '#163868',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  primary: '#2563eb',
  primaryLight: '#132e56',
  primaryDark: '#1d4ed8',
  accent: '#fbbf24',
  headerBg: '#081932',
  headerBorder: '#133566',
  badgeBg: '#132e56',
  badgeBorder: '#1e4884',
  inputBg: '#091c38',
  inputBorder: '#1d447a',
  mapOverlay: 'rgba(37, 99, 235, 0.15)',
};

export type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  fontScale: number;
  scaleFont: (size: number) => number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
  fontScale: 1,
  scaleFont: (size: number) => size,
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  resetFontSize: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [fontScale, setFontScale] = useState(1.0);

  const toggleTheme = () => setIsDark(prev => !prev);

  const increaseFontSize = () => {
    setFontScale(prev => Math.min(prev + 0.15, 1.45));
  };

  const decreaseFontSize = () => {
    setFontScale(prev => Math.max(prev - 0.15, 0.85));
  };

  const resetFontSize = () => setFontScale(1.0);

  const scaleFont = (size: number) => Math.round(size * fontScale);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{
      isDark,
      colors,
      toggleTheme,
      fontScale,
      scaleFont,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
