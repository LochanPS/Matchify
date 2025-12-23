import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, User, Settings, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const getNavItems = () => {
    if (user.role === 'player') {
      return [
        {
          id: 'home',
          label: 'Home',
          icon: Home,
          path: '/',
          activePattern: /^\/$/
        },
        {
          id: 'search',
          label: 'Search',
          icon: Search,
          path: '/search',
          activePattern: /^\/search/
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/profile',
          activePattern: /^\/profile/
        }
      ];
    } else {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Trophy,
          path: '/organizer/dashboard',
          activePattern: /^\/organizer\/dashboard/
        },
        {
          id: 'create',
          label: 'Create',
          icon: Settings,
          path: '/organizer/tournaments/create',
          activePattern: /^\/organizer\/tournaments\/create/
        },
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/profile',
          activePattern: /^\/profile/
        }
      ];
    }
  };

  const navItems = getNavItems();

  const isActive = (item) => {
    return item.activePattern.test(location.pathname);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px] ${
                active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;