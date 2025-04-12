
import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontType = 'default' | 'opendyslexic' | 'dyslexie';
export type BackgroundType = 'default' | 'cream' | 'beige' | 'soft-blue' | 'soft-green' | 'light-pink';

interface DyslexiaSettings {
  enabled: boolean;
  font: FontType;
  backgroundColor: BackgroundType;
  lineSpacing: number; // 1-3 representing normal to 2x spacing
  letterSpacing: number; // 0-5 representing tracking-normal to tracking-widest
  reduceVisualNoise: boolean;
  readingModeActive: boolean;
  speechRate: number; // 0.5-2
}

interface DyslexiaContextType {
  settings: DyslexiaSettings;
  updateSettings: (settings: Partial<DyslexiaSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: DyslexiaSettings = {
  enabled: false,
  font: 'default',
  backgroundColor: 'default',
  lineSpacing: 1.5,
  letterSpacing: 1,
  reduceVisualNoise: false,
  readingModeActive: false,
  speechRate: 1.0,
};

const DyslexiaContext = createContext<DyslexiaContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
});

export const useDyslexiaSettings = () => useContext(DyslexiaContext);

interface DyslexiaProviderProps {
  children: React.ReactNode;
}

export const DyslexiaProvider: React.FC<DyslexiaProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<DyslexiaSettings>(defaultSettings);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('dyslexia-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dyslexia-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<DyslexiaSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <DyslexiaContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </DyslexiaContext.Provider>
  );
};
