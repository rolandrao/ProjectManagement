import React from 'react';
import { LayoutDashboard, CheckSquare, Settings, Users } from 'lucide-react';

const SidebarItem = ({ icon: Icon, active }) => (
  <div className={`
    p-3 rounded-full transition-all cursor-pointer mb-4
    ${active 
      ? 'bg-accent-navy text-white shadow-lg scale-110' 
      : 'text-gray-500 hover:bg-white/50 hover:text-accent-navy'}
  `}>
    <Icon size={24} strokeWidth={2} />
  </div>
);

export const GlassLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F2F2F7] p-6 flex gap-6 font-sans text-slate-800 overflow-hidden">
      
      {/* Floating Sidebar */}
      <nav className="
        w-20 h-[calc(100vh-3rem)] 
        rounded-3xl 
        bg-glass-200 backdrop-blur-xl border border-glass-border shadow-glass
        flex flex-col items-center py-8 z-50
      ">
        {/* Logo */}
        <div className="w-10 h-10 bg-orange-400 rounded-full mb-10 shadow-md"></div>

        {/* Nav Items */}
        <div className="flex flex-col gap-2 w-full items-center mt-6">
            <SidebarItem icon={LayoutDashboard} active />
            <SidebarItem icon={CheckSquare} />
            <SidebarItem icon={Users} />
        </div>
        
        <div className="mt-auto">
          <SidebarItem icon={Settings} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-3rem)] rounded-3xl overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};