import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config/config";
import { getUserInfo } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Clear expired cookie via logout API
  const clearExpiredCookie = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // ne rien faire car peut etre déja nettoyé
    }
  };

  // Check auth via API (cookie is sent automatically)
  // Skips the call if authChecked is already true (user confirmed authenticated)
  const checkAuthAndFetchUser = async ({ force = false } = {}) => {
    if (authChecked && !force) return true;

    const result = await getUserInfo();

    if (result && result.status) {
      setUser(result.user);
      setAuthChecked(true);
      return true;
    } else {
      await clearExpiredCookie();
      setUser(null);
      setAuthChecked(false);
      return false;
    }
  };

  // Initial auth check on load
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthAndFetchUser({ force: true });
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Re-check auth on visibility change (tab focus), only if not yet confirmed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !authChecked) {
        checkAuthAndFetchUser();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [authChecked]);

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "La connexion a échoué");
      }

      const userResult = await getUserInfo();
      if (userResult && userResult.status) {
        setUser(userResult.user);
        setAuthChecked(true);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    setUser(null);
    setAuthChecked(false);
    await clearExpiredCookie();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    authChecked,
    register,
    login,
    logout,
    fetchUserInfo: checkAuthAndFetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
