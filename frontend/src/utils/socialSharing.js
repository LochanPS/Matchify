// Social sharing utilities for Day 47 - User Growth

// Track sharing analytics
const trackEvent = (eventName, properties) => {
  // Integration with analytics service
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
  
  // Log for development
  console.log('Analytics Event:', eventName, properties);
};

// Generate shareable content for different types
export const generateShareContent = (type, data) => {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://matchify.app';
  
  switch (type) {
    case 'tournament':
      return {
        title: `Join ${data.name} - Badminton Tournament`,
        description: `📅 ${new Date(data.date).toLocaleDateString()}\n📍 ${data.venue}\n💰 Entry: ₹${data.entry_fee}\n🏆 Prize: ₹${data.prize_money}`,
        url: `${baseUrl}/tournaments/${data.tournament_id}`,
        hashtags: ['Badminton', 'Tournament', data.city?.replace(/\s+/g, '')],
        type: 'tournament',
        id: data.tournament_id
      };
      
    case 'achievement':
      return {
        title: `🏆 Just won ${data.tournament_name}!`,
        description: `Proud to win the ${data.tournament_name} tournament! 🏸\n\nFind your next tournament on MATCHIFY.`,
        url: `${baseUrl}/tournaments/${data.tournament_id}`,
        hashtags: ['BadmintonWin', 'Tournament', 'MATCHIFY'],
        type: 'achievement',
        id: data.tournament_id
      };
      
    case 'referral':
      return {
        title: `Join me on MATCHIFY - India's best badminton platform!`,
        description: `I've been using MATCHIFY to find tournaments and track my progress. Use my code ${data.referral_code} to get a free tournament entry! 🏸`,
        url: `${baseUrl}/signup?ref=${data.referral_code}`,
        hashtags: ['Badminton', 'MATCHIFY', 'JoinMe'],
        type: 'referral',
        id: data.referral_code
      };
      
    case 'profile':
      return {
        title: `Check out my badminton journey on MATCHIFY!`,
        description: `📊 ${data.matches_played} matches played\n🏆 ${data.wins} wins\n📈 ${data.win_rate}% win rate\n\nJoin the community!`,
        url: `${baseUrl}/players/${data.user_id}`,
        hashtags: ['BadmintonJourney', 'MATCHIFY', 'Stats'],
        type: 'profile',
        id: data.user_id
      };
      
    case 'leaderboard':
      return {
        title: `I'm ranked #${data.rank} in ${data.city} on MATCHIFY! 🏸`,
        description: `Check out the badminton leaderboard in ${data.city}. Can you beat my ranking?`,
        url: `${baseUrl}/leaderboard/${data.city}`,
        hashtags: ['BadmintonRanking', data.city?.replace(/\s+/g, ''), 'MATCHIFY'],
        type: 'leaderboard',
        id: data.city
      };
      
    default:
      return {
        title: 'MATCHIFY - Find Your Perfect Badminton Tournament',
        description: 'Join thousands of players discovering tournaments, tracking progress, and building community.',
        url: baseUrl,
        hashtags: ['Badminton', 'MATCHIFY'],
        type: 'general',
        id: 'home'
      };
  }
};

// Generate platform-specific share URLs
export const generateShareUrls = (shareData) => {
  const { title, description, url, hashtags = [] } = shareData;
  
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${description}\n\n${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };
};

// Handle platform-specific sharing
export const handleShare = async (platform, shareData, onSuccess, onError) => {
  try {
    const shareUrls = generateShareUrls(shareData);
    
    if (platform === 'native' && navigator.share) {
      // Use native Web Share API if available
      await navigator.share({
        title: shareData.title,
        text: shareData.description,
        url: shareData.url
      });
    } else if (platform === 'copy') {
      // Copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      if (onSuccess) onSuccess('Link copied to clipboard!');
    } else if (shareUrls[platform]) {
      // Open platform-specific share URL
      const popup = window.open(
        shareUrls[platform], 
        'share', 
        'width=600,height=400,scrollbars=yes,resizable=yes'
      );
      
      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('Popup blocked. Please allow popups for sharing.');
      }
      
      if (onSuccess) onSuccess('Share window opened!');
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Track sharing analytics
    trackEvent('social_share', {
      platform,
      content_type: shareData.type,
      content_id: shareData.id
    });
    
    // Send share event to backend for tracking
    await trackShareEvent(shareData, platform);
    
  } catch (error) {
    console.error('Share error:', error);
    if (onError) onError(error.message);
  }
};

// Track share event in backend
const trackShareEvent = async (shareData, platform) => {
  try {
    const response = await fetch('/api/social/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        content_type: shareData.type,
        content_id: shareData.id,
        platform: platform,
        share_url: shareData.url
      })
    });
    
    if (!response.ok) {
      console.warn('Failed to track share event');
    }
  } catch (error) {
    console.warn('Error tracking share event:', error);
  }
};

// Get available share platforms based on device/browser capabilities
export const getAvailablePlatforms = () => {
  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088CC' },
    { id: 'copy', name: 'Copy Link', icon: '📋', color: '#6B7280' }
  ];
  
  // Add native share if available (mobile devices)
  if (navigator.share) {
    platforms.unshift({
      id: 'native',
      name: 'Share',
      icon: '📤',
      color: '#3B82F6'
    });
  }
  
  return platforms;
};

// Generate invitation message for tournaments
export const generateInvitationMessage = (tournament, inviterName, customMessage) => {
  const defaultMessage = `Hey! I'm playing in ${tournament.name} on ${new Date(tournament.date).toLocaleDateString()}. Want to join? It's going to be fun! 🏸`;
  
  const message = customMessage || defaultMessage;
  
  return {
    subject: `Join me in ${tournament.name} - Badminton Tournament`,
    body: `${message}\n\n` +
          `📅 Date: ${new Date(tournament.date).toLocaleDateString()}\n` +
          `📍 Venue: ${tournament.venue}\n` +
          `💰 Entry Fee: ₹${tournament.entry_fee}\n` +
          `🏆 Prize Money: ₹${tournament.prize_money}\n\n` +
          `Register here: ${import.meta.env.VITE_APP_URL}/tournaments/${tournament.tournament_id}\n\n` +
          `- ${inviterName}`,
    url: `${import.meta.env.VITE_APP_URL}/tournaments/${tournament.tournament_id}?invited_by=${inviterName}`
  };
};

// Share achievement automatically after tournament completion
export const shareAchievement = async (achievement, autoShare = false) => {
  const shareData = generateShareContent('achievement', achievement);
  
  if (autoShare) {
    // Auto-share to user's preferred platform (if configured)
    const preferredPlatform = localStorage.getItem('preferredSharePlatform');
    if (preferredPlatform && preferredPlatform !== 'none') {
      await handleShare(preferredPlatform, shareData);
    }
  }
  
  return shareData;
};

// Viral sharing prompts based on context
export const getViralPrompt = (context, data) => {
  const prompts = {
    tournament_registration: {
      control: "Share this tournament with friends!",
      social_proof: "Join 1,000+ players who shared tournaments this week!",
      urgency: `Only ${data.spots_remaining} spots left! Share before it fills up!`,
      personal: "Invite your badminton buddies to play together!"
    },
    tournament_completion: {
      control: "Share your achievement!",
      celebration: "🎉 Celebrate your victory with friends!",
      challenge: "Challenge your friends to beat your performance!",
      community: "Inspire others in the badminton community!"
    },
    profile_milestone: {
      control: "Share your progress!",
      achievement: `🏆 You've reached ${data.milestone}! Share your journey!`,
      motivation: "Motivate others with your badminton journey!",
      pride: "Show off your badminton skills!"
    }
  };
  
  // A/B testing - randomly select prompt variant
  const variants = Object.keys(prompts[context] || {});
  const selectedVariant = variants[Math.floor(Math.random() * variants.length)];
  
  return prompts[context]?.[selectedVariant] || prompts[context]?.control || "Share with friends!";
};

// Calculate and track viral coefficient
export const calculateViralCoefficient = (timeframe = '30d') => {
  // This would typically be calculated on the backend
  // Frontend can display the calculated value
  return {
    coefficient: 0.3, // Example value
    invitationsSent: 150,
    activeUsers: 500,
    conversionRate: 0.25
  };
};

export default {
  generateShareContent,
  generateShareUrls,
  handleShare,
  getAvailablePlatforms,
  generateInvitationMessage,
  shareAchievement,
  getViralPrompt,
  calculateViralCoefficient,
  trackEvent
};