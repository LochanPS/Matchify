/**
 * MATCHIFY Branding Configuration
 * Centralized branding constants for the application
 */

module.exports = {
  // Application Identity
  appName: 'MATCHIFY',
  appVersion: '1.0.0',
  appTagline: 'Your Sports Tournament Platform',
  
  // URLs
  appUrl: process.env.APP_URL || 'https://matchify.app',
  apiUrl: process.env.API_URL || 'https://api.matchify.app',
  
  // Contact Information
  supportEmail: process.env.SUPPORT_EMAIL || 'support@matchify.app',
  contactEmail: process.env.CONTACT_EMAIL || 'hello@matchify.app',
  
  // Branding Assets
  logo: {
    url: 'https://matchify.app/logo.png',
    alt: 'MATCHIFY Logo'
  },
  
  // Social Media
  social: {
    twitter: '@matchifyapp',
    instagram: '@matchifyapp',
    facebook: 'matchifyapp'
  },
  
  // Legal
  copyright: '© 2025 MATCHIFY. All rights reserved.',
  companyName: 'MATCHIFY',
  
  // Email Configuration
  email: {
    from: process.env.SMTP_FROM || 'noreply@matchify.app',
    fromName: 'MATCHIFY Team',
    replyTo: 'support@matchify.app'
  },
  
  // Marketing Copy
  taglines: [
    'Find Your Match, Play Your Game',
    'Where Players Meet Tournaments',
    'Your Sports Journey Starts Here',
    'Tournament Management Made Simple',
    'Play More. Worry Less.'
  ],
  
  // Feature Descriptions
  features: {
    discovery: 'Discover tournaments near you',
    registration: 'Instant registration with secure payments',
    tracking: 'Track your match history and stats',
    management: 'Organizer dashboard for tournament management',
    mobile: 'Optimized for mobile devices'
  }
};
