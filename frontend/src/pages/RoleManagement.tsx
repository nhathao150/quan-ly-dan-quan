import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { ShieldAlert, UserPlus, Trash2, Users, Package, Crown } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function RoleManagement() {
  const { getToken } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    role: 'DAN_QUAN',
    note: ''
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setRoles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ email: '', fullName: '', role: 'DAN_QUAN', note: '' });
        fetchRoles();
      }
    } catch (err) {
      alert('Lỗi lưu phân quyền');
    }
  };

  const handleQuickChangeRole = async (item: any, newRole: string) => {
    const token = await getToken();
    await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        email: item.email,
        fullName: item.fullName,
        role: newRole,
        note: item.note
      })
    });
    fetchRoles();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa quyền truy cập của tài khoản này?')) return;
    const token = await getToken();
    await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRoles();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="text-green-700" />
          Phân quyền Tài khoản Chỉ huy & Quản trị
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Mỗi tài khoản đăng nhập bằng Email sẽ tự động được đưa vào đúng giao diện riêng biệt để bảo mật thông tin giữa các bộ phận.
        </p>
      </div>

      {/* Sơ đồ 3 nhóm quyền */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 font-bold text-purple-900 text-sm mb-1">
            <Crown size={18} className="text-purple-700" />
            Admin Tổng (SUPER_ADMIN)
          </div>
          <p className="text-xs text-purple-800">
            Thấy toàn bộ hệ thống: cả <b>Quản lý Dân quân</b>, <b>Quản lý Hậu cần</b> và trang <b>Phân quyền</b> này.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 font-bold text-green-900 text-sm mb-1">
            <Users size={18} className="text-green-700" />
            Chỉ huy Dân Quân (DAN_QUAN)
          </div>
          <p className="text-xs text-green-800">
            Chỉ thấy giao diện <b>Hồ sơ Dân quân</b>. Không thể nhìn thấy hay truy cập bất kỳ thông tin nào của bên Hậu cần.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-1">
            <Package size={18} className="text-amber-700" />
            Chỉ huy Hậu Cần (HAU_CAN)
          </div>
          <p className="text-xs text-amber-800">
            Chỉ thấy giao diện <b>Quản lý Hậu cần</b> (Kho quân trang, Cấp phát, Ăn trực, Chứng từ). Không thấy Hồ sơ Dân quân.
          </p>
        </div>
      </div>

      {/* Form thêm / cập nhật quyền theo Email */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-green-600" />
          Cấp quyền cho Tài khoản mới (hoặc cập nhật theo Email)
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email đăng nhập (Google/Clerk) *</label>
            <input
              required
              type="email"
              placeholder="chihuy1@gmail.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Họ tên / Chức vụ</label>
            <input
              type="text"
              placeholder="VD: Đ/c Nguyễn Văn B - Chỉ huy phó"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phân quyền giao diện *</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-medium"
            >
              <option value="DAN_QUAN">Chỉ huy Dân Quân (Chỉ xem Dân quân)</option>
              <option value="HAU_CAN">Chỉ huy Hậu Cần (Chỉ xem Hậu cần)</option>
              <option value="SUPER_ADMIN">Admin Tổng (Xem toàn bộ)</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Lưu Phân Quyền
            </button>
          </div>
        </form>
      </div>

      {/* Bảng danh sách tài khoản đã phân quyền */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 font-bold text-sm text-gray-700">
          Danh sách Tài khoản được phép truy cập hệ thống
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs text-gray-500 uppercase">
                <th className="p-4">Email đăng nhập</th>
                <th className="p-4">Họ tên / Ghi chú</th>
                <th className="p-4">Giao diện được phép truy cập</th>
                <th className="p-4">Đổi nhanh quyền</th>
                <th className="p-4 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Đang tải danh sách quyền...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có tài khoản nào được cấu hình.</td>
                </tr>
              ) : (
                roles.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{item.email}</td>
                    <td className="p-4 text-gray-700">
                      <div>{item.fullName || '-'}</div>
                      {item.note && <div className="text-xs text-gray-400">{item.note}</div>}
                    </td>
                    <td className="p-4">
                      {item.role === 'SUPER_ADMIN' && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
                          👑 Admin Tổng (Toàn bộ hệ thống)
                        </span>
                      )}
                      {item.role === 'DAN_QUAN' && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                          🛡️ Chỉ huy Dân Quân (Chỉ thấy Dân quân)
                        </span>
                      )}
                      {item.role === 'HAU_CAN' && (
                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                          📦 Chỉ huy Hậu Cần (Chỉ thấy Hậu cần)
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <select
                        value={item.role}
                        onChange={e => handleQuickChangeRole(item, e.target.value)}
                        className="px-2.5 py-1 border rounded text-xs bg-white"
                      >
                        <option value="DAN_QUAN">Chỉ huy Dân Quân</option>
                        <option value="HAU_CAN">Chỉ huy Hậu Cần</option>
                        <option value="SUPER_ADMIN">Admin Tổng</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg" title="Xóa quyền">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
