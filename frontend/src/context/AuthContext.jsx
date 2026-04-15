import { createContext, useContext, useMemo, useEffect, useState } from "react";
import apiClient, { setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [accessToken, setAccessTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync token to API client whenever it changes
  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  const saveSession = (payload) => {
    setAccessTokenState(payload.accessToken);
    localStorage.setItem("currentUser", JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const register = async (formData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/register", formData);
      saveSession(response.data.data);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (formData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", formData);
      saveSession(response.data.data);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      // Clear local session even if API logout fails.
    }

    setAccessTokenState(null);
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: Boolean(user && accessToken),
      register,
      login,
      logout,
    }),
    [user, accessToken, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
