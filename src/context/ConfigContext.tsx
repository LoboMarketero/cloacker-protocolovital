import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our configuration
interface TrafficFilterConfig {
  targetUrl: string;
  riskThreshold: number;
  allowedCountries: string[];
  allowConfigChange: boolean;
}

interface UTMParams {
  [key: string]: string;
}

interface ConfigContextType {
  config: TrafficFilterConfig;
  utmParams: UTMParams;
  updateConfig: (newConfig: Partial<TrafficFilterConfig>) => void;
  setUtmParams: (params: UTMParams) => void;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Default configuration
const defaultConfig: TrafficFilterConfig = {
  targetUrl: 'https://example.com',
  riskThreshold: 6,
  allowedCountries: ['BR'],
  allowConfigChange: true
};

// Create context
const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Provider component
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TrafficFilterConfig>(() => {
    // Try to load config from localStorage
    const savedConfig = localStorage.getItem('trafficFilterConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });
  
  const [utmParams, setUtmParams] = useState<UTMParams>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('trafficFilterConfig', JSON.stringify(config));
  }, [config]);
  
  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      const sessionData = JSON.parse(session);
      const now = new Date().getTime();
      
      // Session timeout after 30 minutes
      if (sessionData.expiry > now) {
        setIsAuthenticated(true);
        
        // Update expiry time
        const newExpiry = now + 30 * 60 * 1000; // 30 minutes
        localStorage.setItem('adminSession', JSON.stringify({
          ...sessionData,
          expiry: newExpiry
        }));
      } else {
        // Session expired
        localStorage.removeItem('adminSession');
      }
    }
  }, []);
  
  // Update config partially
  const updateConfig = (newConfig: Partial<TrafficFilterConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  };
  
  // Login function
  const login = (username: string, password: string): boolean => {
    // Updated credentials
    if (username === 'admin' && password === 'vital2024') {
      setIsAuthenticated(true);
      
      // Set session with expiry time (30 minutes)
      const expiry = new Date().getTime() + 30 * 60 * 1000;
      localStorage.setItem('adminSession', JSON.stringify({
        username,
        expiry
      }));
      
      return true;
    }
    return false;
  };
  
  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminSession');
  };
  
  const value = {
    config,
    utmParams,
    updateConfig,
    setUtmParams,
    isAuthenticated,
    login,
    logout
  };
  
  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

// Custom hook for using the config context
export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}