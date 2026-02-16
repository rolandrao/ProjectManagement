import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, User, Archive } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `
      p-3 rounded-xl transition-all duration-200 group relative
      ${isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    `;
  };

  return (
    <nav className="h-screen w-20 bg-slate-900 flex flex-col items-center py-6 flex-shrink-0 z-50">
      
      <div className="mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-900/20">P</div>
      </div>

      <div className="flex-1 flex flex-col gap-4 w-full px-3">
        <Link to="/" className={getLinkClass('/')}>
          <LayoutDashboard size={24} />
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Board</span>
        </Link>

        {/* New Archive Link */}
        <Link to="/archive" className={getLinkClass('/archive')}>
          <Archive size={24} />
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Archives</span>
        </Link>

        <Link to="/settings" className={getLinkClass('/settings')}>
          <Settings size={24} />
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Settings</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 w-full px-3 mt-auto">
        <button className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group relative">
          <User size={24} />
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Profile</span>
        </button>
        <button className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all group relative">
          <LogOut size={24} />
          <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">Logout</span>
        </button>
      </div>
    </nav>
  );
};