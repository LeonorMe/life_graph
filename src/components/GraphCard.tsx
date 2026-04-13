import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, subDays, subMonths, isAfter, startOfDay, subYears } from 'date-fns';
import { MoodEntry, GoalEntry, EMOJIS, MoodValue } from '../store/dataStore';
import { Settings as SettingsIcon } from 'lucide-react';

interface GraphCardProps {
  moods: MoodEntry[];
  goals: GoalEntry[];
  onOpenSettings: () => void;
}

type FilterType = 'week' | 'month' | 'year' | 'all';

export function GraphCard({ moods, goals, onOpenSettings }: GraphCardProps) {
  const [filter, setFilter] = useState<FilterType>('month');

  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date(0); // all time by default

    if (filter === 'week') cutoffDate = subDays(now, 7);
    if (filter === 'month') cutoffDate = subMonths(now, 1);
    if (filter === 'year') cutoffDate = subYears(now, 1);

    const relevantMoods = moods.filter(m => isAfter(new Date(m.timestamp), cutoffDate));

    // Sort by timestamp just in case
    relevantMoods.sort((a, b) => a.timestamp - b.timestamp);

    return relevantMoods.map(m => ({
      ...m,
      dateFormatted: format(new Date(m.timestamp), filter === 'week' ? 'EEE' : 'MMM dd'),
      fullDate: format(new Date(m.timestamp), 'PPpp'),
    }));
  }, [moods, filter]);

  // Find relevant goals for markers
  const futureGoals = useMemo(() => {
    const now = new Date();
    return goals.filter(g => isAfter(g.date, startOfDay(now)));
  }, [goals]);

  return (
    <div className="glass-panel animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '400px', padding: '1rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Emotion Graph</h2>
        <button className="btn-icon" onClick={onOpenSettings} aria-label="Settings">
          <SettingsIcon size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {(['week', 'month', 'year', 'all'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: filter === f ? 'var(--accent-glass)' : 'transparent',
              color: filter === f ? 'var(--accent-color)' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}
          >
            {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'year' ? 'This Year' : 'All Time'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {filteredData.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            No data for this period yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dateFormatted" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]} 
                stroke="var(--text-muted)" 
                fontSize={16} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => EMOJIS[value as MoodValue] || ''}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-panel" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-muted)' }}>{data.fullDate}</p>
                        <p style={{ margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>{EMOJIS[data.value as MoodValue]}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {futureGoals.length > 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
           <span style={{fontWeight: 'bold'}}>Upcoming:</span>
           {futureGoals.map(g => (
             <span key={g.id} style={{ whiteSpace: 'nowrap' }}>
               {format(g.date, 'MMM dd')}: {g.info} ({EMOJIS[g.expectedFeeling]})
             </span>
           ))}
        </div>
      )}
    </div>
  );
}
