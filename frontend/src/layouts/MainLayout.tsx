import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Package, ShieldAlert, Menu, Lock, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import { UserButton, useUser, useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchRole = async () => {
      if (!isLoaded || !user) return;
      try {
        const token = await getToken();
        const email = user.primaryEmailAddress?.emailAddress || '';
        const fullName = user.fullName || '';
        const q = new URLSearchParams({ email, fullName });
        const res = await fetch(`${API_BASE_URL}/roles/me?${q.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role || 'SUPER_ADMIN');
        } else {
          setUserRole('SUPER_ADMIN');
        }
      } catch (e) {
        console.error(e);
        setUserRole('SUPER_ADMIN');
      } finally {
        setRoleLoading(false);
      }
    };
    fetchRole();
  }, [isLoaded, user]);

  // Chặn và tự động điều hướng về đúng giao diện của từng Chỉ huy
  useEffect(() => {
    if (roleLoading || !userRole) return;
    const path = location.pathname;

    if (userRole === 'DAN_QUAN') {
      if (path.startsWith('/hau-can') || path.startsWith('/phan-quyen')) {
        navigate('/ho-so', { replace: true });
      }
    } else if (userRole === 'HAU_CAN') {
      if (!path.startsWith('/hau-can') && !path.startsWith('/cong-viec')) {
        navigate('/hau-can', { replace: true });
      }
    }
  }, [userRole, roleLoading, location.pathname, navigate]);

  if (!isLoaded || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">
        Đang kiểm tra phân quyền tài khoản...
      </div>
    );
  }

  // Nếu tài khoản lạ chưa được Admin cấp quyền
  if (userRole === 'UNASSIGNED') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg border border-red-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tài khoản chưa được phân quyền</h2>
          <p className="text-sm text-gray-600">
            Email <b>{user?.primaryEmailAddress?.emailAddress}</b> chưa được cấp quyền truy cập vào Ban Dân Quân hoặc Ban Hậu Cần.
          </p>
          <p className="text-xs text-gray-500">
            Vui lòng liên hệ đồng chí Admin Tổng để được thêm Email vào danh sách phân quyền.
          </p>
          <div className="pt-4 flex justify-center">
            <UserButton afterSignOutUrl="/login" />
          </div>
        </div>
      </div>
    );
  }

  // Xây dựng menu riêng biệt theo từng quyền
  const menuItems = [];
  if (userRole === 'SUPER_ADMIN' || userRole === 'DAN_QUAN') {
    menuItems.push(
      { path: '/dashboard', label: 'Tổng quan Dân quân', icon: <Home size={20} /> },
      { path: '/ho-so', label: 'Hồ sơ dân quân', icon: <Users size={20} /> }
    );
  }
  if (userRole === 'SUPER_ADMIN' || userRole === 'HAU_CAN') {
    menuItems.push({ path: '/hau-can', label: 'Quản lý Hậu cần', icon: <Package size={20} /> });
  }
  // Cả 3 quyền đều có mục Nhắc việc & Tiến độ (đã được lọc riêng dữ liệu theo từng Ban)
  menuItems.push({ path: '/cong-viec', label: 'Nhắc việc & Tiến độ', icon: <ClipboardList size={20} /> });

  if (userRole === 'SUPER_ADMIN') {
    menuItems.push({ path: '/phan-quyen', label: 'Phân quyền Tài khoản', icon: <ShieldAlert size={20} /> });
  }

  const sidebarBg = userRole === 'HAU_CAN' ? 'bg-amber-900' : 'bg-green-800';
  const sidebarBorder = userRole === 'HAU_CAN' ? 'border-amber-800' : 'border-green-700';
  const sidebarActive = userRole === 'HAU_CAN' ? 'bg-amber-700 font-medium' : 'bg-green-700 font-medium';
  const sidebarHover = userRole === 'HAU_CAN' ? 'hover:bg-amber-800/60' : 'hover:bg-green-700/50';

  const subtitle =
    userRole === 'HAU_CAN'
      ? 'Ban Hậu Cần - Kỹ Thuật'
      : userRole === 'DAN_QUAN'
      ? 'Quản Lý Dân Quân'
      : 'Hệ Thống Quản Trị Tổng';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={`w-64 ${sidebarBg} text-white hidden md:flex flex-col`}>
        <div className={`p-4 flex items-center justify-center border-b ${sidebarBorder} h-16`}>
          <h1 className="font-bold text-xl uppercase tracking-wider text-center">
            BCH Quân Sự<br />
            <span className="text-xs font-normal opacity-90">{subtitle}</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? sidebarActive : sidebarHover}`}
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
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center px-4 justify-between md:justify-end">
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-3">
            {userRole === 'SUPER_ADMIN' && (
              <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-bold">
                👑 Admin Tổng
              </span>
            )}
            {userRole === 'DAN_QUAN' && (
              <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-bold">
                🛡️ Chỉ huy Dân Quân
              </span>
            )}
            {userRole === 'HAU_CAN' && (
              <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">
                📦 Chỉ huy Hậu Cần
              </span>
            )}
            <span className="font-medium text-gray-700 hidden sm:block">
              {user?.fullName || user?.primaryEmailAddress?.emailAddress}
            </span>
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
          <aside className={`w-64 ${sidebarBg} text-white flex flex-col z-10 relative`}>
            <div className={`p-4 border-b ${sidebarBorder} h-16 flex items-center justify-center`}>
              <h1 className="font-bold text-lg">{subtitle}</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${location.pathname.startsWith(item.path) ? sidebarActive : ''}`}
                >
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
