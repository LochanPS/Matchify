import React, { useState } from 'react';
import { Trophy, Share2, Star, Award, Target } from 'lucide-react';
import SocialShareModal from '../common/SocialShareModal';
import { generateShareContent } from '../../utils/socialSharing';

const AchievementShare = ({ achievement, autoShow = false }) => {
  const [shareModal, setShareModal] = useState(autoShow);
  
  const getAchievementIcon = (type) => {
    switch (type) {
      case 'tournament_win':
        return <Trophy className="w-6 h-6" />;
      case 'first_tournament':
        return <Star className="w-6 h-6" />;
      case 'streak_5':
        return <Target className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };
  
  const getAchievementColor = (type) => {
    switch (type) {
      case 'tournament_win':
        return 'from-yellow-400 to-orange-500';
      case 'first_tournament':
        return 'from-blue-400 to-purple-500';
      case 'streak_5':
        return 'from-green-400 to-teal-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };
  
  const getAchievementTitle = (type, data) => {
    switch (type) {
      case 'tournament_win':
        return '🏆 Tournament Winner!';
      case 'first_tournament':
        return '🌟 First Tournament Complete!';
      case 'streak_5':
        return '🔥 5-Win Streak!';
      case 'matches_10':
        return '💪 10 Matches Played!';
      case 'perfect_score':
        return '⭐ Perfect Match!';
      default:
        return '🏅 Achievement Unlocked!';
    }
  };
  
  const getAchievementDescription = (type, data) => {
    switch (type) {
      case 'tournament_win':
        return `Won ${data.tournament_name}`;
      case 'first_tournament':
        return 'Completed your first tournament on MATCHIFY!';
      case 'streak_5':
        return 'Won 5 matches in a row!';
      case 'matches_10':
        return 'Played 10 matches on the platform!';
      case 'perfect_score':
        return `Perfect 21-0 victory in ${data.tournament_name}!`;
      default:
        return 'Great job on your badminton journey!';
    }
  };
  
  const shareAchievement = () => {
    setShareModal(true);
  };
  
  const shareData = generateShareContent('achievement', {
    tournament_name: achievement.tournament_name || 'MATCHIFY Tournament',
    tournament_id: achievement.tournament_id,
    achievement_type: achievement.achievement_type,
    date: achievement.earned_at
  });
  
  return (
    <>
      <div className={`achievement-card bg-gradient-to-r ${getAchievementColor(achievement.achievement_type)} p-6 rounded-lg text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              {getAchievementIcon(achievement.achievement_type)}
            </div>
            
            <div>
              <h3 className="font-bold text-xl mb-1">
                {getAchievementTitle(achievement.achievement_type, achievement.achievement_data)}
              </h3>
              <p className="text-lg opacity-90 mb-2">
                {getAchievementDescription(achievement.achievement_type, achievement.achievement_data)}
              </p>
              <p className="text-sm opacity-75">
                {new Date(achievement.earned_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={shareAchievement}
            className="bg-white bg-opacity-20 p-3 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2"
            title="Share Achievement"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
        
        {/* Achievement Details */}
        {achievement.achievement_data && (
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {achievement.achievement_data.score && (
                <div>
                  <p className="text-2xl font-bold">{achievement.achievement_data.score}</p>
                  <p className="text-sm opacity-75">Final Score</p>
                </div>
              )}
              {achievement.achievement_data.duration && (
                <div>
                  <p className="text-2xl font-bold">{achievement.achievement_data.duration}m</p>
                  <p className="text-sm opacity-75">Duration</p>
                </div>
              )}
              {achievement.achievement_data.rank && (
                <div>
                  <p className="text-2xl font-bold">#{achievement.achievement_data.rank}</p>
                  <p className="text-sm opacity-75">Final Rank</p>
                </div>
              )}
              {achievement.achievement_data.participants && (
                <div>
                  <p className="text-2xl font-bold">{achievement.achievement_data.participants}</p>
                  <p className="text-sm opacity-75">Players</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Share Modal */}
      {shareModal && (
        <SocialShareModal
          isOpen={shareModal}
          onClose={() => setShareModal(false)}
          shareData={shareData}
          title="Share Achievement"
        />
      )}
    </>
  );
};

// Achievement notification component for real-time display
export const AchievementNotification = ({ achievement, onShare, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  
  const handleShare = () => {
    if (onShare) onShare(achievement);
    setVisible(false);
  };
  
  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    setVisible(false);
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg animate-slide-in-right">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-6 h-6" />
          <div>
            <h4 className="font-bold">Achievement Unlocked!</h4>
            <p className="text-sm opacity-90">
              {getAchievementTitle(achievement.achievement_type, achievement.achievement_data)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 bg-white bg-opacity-20 py-2 px-3 rounded text-sm font-medium hover:bg-opacity-30 transition-colors"
          >
            Share
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Achievement gallery component
export const AchievementGallery = ({ achievements, userId }) => {
  const [shareModal, setShareModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  const shareAchievement = (achievement) => {
    setSelectedAchievement(achievement);
    setShareModal(true);
  };
  
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Achievements Yet</h3>
        <p className="text-gray-500">Play tournaments to unlock achievements!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div key={achievement.achievement_id} className="relative">
            <AchievementShare achievement={achievement} />
          </div>
        ))}
      </div>
      
      {shareModal && selectedAchievement && (
        <SocialShareModal
          isOpen={shareModal}
          onClose={() => setShareModal(false)}
          shareData={generateShareContent('achievement', {
            tournament_name: selectedAchievement.tournament_name,
            tournament_id: selectedAchievement.tournament_id,
            achievement_type: selectedAchievement.achievement_type,
            date: selectedAchievement.earned_at
          })}
          title="Share Achievement"
        />
      )}
    </div>
  );
};

export default AchievementShare;