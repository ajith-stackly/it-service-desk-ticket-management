import { useState, ReactNode } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F6F8] dark:bg-ink-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen((s) => !s)} />
        <main className="flex-1 p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
