# MATCHIFY Mobile App

React Native mobile application for MATCHIFY - Tournament Management Platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Physical device (optional, for testing)

### Installation

1. **Install dependencies:**
```bash
cd matchify-mobile
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Configure environment variables:**
```
EXPO_PUBLIC_API_URL=https://api.matchify.app
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Running the App

**Start development server:**
```bash
npm start
```

**Run on iOS:**
```bash
npm run ios
```

**Run on Android:**
```bash
npm run android
```

**Run on Web:**
```bash
npm run web
```

## 📁 Project Structure

```
matchify-mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── player/
│   │   │   ├── TournamentListScreen.tsx
│   │   │   ├── TournamentDetailScreen.tsx
│   │   │   ├── PlayerProfileScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── organizer/
│   │       └── OrganizerDashboardScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── AppNavigator.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── firebase.ts
│   │   └── notifications.ts
│   ├── styles/
│   │   └── theme.ts
│   └── App.tsx
├── app.json
├── package.json
└── tsconfig.json
```

## 🎯 Features

### Authentication
- Email/password login
- User signup
- Role selection (Player/Organizer)
- City selection
- Secure token storage

### Player Features
- Browse tournaments
- Search and filter tournaments
- View tournament details
- Join tournaments
- View player profile
- Track match history
- View statistics

### Organizer Features
- Dashboard with tournaments
- Create tournaments
- Manage participants
- Generate matches
- Enter scores
- View reports

### Notifications
- Push notifications
- Local notifications
- Notification preferences
- Real-time updates

## 🔧 Technologies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Firebase** - Authentication & Cloud Messaging
- **React Navigation** - Navigation
- **Axios** - HTTP client
- **Zustand** - State management (optional)

## 📱 Supported Platforms

- iOS 13+
- Android 8+
- Web (experimental)

## 🔐 Security

- Secure token storage
- Firebase authentication
- HTTPS only
- Input validation
- Error handling

## 📊 API Integration

The app connects to the MATCHIFY backend API at `https://api.matchify.app`

### Key Endpoints
- `POST /auth/login` - User login
- `POST /auth/signup` - User signup
- `GET /tournaments` - Get tournaments
- `GET /tournaments/:id` - Get tournament details
- `POST /tournaments/:id/join` - Join tournament
- `GET /users/:id/profile` - Get user profile
- `GET /api/notifications` - Get notifications

## 🚀 Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components
- Use hooks for state management

### Component Structure
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../styles/theme';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  text: {
    fontSize: 16,
    color: colors.text
  }
});

export default MyComponent;
```

## 🐛 Troubleshooting

### Build Issues
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start --clear`

### Connection Issues
- Verify API URL in `.env`
- Check network connectivity
- Verify Firebase configuration

### Notification Issues
- Ensure permissions are granted
- Check Firebase Cloud Messaging setup
- Verify device token registration

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Contact support team

## 📄 License

MATCHIFY Mobile App - All rights reserved

## 🎯 Next Steps

- [ ] Complete remaining screens
- [ ] Implement offline support
- [ ] Add unit tests
- [ ] Performance optimization
- [ ] Beta testing
- [ ] App Store submission
- [ ] Google Play submission

---

**Status:** Development  
**Version:** 1.0.0  
**Last Updated:** December 24, 2025
