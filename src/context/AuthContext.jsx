import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config/config";
import { getUserInfo, clearUserInfo } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // onLoad Verify token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);

        const result = await getUserInfo();
        if (result && result.status) {
          setUser(result.user);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Storage Listener to verify token
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "token") {
        const newToken = localStorage.getItem("token");

        if (!newToken) {
          setToken(null);
          setUser(null);
        } else {
          setToken(newToken);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken && token) {
        setToken(null);
        setUser(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

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

      // Fetch user info from /api/me and store in user_info (force refresh)
      const userResult = await getUserInfo(true);
      if (userResult && userResult.status) {
        setUser(userResult.user);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    clearUserInfo();
    setToken(null);
    setUser(null);
  };

  // Function to fetch/refresh user info
  const fetchUserInfo = async () => {
    const result = await getUserInfo();
    if (result && result.status) {
      setUser(result.user);
      return result;
    }
    return null;
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    register,
    login,
    logout,
    fetchUserInfo,
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
