# MATCHIFY Mobile App - Quick Start Guide

## 📱 Project Overview

The MATCHIFY mobile app is a React Native application built with Expo, providing a seamless experience for both players and tournament organizers.

**Status:** 60% Complete (Days 59-60)  
**Platform:** iOS & Android (via Expo)  
**Language:** TypeScript  
**State Management:** Zustand + Context API  

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd matchify-mobile
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your backend URL:
```
REACT_APP_API_URL=http://your-backend-url:5000
REACT_APP_FIREBASE_CONFIG=your-firebase-config
```

### Running the App

**Development:**
```bash
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web (Expo Web)

**Production Build:**
```bash
eas build --platform ios
eas build --platform android
```

---

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
│   │       ├── OrganizerDashboardScreen.tsx
│   │       ├── CreateTournamentScreen.tsx
│   │       └── ManageTournamentScreen.tsx
│   ├── components/
│   │   ├── TournamentCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── AppNavigator.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── firebase.ts
│   │   └── notifications.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── styles/
│   │   └── theme.ts
│   └── App.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Authentication Flow

```
Splash Screen
    ↓
Check Auth Token
    ↓
├─ Token Valid → App Navigator (Tabs)
└─ No Token → Auth Navigator
    ├─ Login Screen
    ├─ Signup Screen
    └─ Onboarding Screen
```

### Auth Context

Located in `src/contexts/AuthContext.tsx`:

```typescript
const { user, isLoading, login, signup, logout } = useAuth();
```

---

## 🧭 Navigation Structure

### Root Navigator
- Conditional rendering based on auth state
- Handles splash screen

### Auth Navigator
- LoginScreen
- SignupScreen
- OnboardingScreen

### App Navigator (Bottom Tabs)
1. **Tournaments Tab**
   - TournamentListScreen
   - TournamentDetailScreen

2. **Profile Tab**
   - PlayerProfileScreen
   - SettingsScreen

3. **Organizer Tab**
   - OrganizerDashboardScreen
   - CreateTournamentScreen
   - ManageTournamentScreen

---

## 🎨 Theme System

Located in `src/styles/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#004E89',
    success: '#06A77D',
    error: '#D62828',
    warning: '#F77F00',
    // ... more colors
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  // ... more theme properties
};
```

### Using Theme

```typescript
import { theme } from '../styles/theme';

<View style={theme.container}>
  <Text style={theme.heading}>Title</Text>
  <TouchableOpacity style={theme.button}>
    <Text style={theme.buttonText}>Button</Text>
  </TouchableOpacity>
</View>
```

---

## 🔌 API Integration

Located in `src/services/api.ts`:

```typescript
import { api } from '../services/api';

// GET request
const tournaments = await api.get('/tournaments');

// POST request
const result = await api.post('/tournaments', data);

// PUT request
const updated = await api.put(`/tournaments/${id}`, data);

// DELETE request
await api.delete(`/tournaments/${id}`);
```

### Error Handling

```typescript
try {
  const data = await api.get('/tournaments');
} catch (error: any) {
  const message = error.response?.data?.message || 'Error occurred';
  Alert.alert('Error', message);
}
```

---

## 🔔 Notifications

Located in `src/services/notifications.ts`:

```typescript
import { initializeNotifications } from '../services/notifications';

// Initialize on app start
useEffect(() => {
  initializeNotifications();
}, []);
```

### Sending Notifications

```typescript
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Tournament Update',
    body: 'Your tournament starts in 1 hour',
  },
  trigger: { seconds: 60 },
});
```

---

## 📝 Creating New Screens

### 1. Create Screen File

```typescript
// src/screens/player/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../styles/theme';

export const NewScreen: React.FC = () => {
  return (
    <View style={theme.container}>
      <Text style={theme.heading}>New Screen</Text>
    </View>
  );
};
```

### 2. Add to Navigation

```typescript
// src/navigation/AppNavigator.tsx
import { NewScreen } from '../screens/player/NewScreen';

<Stack.Screen
  name="NewScreen"
  component={NewScreen}
  options={{ title: 'New Screen' }}
/>
```

### 3. Navigate to Screen

```typescript
navigation.navigate('NewScreen' as never);
```

---

## 🧩 Creating Reusable Components

### Example: Custom Button

```typescript
// src/components/CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { theme } from '../styles/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
}) => (
  <TouchableOpacity
    style={[
      theme.button,
      variant === 'secondary' && { backgroundColor: theme.colors.secondary },
    ]}
    onPress={onPress}
  >
    <Text style={theme.buttonText}>{title}</Text>
  </TouchableOpacity>
);
```

---

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Example Test

```typescript
import { render, screen } from '@testing-library/react-native';
import { TournamentCard } from '../components/TournamentCard';

test('renders tournament card', () => {
  render(
    <TournamentCard
      id="1"
      name="Test Tournament"
      city="Bangalore"
      format="knockout"
      startDate="2025-12-25"
      entryFee={500}
      participants={10}
      maxParticipants={16}
      onPress={() => {}}
    />
  );
  
  expect(screen.getByText('Test Tournament')).toBeTruthy();
});
```

---

## 🐛 Debugging

### Enable Debug Menu

Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS)

### Console Logging

```typescript
console.log('Debug message:', data);
console.warn('Warning message');
console.error('Error message');
```

### React DevTools

```bash
npm install -g react-devtools
react-devtools
```

---

## 📦 Dependencies

### Core
- `react-native`: 0.73.0
- `react`: 18.2.0
- `expo`: 50.0.0
- `typescript`: 5.3.0

### Navigation
- `@react-navigation/native`: 6.1.0
- `@react-navigation/bottom-tabs`: 6.5.0
- `@react-navigation/stack`: 6.3.0

### Firebase & Auth
- `firebase`: 10.7.0
- `expo-notifications`: 0.27.0

### HTTP & State
- `axios`: 1.6.0
- `zustand`: 4.4.0

### Storage
- `@react-native-async-storage/async-storage`: Latest

### UI
- `react-native-vector-icons`: Latest
- `react-native-svg`: Latest

---

## 🚀 Performance Tips

1. **Use FlatList for Long Lists**
   ```typescript
   <FlatList
     data={items}
     renderItem={({ item }) => <Item item={item} />}
     keyExtractor={(item) => item.id}
   />
   ```

2. **Memoize Components**
   ```typescript
   export const MemoizedComponent = React.memo(Component);
   ```

3. **Lazy Load Images**
   ```typescript
   <Image
     source={{ uri: imageUrl }}
     style={{ width: 200, height: 200 }}
   />
   ```

4. **Optimize Re-renders**
   ```typescript
   const memoizedValue = useMemo(() => computeValue(), [dependency]);
   ```

---

## 📚 Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📞 Support

For issues or questions:
- Check the documentation
- Review existing issues
- Create a new issue with details

---

**Made with ❤️ by the MATCHIFY Team**

*Making sports tournaments accessible to everyone*
