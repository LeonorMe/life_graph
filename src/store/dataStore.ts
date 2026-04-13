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
      id: crypto.randomUUID(),
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
    const newGoal = { ...entry, id: crypto.randomUUID() };
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
