import { useAuth, useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  BellRing,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Calendar,
  Trash2
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function TaskManagement() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const userFullName = user?.fullName || userEmail;

  const [userRole, setUserRole] = useState<string>('SUPER_ADMIN');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modal tạo công việc mới
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    department: 'DAN_QUAN',
    assigneeName: '',
    priority: 'MEDIUM',
    dueDate: '',
    progress: 0
  });

  // Lấy quyền của tài khoản hiện tại
  useEffect(() => {
    const fetchMyRole = async () => {
      if (!userEmail) return;
      try {
        const token = await getToken();
        const q = new URLSearchParams({ email: userEmail, fullName: userFullName });
        const res = await fetch(`${API_BASE_URL}/roles/me?${q.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const r = data.role || 'SUPER_ADMIN';
          setUserRole(r);
          if (r === 'DAN_QUAN') {
            setForm(prev => ({ ...prev, department: 'DAN_QUAN' }));
          } else if (r === 'HAU_CAN') {
            setForm(prev => ({ ...prev, department: 'HAU_CAN' }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchMyRole();
  }, [userEmail]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const q = new URLSearchParams();
      if (userEmail) q.append('email', userEmail);
      if (search) q.append('search', search);
      if (statusFilter) q.append('status', statusFilter);
      if (userRole === 'SUPER_ADMIN' && deptFilter) {
        q.append('department', deptFilter);
      }

      const res = await fetch(`${API_BASE_URL}/tasks?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userEmail, userRole, search, statusFilter, deptFilter]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          callerEmail: userEmail,
          assignedBy: userFullName
        })
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          title: '',
          description: '',
          department: userRole === 'HAU_CAN' ? 'HAU_CAN' : 'DAN_QUAN',
          assigneeName: '',
          priority: 'MEDIUM',
          dueDate: '',
          progress: 0
        });
        fetchTasks();
      }
    } catch (err) {
      alert('Lỗi tạo công việc');
    }
  };

  const handleUpdateProgress = async (taskId: number, newProgress: number) => {
    try {
      const token = await getToken();
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ progress: newProgress })
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
    try {
      const token = await getToken();
      await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // Kiểm tra trạng thái hạn hoàn thành (Quá hạn / Sắp đến hạn)
  const getDueStatus = (dueDateStr?: string, status?: string) => {
    if (!dueDateStr || status === 'COMPLETED') return 'normal';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue'; // Quá hạn
    if (diffDays <= 3) return 'soon'; // Sắp đến hạn trong 3 ngày
    return 'normal';
  };

  // Thống kê
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  // Các công việc cần nhắc nhở khẩn (Quá hạn hoặc Sắp đến hạn hoặc Khẩn cấp chưa xong)
  const urgentReminders = tasks.filter(
    t => t.status !== 'COMPLETED' && (getDueStatus(t.dueDate, t.status) !== 'normal' || t.priority === 'HIGH')
  );

  const deptLabel =
    userRole === 'DAN_QUAN'
      ? 'Ban Quản Lý Dân Quân'
      : userRole === 'HAU_CAN'
      ? 'Ban Hậu Cần - Kỹ Thuật'
      : 'Toàn Hệ Thống (Admin Tổng)';

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="text-green-700" />
            Nhắc việc & Tiến độ Thực hiện ({deptLabel})
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Theo dõi việc đã làm, chưa làm, tiến độ hoàn thành và người được phân công phụ trách
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span>Giao việc / Thêm nhắc nhở mới</span>
        </button>
      </div>

      {/* Bảng Nhắc nhở nổi bật (Nếu có việc quá hạn / sắp tới hạn / khẩn cấp) */}
      {urgentReminders.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <BellRing size={18} className="text-amber-600 animate-bounce" />
            <span>NHẮC NHỞ QUAN TRỌNG: Có {urgentReminders.length} công việc cần chú ý ngay!</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {urgentReminders.map(rem => {
              const dueState = getDueStatus(rem.dueDate, rem.status);
              return (
                <div key={rem.id} className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-bold text-gray-900">{rem.title}</span>
                    <span className="text-gray-500 ml-2">• Giao cho: <b>{rem.assigneeName}</b></span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                    dueState === 'overdue'
                      ? 'bg-red-100 text-red-700'
                      : dueState === 'soon'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {dueState === 'overdue' ? 'Quá hạn!' : dueState === 'soon' ? 'Sắp hết hạn' : 'Khẩn cấp'} ({rem.progress}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 Thẻ Thống kê Tiến độ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Tổng số công việc</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Chưa làm (0%)</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{pendingCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Đang thực hiện</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Đã hoàn thành (100%)</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm & Lọc */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên công việc hoặc tên người được giao..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="">-- Tất cả tiến độ --</option>
            <option value="PENDING">Chưa làm (0%)</option>
            <option value="IN_PROGRESS">Đang làm (25% - 75%)</option>
            <option value="COMPLETED">Đã hoàn thành (100%)</option>
          </select>

          {/* Chỉ Admin Tổng mới thấy bộ lọc chọn xem việc của Dân Quân hay Hậu Cần */}
          {userRole === 'SUPER_ADMIN' && (
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm bg-purple-50 text-purple-900 font-medium"
            >
              <option value="">👑 Xem cả 2 Ban (Dân Quân + Hậu Cần)</option>
              <option value="DAN_QUAN">🛡️ Chỉ xem việc Ban Dân Quân</option>
              <option value="HAU_CAN">📦 Chỉ xem việc Ban Hậu Cần</option>
            </select>
          )}
        </div>
      </div>

      {/* Danh sách Công việc */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-8 rounded-xl border text-center text-gray-500">Đang tải danh sách công việc...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border text-center text-gray-500">
            Chưa có công việc nào trong danh sách. Hãy bấm <b>"Giao việc / Thêm nhắc nhở mới"</b> để bắt đầu!
          </div>
        ) : (
          tasks.map(task => {
            const dueState = getDueStatus(task.dueDate, task.status);
            const isDone = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className={`bg-white p-5 rounded-xl border transition-all shadow-sm ${
                  isDone
                    ? 'border-green-200 bg-green-50/30'
                    : dueState === 'overdue'
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Cột trái: Thông tin công việc & Người được giao */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Nhãn bộ phận (chỉ hiện rõ khi Admin xem) */}
                      {userRole === 'SUPER_ADMIN' && (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          task.department === 'HAU_CAN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {task.department === 'HAU_CAN' ? '📦 Ban Hậu Cần' : '🛡️ Ban Dân Quân'}
                        </span>
                      )}

                      {/* Nhãn độ ưu tiên */}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        task.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'MEDIUM'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {task.priority === 'HIGH' ? '🔥 Khẩn cấp' : task.priority === 'MEDIUM' ? 'Bình thường' : 'Ưu tiên thấp'}
                      </span>

                      {/* Nhãn Trạng thái */}
                      {isDone ? (
                        <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded text-xs font-bold">
                          ✓ Đã hoàn thành
                        </span>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded text-xs font-bold">
                          ⏳ Đang thực hiện ({task.progress}%)
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded text-xs font-bold">
                          ○ Chưa làm (0%)
                        </span>
                      )}

                      <h3 className={`text-base font-bold ${isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md font-medium">
                        <UserCheck size={14} />
                        <span>Người được giao: <b>{task.assigneeName}</b></span>
                      </div>

                      {task.dueDate && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium ${
                          dueState === 'overdue'
                            ? 'bg-red-100 text-red-700 font-bold'
                            : dueState === 'soon'
                            ? 'bg-orange-100 text-orange-800 font-bold'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <Calendar size={14} />
                          <span>
                            Hạn chót: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                            {dueState === 'overdue' && ' (ĐÃ QUÁ HẠN!)'}
                            {dueState === 'soon' && ' (Sắp đến hạn)'}
                          </span>
                        </div>
                      )}

                      {task.assignedBy && (
                        <span className="text-gray-400">Giao bởi: {task.assignedBy}</span>
                      )}
                    </div>
                  </div>

                  {/* Cột phải: Cập nhật nhanh Tiến độ % & Nút xóa */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 min-w-[260px]">
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-gray-500">Tiến độ hoàn thành:</span>
                        <span className={isDone ? 'text-green-600' : 'text-blue-600'}>{task.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full transition-all ${isDone ? 'bg-green-500' : 'bg-blue-600'}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>

                      {/* Các nút bấm cập nhật nhanh tiến độ */}
                      <div className="flex items-center justify-between gap-1">
                        {[0, 25, 50, 75, 100].map(pct => (
                          <button
                            key={pct}
                            onClick={() => handleUpdateProgress(task.id, pct)}
                            className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${
                              task.progress === pct
                                ? pct === 100
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {pct === 100 ? '✓ 100%' : `${pct}%`}
                          </button>
                        ))}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-1"
                          title="Xóa công việc"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Giao việc / Thêm nhắc nhở mới */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
              Giao Công Việc & Nhắc Nhở Mới
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              {/* Chỉ Admin Tổng mới được chọn giao việc cho bên Dân Quân hay Hậu Cần */}
              {userRole === 'SUPER_ADMIN' && (
                <div>
                  <label className="block text-xs font-bold text-purple-800 mb-1">
                    Phân bổ cho Bộ phận nào? (Chỉ huy bên kia sẽ không thấy) *
                  </label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm bg-purple-50 font-semibold"
                  >
                    <option value="DAN_QUAN">🛡️ Ban Quản Lý Dân Quân (Chỉ huy Dân quân)</option>
                    <option value="HAU_CAN">📦 Ban Hậu Cần - Kỹ Thuật (Chỉ huy Hậu cần)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên công việc / Nhiệm vụ cần làm *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Rà soát danh sách dân quân cơ động Đội 1..."
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chi tiết / Ghi chú thực hiện</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú rõ các bước hoặc yêu cầu cần hoàn thành..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Giao cho ai thực hiện? *</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Đ/c Minh (Đội trưởng Đội 1)"
                    value={form.assigneeName}
                    onChange={e => setForm({ ...form, assigneeName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hạn hoàn thành (Nhắc nhở)</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="MEDIUM">Bình thường</option>
                    <option value="HIGH">🔥 Khẩn cấp / Quan trọng</option>
                    <option value="LOW">Ưu tiên thấp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tiến độ ban đầu</label>
                  <select
                    value={form.progress}
                    onChange={e => setForm({ ...form, progress: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value={0}>0% - Chưa làm</option>
                    <option value={25}>25% - Đang triển khai</option>
                    <option value={50}>50% - Đã làm một nửa</option>
                    <option value={75}>75% - Sắp xong</option>
                    <option value={100}>100% - Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800"
                >
                  Lưu Công Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
