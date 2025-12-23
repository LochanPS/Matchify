import { Trophy, Zap, Target, Flame, Star, Award } from 'lucide-react';

const AchievementBadge = ({ icon: Icon, title, description, unlocked = false, progress }) => {
  return (
    <div className={`p-3 rounded-lg border-2 transition-all ${
      unlocked 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          unlocked 
            ? 'bg-yellow-100 text-yellow-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            unlocked ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {title}
          </p>
          <p className="text-xs text-gray-600">{description}</p>
          {progress && !unlocked && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
            </div>
          )}
        </div>
        {unlocked && (
          <div className="text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>
    </div>
  );
};

const AchievementBadges = ({ stats }) => {
  const achievements = [
    {
      id: 'first_match',
      icon: Zap,
      title: 'First Match',
      description: 'Play your first match',
      unlocked: (stats?.matches_played || 0) >= 1,
      progress: Math.min(((stats?.matches_played || 0) / 1) * 100, 100)
    },
    {
      id: 'first_win',
      icon: Trophy,
      title: 'First Victory',
      description: 'Win your first match',
      unlocked: (stats?.wins || 0) >= 1,
      progress: Math.min(((stats?.wins || 0) / 1) * 100, 100)
    },
    {
      id: 'tournament_player',
      icon: Target,
      title: 'Tournament Player',
      description: 'Complete 5 tournaments',
      unlocked: (stats?.tournaments_completed || 0) >= 5,
      progress: Math.min(((stats?.tournaments_completed || 0) / 5) * 100, 100)
    },
    {
      id: 'hot_streak',
      icon: Flame,
      title: 'Hot Streak',
      description: 'Win 5 matches in a row',
      unlocked: (stats?.best_streak || 0) >= 5,
      progress: Math.min(((stats?.best_streak || 0) / 5) * 100, 100)
    },
    {
      id: 'veteran',
      icon: Award,
      title: 'Veteran Player',
      description: 'Play 50 matches',
      unlocked: (stats?.matches_played || 0) >= 50,
      progress: Math.min(((stats?.matches_played || 0) / 50) * 100, 100)
    },
    {
      id: 'champion',
      icon: Star,
      title: 'Champion',
      description: 'Win a tournament',
      unlocked: (stats?.tournaments_won || 0) >= 1,
      progress: Math.min(((stats?.tournaments_won || 0) / 1) * 100, 100)
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Achievements</h3>
        <span className="text-sm text-gray-600">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            icon={achievement.icon}
            title={achievement.title}
            description={achievement.description}
            unlocked={achievement.unlocked}
            progress={achievement.progress}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges;