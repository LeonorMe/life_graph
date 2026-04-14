import { useState, useEffect } from 'react';

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export const EMOJIS: Record<MoodValue, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '🤩',
};

export interface MoodEntry {
  id: string;
  timestamp: number; // unix timestamp
  value: MoodValue;
}

export interface GoalEntry {
  id: string;
  date: number; // unix timestamp
  info: string;
  expectedFeeling: MoodValue;
}

export interface NotificationSettings {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23
}

// Helper to generate IDs safely (crypto.randomUUID can fail in non-secure contexts or older mobile browsers)
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback
    }
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Local Storage Keys
const MOODS_KEY = 'emotions_graph_moods';
const GOALS_KEY = 'emotions_graph_goals';
const NOTIFICATIONS_KEY = 'emotions_graph_notifications';

// Helper to get from local storage
function getStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Helper to set to local storage
function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Hooks
export function useMoods() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);

  useEffect(() => {
    setMoods(getStorage<MoodEntry[]>(MOODS_KEY, []));
  }, []);

  const addMood = (value: MoodValue) => {
    const newEntry: MoodEntry = {
      id: generateId(),
      timestamp: Date.now(),
      value,
    };
    const updated = [...moods, newEntry];
    setMoods(updated);
    setStorage(MOODS_KEY, updated);
  };

  return { moods, addMood };
}

export function useGoals() {
  const [goals, setGoals] = useState<GoalEntry[]>([]);

  useEffect(() => {
    setGoals(getStorage<GoalEntry[]>(GOALS_KEY, []));
  }, []);

  const addGoal = (entry: Omit<GoalEntry, 'id'>) => {
    const newGoal = { ...entry, id: generateId() };
    const updated = [...goals, newGoal];
    setGoals(updated);
    setStorage(GOALS_KEY, updated);
  };

  const removeGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    setStorage(GOALS_KEY, updated);
  };

  const updateGoal = (id: string, newEntry: Omit<GoalEntry, 'id'>) => {
     const updated = goals.map(g => g.id === id ? { ...newEntry, id } : g);
     setGoals(updated);
     setStorage(GOALS_KEY, updated);
  };

  return { goals, addGoal, removeGoal, updateGoal };
}

export function useSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    startHour: 9,
    endHour: 22,
  });

  useEffect(() => {
    setSettings(getStorage<NotificationSettings>(NOTIFICATIONS_KEY, settings));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    setStorage(NOTIFICATIONS_KEY, newSettings);
  };

  return { settings, updateSettings };
}

// Global Backup Utilities
export function exportData() {
  const data = {
    moods: getStorage(MOODS_KEY, []),
    goals: getStorage(GOALS_KEY, []),
    settings: getStorage(NOTIFICATIONS_KEY, {})
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `syncvibe_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.moods) setStorage(MOODS_KEY, data.moods);
        if (data.goals) setStorage(GOALS_KEY, data.goals);
        if (data.settings) setStorage(NOTIFICATIONS_KEY, data.settings);
        
        resolve(true);
      } catch (err) {
        console.error('Import failed', err);
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}

export function clearAllData() {
  localStorage.removeItem(MOODS_KEY);
  localStorage.removeItem(GOALS_KEY);
  localStorage.removeItem(NOTIFICATIONS_KEY);
}
