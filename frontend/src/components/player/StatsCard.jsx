import { Trophy, TrendingUp, Target, Flame, Calendar, Users } from 'lucide-react';

const StatsCard = ({ icon: Icon, label, value, subtitle, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            trend > 0 
              ? 'bg-green-100 text-green-700' 
              : trend < 0 
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

const PerformanceGrid = ({ stats }) => {
  const winRate = stats?.matches_played > 0 
    ? Math.round((stats.wins / stats.matches_played) * 100)
    : 0;

  const getStreakDisplay = () => {
    if (!stats?.current_streak) return '—';
    if (stats.current_streak > 0) return `🔥 ${stats.current_streak}`;
    if (stats.current_streak < 0) return `📉 ${Math.abs(stats.current_streak)}`;
    return '—';
  };

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <StatsCard
        icon={Calendar}
        label="Matches Played"
        value={stats?.matches_played || 0}
        color="blue"
      />
      
      <StatsCard
        icon={Target}
        label="Win Rate"
        value={`${winRate}%`}
        subtitle={stats?.matches_played > 0 ? `${stats.wins}W • ${stats.losses}L` : 'No matches yet'}
        color="green"
      />
      
      <StatsCard
        icon={Trophy}
        label="Tournaments"
        value={stats?.tournaments_joined || 0}
        subtitle={`${stats?.tournaments_completed || 0} completed`}
        color="purple"
      />
      
      <StatsCard
        icon={Flame}
        label="Current Streak"
        value={getStreakDisplay()}
        subtitle={stats?.best_streak > 0 ? `Best: ${stats.best_streak}` : 'No streaks yet'}
        color="orange"
      />
    </div>
  );
};

export { StatsCard, PerformanceGrid };