import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Archive } from 'lucide-react'; // Removed User icon

export const Navbar = () => {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label, onClick }) => {
    const isActive = location.pathname === to;
    
    // Base classes
    const baseClasses = "relative flex items-center justify-center transition-all duration-300 group";
    
    // Mobile: Touch targets
    const mobileClasses = `
      p-3 rounded-full
      ${isActive ? 'text-white bg-white/20 shadow-lg shadow-white/5' : 'text-slate-400'}
    `;

    // Desktop: Hover effects
    const desktopClasses = `
      p-3 rounded-xl w-full
      ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    `;

    const content = (
      <>
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        {/* Desktop Tooltip */}
        <span className="hidden md:block absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700">
          {label}
        </span>
      </>
    );

    if (onClick) {
      return (
        <button onClick={onClick} className={`${baseClasses} md:${desktopClasses} ${mobileClasses} md:rounded-xl md:p-3`}>
          {content}
        </button>
      );
    }

    return (
      <Link to={to} className={`${baseClasses} md:w-auto ${mobileClasses} md:${desktopClasses}`}>
        {content}
      </Link>
    );
  };

  return (
    <>
      <nav className={`
        z-50
        
        /* Mobile Styles */
        fixed bottom-6 left-6 right-6 h-16
        bg-slate-900/85 backdrop-blur-xl
        border border-white/10
        rounded-2xl shadow-2xl
        flex flex-row items-center justify-around px-2 /* Changed justify-between to justify-around for better spacing */
        
        /* Desktop Styles */
        md:relative md:bottom-auto md:left-auto md:right-auto md:h-screen md:w-20
        md:flex-col md:justify-start md:py-6 md:px-2
        md:bg-slate-900 md:rounded-none md:border-none md:shadow-none
      `}>

        {/* Brand Logo (Desktop Only) */}
        <div className="hidden md:flex mb-8 w-10 h-10 bg-blue-600 rounded-xl items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-900/20">
          P
        </div>

        {/* Navigation Links Group */}
        <div className="flex flex-row md:flex-col justify-around w-full md:w-auto md:gap-4 md:flex-1">
          <NavItem to="/" icon={LayoutDashboard} label="Board" />
          <NavItem to="/archive" icon={Archive} label="Archive" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
          {/* Removed the Profile/User NavItem here */}
        </div>

        {/* Desktop Footer Actions */}
        <div className="hidden md:flex flex-col gap-4 w-full mt-auto">
          {/* We can keep Logout here for desktop as it makes sense even without a profile page */}
          <button className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all group relative flex justify-center">
            <LogOut size={22} />
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700">
              Logout
            </span>
          </button>
        </div>

      </nav>
    </>
  );
};