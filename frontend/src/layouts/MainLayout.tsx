import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, Menu } from 'lucide-react';
import { useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useUser();

  const menuItems = [
    { path: '/dashboard', label: 'Tổng quan', icon: <Home size={20} /> },
    { path: '/ho-so', label: 'Hồ sơ dân quân', icon: <Users size={20} /> },
    { path: '/cai-dat', label: 'Cài đặt', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-green-800 text-white hidden md:flex flex-col">
        <div className="p-4 flex items-center justify-center border-b border-green-700 h-16">
          <h1 className="font-bold text-xl uppercase tracking-wider text-center">BCH Quân Sự<br/><span className="text-sm font-normal">Quản Lý Dân Quân</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-green-700 font-medium' : 'hover:bg-green-700/50'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - Mobile Sidebar Toggle */}
        <header className="h-16 bg-white border-b flex items-center px-4 justify-between md:justify-end">
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <span className="font-medium text-gray-700 hidden sm:block">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
            <UserButton afterSignOutUrl="/login" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <aside className="w-64 bg-green-800 text-white flex flex-col z-10 relative">
             <div className="p-4 border-b border-green-700 h-16 flex items-center justify-center">
               <h1 className="font-bold text-lg">Quản Lý Dân Quân</h1>
             </div>
             <nav className="flex-1 p-4 space-y-2">
               {menuItems.map((item) => (
                 <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center space-x-3 p-3 rounded-lg ${location.pathname.includes(item.path) ? 'bg-green-700' : ''}`}>
                   {item.icon}
                   <span>{item.label}</span>
                 </Link>
               ))}
             </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
