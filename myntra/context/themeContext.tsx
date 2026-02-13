import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "@/constants/theme";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof lightTheme.colors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "@app_theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Use device theme as a fallback, but we will update this in useEffect
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
          setTheme(storedTheme);
        } else {
          // Default to device setting if no preference is saved
          const deviceTheme = Appearance.getColorScheme() ?? "light";
          setTheme(deviceTheme);
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Save theme whenever it changes (except on first load)
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, isLoaded]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";
  const themeObject = isDark ? darkTheme : lightTheme;

  // IMPORTANT: Prevent rendering children until we know the correct theme
  // to avoid the screen starting white and then snapping to dark.
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        colors: themeObject.colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
/* 
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "@/constants/theme";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof lightTheme.colors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "@app_theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const deviceTheme = Appearance.getColorScheme() ?? "light";

  const [theme, setTheme] = useState<ThemeMode>(deviceTheme);

  // Load saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }
    };
    loadTheme();
  }, []);

  // Save theme when changed
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";
  const themeObject = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        colors: themeObject.colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
 */