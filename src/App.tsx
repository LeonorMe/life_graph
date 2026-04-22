import { useState, useEffect } from 'react';
import { GraphCard } from './components/GraphCard';
import { MoodLog } from './components/MoodLog';
import { SettingsScreen } from './components/SettingsScreen';
import { useMoods, useGoals, useSettings } from './store/dataStore';

function App() {
  const [screen, setScreen] = useState<'main' | 'settings'>('main');
  const { moods, addMood } = useMoods();
  const { goals, addGoal, removeGoal } = useGoals();
  const { settings, updateSettings } = useSettings();
  
  // Notification Logic Timer
  useEffect(() => {
    if (!settings.enabled) return;

    let intervalId: ReturnType<typeof setInterval>;

    const checkAndNotify = () => {
      if (typeof Notification === 'undefined' || !settings) return;
      
      const now = new Date();
      const hour = now.getHours();

      // Check if within allowed hours (with defaults just in case)
      const startHour = settings.startHour ?? 9;
      const endHour = settings.endHour ?? 22;

      if (hour >= startHour && hour < endHour) {
        // Find if we already logged in the last 2 hours (avoid spamming)
        const lastMood = moods.length > 0 ? moods[moods.length - 1] : null;
        const timeSinceLastLog = lastMood ? now.getTime() - lastMood.timestamp : Infinity;
        
        if (timeSinceLastLog > 1000 * 60 * 60 * 2) { // 2 hours
          // Simple silent local notification logic
          if (Notification.permission === 'granted') {
             // We use a silent notification as requested
             new Notification('Time to check in!', {
                body: 'How are you feeling right now?',
                icon: '/vite.svg',
                silent: true
             });
          } else if (Notification.permission !== 'denied') {
             Notification.requestPermission();
          }
        }
      }
    };

    // Check every hour (simplified simulation for frontend)
    intervalId = setInterval(checkAndNotify, 1000 * 60 * 60);

    // Run once on mount if tab was reopened
    checkAndNotify();

    return () => clearInterval(intervalId);
  }, [settings, moods]);

  return (
    <>
      {screen === 'main' ? (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SyncVibe
            </h1>
            <p className="text-muted" style={{ margin: '0.5rem 0 0 0' }}>Track your emotional journey</p>
          </div>
          
          <GraphCard 
            moods={moods} 
            goals={goals} 
            onOpenSettings={() => setScreen('settings')} 
          />

          <MoodLog onLogMood={addMood} />
        </div>
      ) : (
        <SettingsScreen 
          onBack={() => setScreen('main')} 
          goals={goals}
          onAddGoal={addGoal}
          onRemoveGoal={removeGoal}
          settings={settings}
          onUpdateSettings={updateSettings}
        />
      )}
    </>
  );
}

export default App;
