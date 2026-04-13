import { useState } from 'react';
import { EMOJIS, type MoodValue } from '../store/dataStore';

interface MoodLogProps {
  onLogMood: (value: MoodValue) => void;
}

export function MoodLog({ onLogMood }: MoodLogProps) {
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLog = () => {
    if (!selected) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onLogMood(selected);
      setSelected(null);
      setIsSubmitting(false);
    }, 500); // simulate a tiny delay for the animation
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
      <h3 style={{ textAlign: 'center', margin: 0, fontWeight: 500 }}>How are you feeling right now?</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        {(Object.keys(EMOJIS) as unknown as MoodValue[]).map((val) => {
          const numValue = Number(val) as MoodValue;
          return (
            <button
              key={val}
              className={`emoji-btn ${selected === numValue ? 'selected' : ''}`}
              onClick={() => setSelected(numValue)}
              disabled={isSubmitting}
            >
              {EMOJIS[numValue]}
            </button>
          );
        })}
      </div>

      <button 
        className="btn-primary" 
        style={{ opacity: selected ? 1 : 0.5, transition: 'opacity 0.2s' }}
        disabled={!selected || isSubmitting}
        onClick={handleLog}
      >
        {isSubmitting ? 'Logging...' : 'Log It'}
      </button>
    </div>
  );
}
