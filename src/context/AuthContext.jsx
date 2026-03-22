import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config/config";
import { getUserInfo, isTokenExpired } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear auth state and localStorage
  const clearAuth = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Check token and fetch user info
  const checkAuthAndFetchUser = async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken || isTokenExpired(storedToken)) {
      clearAuth();
      return false;
    }

    setToken(storedToken);
    const result = await getUserInfo();

    if (result && result.status) {
      setUser(result.user);
      return true;
    } else {
      // API call failed (invalid token), clear auth
      clearAuth();
      return false;
    }
  };

  // Initial auth check on load
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthAndFetchUser();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Check token expiration on visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const storedToken = localStorage.getItem("token");
        if (storedToken && isTokenExpired(storedToken)) {
          clearAuth();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

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

      const data = await response.json();

      if (!data.token) {
        throw new Error(data.message || "La connexion a échoué");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);

      // Fetch user info from API
      const userResult = await getUserInfo();
      if (userResult && userResult.status) {
        setUser(userResult.user);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    clearAuth();
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
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
