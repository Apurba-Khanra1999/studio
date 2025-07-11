
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './use-auth';

// Helper function to get the key for local storage
const getApiKeyLocalStorageKey = (userId: string) => `taskflow-gemini-apikey-${userId}`;

interface ApiKeyContextType {
  apiKey: string | null;
  isApiKeySet: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  isInitialized: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [apiKey, _setApiKey] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load API key from local storage when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      try {
        const key = getApiKeyLocalStorageKey(user.uid);
        const storedApiKey = window.localStorage.getItem(key);
        if (storedApiKey) {
          _setApiKey(storedApiKey);
        }
      } catch (error) {
        console.error("Failed to load API key from local storage", error);
      } finally {
        setIsInitialized(true);
      }
    } else if (!authLoading && !user) {
        // If user logs out, clear the state
        _setApiKey(null);
        setIsInitialized(true);
    }
  }, [user, authLoading]);

  const setApiKey = useCallback((key: string) => {
    if (user) {
      try {
        const storageKey = getApiKeyLocalStorageKey(user.uid);
        window.localStorage.setItem(storageKey, key);
        _setApiKey(key);
      } catch (error) {
        console.error("Failed to save API key to local storage", error);
      }
    }
  }, [user]);

  const clearApiKey = useCallback(() => {
    if (user) {
      try {
        const storageKey = getApiKeyLocalStorageKey(user.uid);
        window.localStorage.removeItem(storageKey);
        _setApiKey(null);
      } catch (error) {
        console.error("Failed to clear API key from local storage", error);
      }
    }
  }, [user]);

  const isApiKeySet = !!apiKey;

  const value = {
    apiKey,
    isApiKeySet,
    setApiKey,
    clearApiKey,
    isInitialized: isInitialized && !authLoading,
  };

  return React.createElement(ApiKeyContext.Provider, { value }, children);
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}
