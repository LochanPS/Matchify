# Day 22: Loading States & Error Handling

**Date:** December 20, 2024  
**Status:** 🚀 READY TO EXECUTE  
**Focus:** Add loading spinners, error boundaries, and retry mechanisms

---

## Overview

Day 22 focuses on improving user experience by adding comprehensive loading states and error handling throughout the application. This ensures users always know what's happening and can recover from failures gracefully.

---

## Tasks (8 hours total)

### 1. Remove Skill Level UI Elements (2 hours)

**Status:** ✅ Already Complete (Day 21)

**Verified:**
- ✅ Skill selection screen removed from onboarding
- ✅ Skill badges removed from player cards
- ✅ Skill filters removed from tournament list
- ✅ All profile displays updated

**No action needed** - Moving to next task.

---

### 2. Add New Stat Fields to UI (2 hours)

**Current Stats Displayed:**
- ✅ Matches played
- ✅ Win rate percentage
- ✅ Tournaments joined
- ✅ Current streak (🔥 for wins, 📉 for losses)

**To Add:**
- [ ] Recent form (W/L pattern for last 5 matches)
- [ ] Activity indicators (Highly Active/Active/Casual/Dormant)
- [ ] Experience badges (Newcomer/Regular/Veteran/Champion)
- [ ] Best streak ever
- [ ] Longest win streak

**Implementation:**

```javascript
// Experience Badge Component
const ExperienceBadge = ({ matches }) => {
  const getBadge = (count) => {
    if (count >= 50) return { label: 'Champion', icon: '👑', color: 'bg-purple-100 text-purple-800' };
    if (count >= 20) return { label: 'Veteran', icon: '🏆', color: 'bg-blue-100 text-blue-800' };
    if (count >= 5) return { label: 'Regular', icon: '🏸', color: 'bg-green-100 text-green-800' };
    return { label: 'Newcomer', icon: '🎾', color: 'bg-gray-100 text-gray-800' };
  };
  
  const badge = getBadge(matches);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
      <span className="mr-1">{badge.icon}</span>
      {badge.label}
    </span>
  );
};

// Activity Indicator Component
const ActivityIndicator = ({ matchesPerMonth }) => {
  const getActivity = (count) => {
    if (count >= 8) return { label: 'Highly Active', icon: '🔥', color: 'text-red-600' };
    if (count >= 4) return { label: 'Active', icon: '⚡', color: 'text-orange-600' };
    if (count >= 1) return { label: 'Casual', icon: '🌱', color: 'text-green-600' };
    return { label: 'Dormant', icon: '💤', color: 'text-gray-600' };
  };
  
  const activity = getActivity(matchesPerMonth);
  return (
    <div className={`flex items-center gap-2 ${activity.color}`}>
      <span>{activity.icon}</span>
      <span className="text-sm font-medium">{activity.label}</span>
    </div>
  );
};

// Recent Form Component
const RecentForm = ({ form }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Form</h3>
      <div className="flex space-x-2">
        {form.map((result, idx) => (
          <div
            key={idx}
            className={`flex-1 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
              result === 'W' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {result === 'W' ? '✓' : '✗'}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>Oldest</span>
        <span>Latest</span>
      </div>
    </div>
  );
};
```

---

### 3. Loading States (2 hours)

**Components to Add Loading States:**

#### 3.1 Tournament List Loading
```javascript
const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
    <div className="h-2 bg-gray-200 rounded w-full mb-3"></div>
    <div className="flex justify-between pt-3 border-t border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

// Usage in TournamentList
{loading && (
  <div>
    {[1, 2, 3, 4].map((i) => (
      <LoadingSkeleton key={i} />
    ))}
  </div>
)}
```

#### 3.2 Player Profile Loading
```javascript
const ProfileLoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
    </div>
    <div className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-white rounded-lg animate-pulse"></div>
      ))}
    </div>
  </div>
);
```

#### 3.3 Match Details Loading
```javascript
const MatchLoadingSkeleton = () => (
  <div className="bg-white rounded-lg p-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="space-y-3">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
  </div>
);
```

#### 3.4 Spinner Component
```javascript
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin`}></div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};
```

---

### 4. Error Handling (2 hours)

#### 4.1 Error Boundary Component
```javascript
import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Something went wrong</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 4.2 Toast Notification System
```javascript
import { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${colors[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-gray-900">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
};

export { useToast, ToastContainer };
```

#### 4.3 Retry Logic
```javascript
const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Usage in API calls
const fetchTournaments = async () => {
  try {
    const data = await withRetry(() => tournamentAPI.list());
    setTournaments(data);
  } catch (error) {
    addToast('Failed to load tournaments', 'error');
  }
};
```

#### 4.4 Error Message Component
```javascript
const ErrorMessage = ({ error, onRetry }) => (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-red-900">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-600 hover:text-red-700 mt-2 font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);
```

---

## Implementation Checklist

### Phase 1: Components (1 hour)
- [ ] Create `ExperienceBadge.jsx`
- [ ] Create `ActivityIndicator.jsx`
- [ ] Create `RecentForm.jsx`
- [ ] Create `LoadingSpinner.jsx`
- [ ] Create `ErrorBoundary.jsx`
- [ ] Create `useToast.js` hook
- [ ] Create `ToastContainer.jsx`
- [ ] Create `ErrorMessage.jsx`

### Phase 2: Integration (1.5 hours)
- [ ] Add loading states to TournamentList
- [ ] Add loading states to PlayerProfile
- [ ] Add loading states to TournamentDetails
- [ ] Add loading states to OrganizerDashboard
- [ ] Add loading states to CreateTournament
- [ ] Add loading states to TournamentManagement

### Phase 3: Error Handling (1.5 hours)
- [ ] Wrap App with ErrorBoundary
- [ ] Add error handling to all API calls
- [ ] Add retry logic to failed requests
- [ ] Add toast notifications for errors
- [ ] Add error messages to forms
- [ ] Test offline behavior

### Phase 4: Testing & Polish (1 hour)
- [ ] Test all loading states
- [ ] Test all error scenarios
- [ ] Test retry logic
- [ ] Test on mobile devices
- [ ] Verify accessibility
- [ ] Performance check

---

## Files to Create

```
frontend/src/components/
├── common/
│   ├── LoadingSpinner.jsx
│   ├── ErrorBoundary.jsx
│   ├── ErrorMessage.jsx
│   └── ToastContainer.jsx
├── player/
│   ├── ExperienceBadge.jsx
│   ├── ActivityIndicator.jsx
│   └── RecentForm.jsx
└── hooks/
    └── useToast.js
```

---

## Expected Results

### Before Day 22
- ❌ No loading indicators
- ❌ Confusing error states
- ❌ No retry mechanism
- ❌ Poor error messages

### After Day 22
- ✅ Loading spinners on all async operations
- ✅ Skeleton screens for better UX
- ✅ Clear error messages
- ✅ Retry buttons on failures
- ✅ Toast notifications
- ✅ Error boundary for crashes
- ✅ Offline handling
- ✅ Better user feedback

---

## Success Criteria

- ✅ All pages show loading states
- ✅ All errors have user-friendly messages
- ✅ Retry buttons work correctly
- ✅ Toast notifications appear
- ✅ Error boundary catches crashes
- ✅ Mobile responsive
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ 0 runtime errors

---

## Time Allocation

- Component creation: 1 hour
- Integration: 1.5 hours
- Error handling: 1.5 hours
- Testing & polish: 1 hour
- Buffer: 3 hours

**Total: 8 hours**

---

## Next Steps (Day 23)

- Mobile UX Polish
- Test on actual devices
- Optimize touch interactions
- Improve accessibility

---

**Status:** 🚀 Ready to execute  
**Date:** December 20, 2024  
**Duration:** 8 hours  
**Next:** Day 23 - Mobile UX Polish
