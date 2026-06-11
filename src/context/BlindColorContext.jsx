import { createContext, useContext, useState, useEffect } from "react";

const BlindColorContext = createContext();

export function BlindColorProvider({ children }) {
  const [isBlindColor, setIsBlindColor] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("blindcolor_mode");
    const enabled = saved === "true";
    setIsBlindColor(enabled);
    applyBlindColorMode(enabled);
  }, []);

  const applyBlindColorMode = (enabled) => {
    if (enabled) {
      document.documentElement.setAttribute("data-blindcolor", "true");
    } else {
      document.documentElement.removeAttribute("data-blindcolor");
    }
  };

  const toggleBlindColor = () => {
    const newState = !isBlindColor;
    setIsBlindColor(newState);
    localStorage.setItem("blindcolor_mode", newState ? "true" : "false");
    applyBlindColorMode(newState);
  };

  return (
    <BlindColorContext.Provider value={{ isBlindColor, toggleBlindColor }}>
      {children}
    </BlindColorContext.Provider>
  );
}

export function useBlindColor() {
  const context = useContext(BlindColorContext);
  if (!context) {
    throw new Error("useBlindColor must be used within BlindColorProvider");
  }
  return context;
}
