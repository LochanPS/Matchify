import { BrowserRouter as Router, Routes, Route, Navigate, Suspense, lazy, useEffect } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import FeedbackButton from './components/common/FeedbackButton';

// Day 42 utilities
import { initializeBugFixes } from './utils/bugFixes';
import { initializeAccessibility } from './utils/accessibility';
import { initializeMobileOptimizations } from './utils/mobileOptimizations';
import { initializeSecurity } from './utils/security';
import { performanceMonitor } from './utils/performance';

// Lazy load auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const PlayerOnboarding = lazy(() => import('./pages/auth/PlayerOnboarding'));

// Lazy load player pages
const TournamentList = lazy(() => import('./pages/player/TournamentList'));
const TournamentDetails = lazy(() => import('./pages/player/TournamentDetails'));
const TournamentSearch = lazy(() => import('./pages/player/TournamentSearch'));
const PlayerProfile = lazy(() => import('./pages/player/PlayerProfile'));
const Settings = lazy(() => import('./pages/player/Settings'));

// Lazy load organizer pages
const OrganizerDashboard = lazy(() => import('./pages/organizer/OrganizerDashboard'));
const CreateTournament = lazy(() => import('./pages/organizer/CreateTournament'));
const TournamentManagement = lazy(() => import('./pages/organizer/TournamentManagement'));
const MonitoringDashboard = lazy(() => import('./pages/organizer/MonitoringDashboard'));
const AdvancedAnalytics = lazy(() => import('./pages/organizer/AdvancedAnalytics'));

// Lazy load community pages
const CommunityHub = lazy(() => import('./pages/community/CommunityHub'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Onboarding Check Component
const OnboardingCheck = ({ children }) => {
  const { user } = useAuth();

  // If user is not a player or already onboarded, show content
  if (user?.role !== 'player' || user?.onboarded) {
    return children;
  }

  // If player and not onboarded, redirect to onboarding
  return <Navigate to="/onboarding" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes - redirect to home if already logged in */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" replace /> : <Signup />} 
        />

        {/* Onboarding route - only for players */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <PlayerOnboarding />
            </ProtectedRoute>
          } 
        />

        {/* Protected routes with layout */}
        <Route 
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Layout />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        >
          {/* Player routes */}
          <Route path="/" element={<TournamentList />} />
          <Route path="/search" element={<TournamentSearch />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/profile" element={<PlayerProfile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Community routes */}
          <Route path="/community" element={<CommunityHub />} />
          <Route path="/help" element={<HelpCenter />} />

          {/* Organizer routes */}
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/monitoring" element={<MonitoringDashboard />} />
          <Route path="/organizer/analytics" element={<AdvancedAnalytics />} />
          <Route path="/organizer/tournaments/create" element={<CreateTournament />} />
          <Route path="/organizer/tournaments/:id/manage" element={<TournamentManagement />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    // Initialize all Day 42 improvements
    console.log('Initializing Day 42 improvements...');
    
    try {
      initializeBugFixes();
      initializeAccessibility();
      initializeMobileOptimizations();
      initializeSecurity();
      
      // Start performance monitoring
      performanceMonitor.observeWebVitals();
      
      console.log('Day 42 improvements initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Day 42 improvements:', error);
    }
    
    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
        if (memoryUsage > 50) { // Alert if over 50MB
          console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="full-height">
            <AppRoutes />
            <FeedbackButton />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
