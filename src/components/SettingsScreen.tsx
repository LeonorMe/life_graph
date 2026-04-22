import { useState } from 'react';
import { ChevronLeft, Plus, Trash2, Download, Upload, ShieldAlert, Database } from 'lucide-react';
import { EMOJIS, type GoalEntry, type MoodValue, type NotificationSettings, exportData, importData, clearAllData } from '../store/dataStore';
import { format } from 'date-fns';

interface SettingsScreenProps {
  onBack: () => void;
  goals: GoalEntry[];
  onAddGoal: (goal: Omit<GoalEntry, 'id'>) => void;
  onRemoveGoal: (id: string) => void;
  settings: NotificationSettings;
  onUpdateSettings: (s: NotificationSettings) => void;
}

export function SettingsScreen({ onBack, goals, onAddGoal, onRemoveGoal, settings, onUpdateSettings }: SettingsScreenProps) {
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newGoalInfo, setNewGoalInfo] = useState('');
  const [newGoalEmoji, setNewGoalEmoji] = useState<MoodValue>(6);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalDate || !newGoalInfo) return;
    
    // Parse local date strictly without timezone sliding:
    const [year, month, day] = newGoalDate.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    onAddGoal({
      date: dateObj.getTime(),
      info: newGoalInfo,
      expectedFeeling: newGoalEmoji
    });

    setNewGoalDate('');
    setNewGoalInfo('');
    setNewGoalEmoji(6);
  };

  const handleSettingsChange = (field: keyof NotificationSettings, val: any) => {
    onUpdateSettings({ ...settings, [field]: val });
  };

  return (
    <div className="container animate-slide-up" style={{ padding: '0 1rem 2rem 1rem' }}>
      <div className="glass-header" style={{ margin: '0 -1rem 1.5rem -1rem', padding: '1rem' }}>
        <button className="btn-icon" onClick={onBack} aria-label="Go Back">
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ flex: 1, textAlign: 'center' }}>Settings & Goals</h2>
        <div style={{ width: 44 }}></div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Notification Preferences</h3>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
          By enabling this, the app will try to notify you occasionally to log your feelings.
        </p>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={settings.enabled}
            onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
            style={{ width: '20px', height: '20px' }}
          />
          Enable Local Reminders (Silent)
        </label>

        {settings.enabled && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Start Hour (0-23)</label>
              <input 
                type="number" 
                min="0" max="23" 
                value={settings.startHour}
                onChange={(e) => handleSettingsChange('startHour', parseInt(e.target.value) || 0)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>End Hour (0-23)</label>
              <input 
                type="number" 
                min="0" max="23" 
                value={settings.endHour}
                onChange={(e) => handleSettingsChange('endHour', parseInt(e.target.value) || 23)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Future Goals</h3>
        
        <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Target Date</label>
            <input 
              type="date" 
              required
              value={newGoalDate}
              onChange={(e) => setNewGoalDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Goal / Event Info</label>
            <input 
              type="text" 
              placeholder="E.g., Final Presentation"
              required
              value={newGoalInfo}
              onChange={(e) => setNewGoalInfo(e.target.value)}
            />
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Expected Feeling</label>
            <div style={{ display: 'flex', gap: '0.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {(Object.keys(EMOJIS) as unknown as MoodValue[])
                .sort((a, b) => Number(b) - Number(a))
                .map((val) => {
                  const numValue = Number(val) as MoodValue;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNewGoalEmoji(numValue)}
                    style={{
                      flex: 1, padding: '0.5rem', fontSize: '1.5rem',
                      background: newGoalEmoji === numValue ? 'var(--accent-glass)' : 'transparent',
                      border: `1px solid ${newGoalEmoji === numValue ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      borderRadius: '8px'
                    }}
                  >
                     {EMOJIS[numValue]}
                  </button>
                )
              })}
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Plus size={20} /> Add Goal
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {goals.length === 0 ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No goals set yet. Add one above!</div>
          ) : (
             goals.map(goal => (
               <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                 <div style={{ fontSize: '2rem' }}>{EMOJIS[goal.expectedFeeling]}</div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 600 }}>{goal.info}</div>
                   <div className="text-muted" style={{ fontSize: '0.875rem' }}>{format(goal.date, 'PPP')}</div>
                 </div>
                 <button className="btn-icon" onClick={() => onRemoveGoal(goal.id)} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                   <Trash2 size={18} />
                 </button>
               </div>
             ))
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={20} /> Data & Privacy
        </h3>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Your data is stored locally on this device. You can export it to a file for backup or import it later.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn-primary" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} onClick={() => exportData()}>
            <Download size={20} /> Export Backup (.json)
          </button>
          
          <label className="btn-primary" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer' }}>
            <Upload size={20} /> Import Backup (.json)
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const success = await importData(file);
                  if (success) {
                    alert('Data imported successfully! Refreshing...');
                    window.location.reload();
                  } else {
                    alert('Failed to import data. Please ensure the file is a valid SyncVibe backup.');
                  }
                }
              }}
            />
          </label>

          <button 
            className="btn-primary" 
            style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            onClick={() => {
              if (confirm('Are you absolutely sure you want to delete ALL your data? This cannot be undone.')) {
                clearAllData();
                window.location.reload();
              }
            }}
          >
            <ShieldAlert size={20} /> Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
