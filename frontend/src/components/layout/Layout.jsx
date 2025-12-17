import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Trophy, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role || 'player';

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary">Pathfinder</h1>
          <button
            onClick={handleLogout}
            className="touch-target tap-highlight-none"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="sticky bottom-0 z-50 w-full border-t bg-background md:hidden">
        <div className="container flex h-16 items-center justify-around px-4">
          {userRole === 'player' ? (
            <>
              <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center gap-1 touch-target tap-highlight-none ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs">Home</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`flex flex-col items-center gap-1 touch-target tap-highlight-none ${
                  isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/organizer/dashboard')}
                className={`flex flex-col items-center gap-1 touch-target tap-highlight-none ${
                  isActive('/organizer/dashboard') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs">Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className={`flex flex-col items-center gap-1 touch-target tap-highlight-none ${
                  isActive('/profile') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
