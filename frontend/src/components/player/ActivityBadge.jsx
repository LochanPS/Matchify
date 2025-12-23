import { User, Zap, Trophy } from 'lucide-react';

const ActivityBadge = ({ matchesPlayed }) => {
  const getActivityLevel = () => {
    if (matchesPlayed === 0) {
      return {
        label: 'New Player',
        color: 'bg-blue-100 text-blue-700',
        icon: User,
      };
    }
    if (matchesPlayed < 10) {
      return {
        label: 'Getting Started',
        color: 'bg-green-100 text-green-700',
        icon: Zap,
      };
    }
    if (matchesPlayed < 50) {
      return {
        label: 'Active Player',
        color: 'bg-orange-100 text-orange-700',
        icon: Trophy,
      };
    }
    return {
      label: 'Experienced Player',
      color: 'bg-purple-100 text-purple-700',
      icon: Trophy,
    };
  };

  const activity = getActivityLevel();
  const Icon = activity.icon;

  return (
    <span className={`inline-flex px-3 py-1 ${activity.color} rounded-full text-sm font-medium items-center gap-1`}>
      <Icon className="w-4 h-4" />
      {activity.label}
    </span>
  );
};

export default ActivityBadge;
