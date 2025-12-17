import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import PlayerOnboarding from './pages/auth/PlayerOnboarding';

// Player pages
import TournamentList from './pages/player/TournamentList';
import TournamentDetails from './pages/player/TournamentDetails';
import PlayerProfile from './pages/player/PlayerProfile';

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateTournament from './pages/organizer/CreateTournament';
import TournamentManagement from './pages/organizer/TournamentManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<PlayerOnboarding />} />

        {/* Protected routes with layout */}
        <Route element={<Layout />}>
          {/* Player routes */}
          <Route path="/" element={<TournamentList />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/profile" element={<PlayerProfile />} />

          {/* Organizer routes */}
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/tournaments/create" element={<CreateTournament />} />
          <Route path="/organizer/tournaments/:id/manage" element={<TournamentManagement />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
