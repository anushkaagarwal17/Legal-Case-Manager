import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  Sun, 
  Moon, 
  User, 
  UserCheck 
} from 'lucide-react';

export default function Sidebar({ darkMode, setDarkMode }) {
  const location = useLocation();

  // 1. Read userRole directly from localStorage (defaults to 'lawyer')
  const userRole = localStorage.getItem('userRole') || 'lawyer';

  // 2. Define navigation links dynamically based on userRole
  const lawyerLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cases Registry', path: '/cases', icon: Briefcase },
    { name: 'Hearings', path: '/hearings', icon: Calendar },
  ];

  const clientLinks = [
    { name: 'My Cases', path: '/client-cases', icon: Briefcase },
    { name: 'Upcoming Hearings', path: '/client-hearings', icon: Calendar },
  ];

  const links = userRole === 'lawyer' ? lawyerLinks : clientLinks;

  // Helper function to quickly switch roles (great for testing!)
  const switchRole = (newRole) => {
    localStorage.setItem('userRole', newRole);
    window.location.reload(); // Reload to refresh sidebar & views
  };

  return (
    <div className={`w-64 h-screen flex flex-col p-5 border-r transition-colors duration-200 ${
      darkMode ? 'bg-zinc-950 text-zinc-100 border-zinc-800' : 'bg-zinc-50 text-zinc-900 border-zinc-200'
    }`}>
      {/* Header & Role Badge */}
      <div className="mb-8 px-2">
        <div className="text-md font-bold tracking-wide uppercase text-zinc-500">
          Legal Case Tracker
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
          <span className={`px-2 py-0.5 rounded-full ${
            userRole === 'lawyer' 
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' 
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
          }`}>
            {userRole === 'lawyer' ? 'Lawyer Portal' : 'Client Portal'}
          </span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? (darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-white shadow-sm') 
                  : (darkMode ? 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200' : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900')
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action Section */}
      <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {/* Role Switcher Button (Useful for testing local storage!) */}
        <button
          onClick={() => switchRole(userRole === 'lawyer' ? 'client' : 'lawyer')}
          className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium border transition-all ${
            darkMode 
              ? 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' 
              : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          {userRole === 'lawyer' ? (
            <><User size={13} /> Switch to Client View</>
          ) : (
            <><UserCheck size={13} /> Switch to Lawyer View</>
          )}
        </button>

        {/* Theme Toggle Utility Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-medium border transition-all ${
            darkMode 
              ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850' 
              : 'border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-100'
          }`}
        >
          {darkMode ? (
            <>
              <Sun size={14} className="text-amber-400" /> Light Mode
            </>
          ) : (
            <>
              <Moon size={14} className="text-zinc-500" /> Dark Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
}
