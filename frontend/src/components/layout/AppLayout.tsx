import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { CommandPalette } from './CommandPalette';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Header
          onOpenCommand={() => setIsCommandOpen(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />

        {/* Ctrl + K Command Palette */}
        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
        />
      </div>
    </div>
  );
};
