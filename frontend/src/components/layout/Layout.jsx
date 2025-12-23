import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with MATCHIFY Branding */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">
            MATCHIFY
          </h1>
          <div className="text-xs text-gray-500">
            Tournament Platform
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 text-center border-t border-gray-800">
        <p className="text-sm">
          © 2025 MATCHIFY. All rights reserved.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Making sports tournaments accessible to everyone
        </p>
      </footer>
    </div>
  );
};

export default Layout;
