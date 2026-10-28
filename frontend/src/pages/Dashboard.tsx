import { useAuth, useUser } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  Plus,
  FileWarning
} from 'lucide-react';
import { API_BASE_URL, TYPE_OPTIONS } from '../config';

const REQUIRED_DOCS = ['donXin', 'lyLich', 'xacMinh', 'khamSucKhoe', 'quyetDinhDQTV'];

export default function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [records, setRecords] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const email = user?.primaryEmailAddress?.emailAddress || '';

        const [militiaRes, tasksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/militia`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/tasks?email=${encodeURIComponent(email)}&department=DAN_QUAN`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (militiaRes.ok) {
          const mData = await militiaRes.json();
          if (Array.isArray(mData)) setRecords(mData);
        }

        if (tasksRes.ok) {
          const tData = await tasksRes.json();
          if (Array.isArray(tData)) setTasks(tData);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu Tổng quan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const isDocComplete = (attachments: any) => {
    if (!attachments || typeof attachments !== 'object') return false;
    return REQUIRED_DOCS.every(docId => Array.isArray(attachments[docId]) && attachments[docId].length > 0);
  };

  // Tính toán số liệu thực tế
  const totalMilitia = records.length;
  const activeMilitia = records.filter(r => r.status === 'ACTIVE').length;
  const completeDocsCount = records.filter(r => isDocComplete(r.attachments)).length;
  const missingDocsCount = totalMilitia - completeDocsCount;

  // Thống kê theo 4 loại dân quân
  const countByType = TYPE_OPTIONS.map(type => ({
    type,
    count: records.filter(r => r.militiaType === type).length
  }));
  const unclassifiedCount = records.filter(r => !r.militiaType).length;

  // 5 hồ sơ mới thêm gần nhất
  const recentRecords = records.slice(0, 5);

  // Công việc chưa hoàn thành
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED').slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tổng quan Hồ sơ Dân quân</h1>
          <p className="text-sm text-gray-500">Số liệu thống kê thời gian thực từ cơ sở dữ liệu</p>
        </div>
        <button
          onClick={() => navigate('/ho-so/them-moi')}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Thêm hồ sơ mới</span>
        </button>
      </div>

      {/* 4 Thẻ thống kê chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/ho-so')}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="p-3.5 rounded-full bg-blue-100 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Tổng số hồ sơ dân quân</p>
            <h3 className="text-2xl font-bold text-gray-900">{loading ? '...' : totalMilitia}</h3>
          </div>
        </div>

        <div
          onClick={() => navigate('/ho-so')}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:border-green-300 transition-colors"
        >
          <div className="p-3.5 rounded-full bg-green-100 text-green-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đang tại ngũ</p>
            <h3 className="text-2xl font-bold text-green-700">{loading ? '...' : activeMilitia}</h3>
          </div>
        </div>

        <div
          onClick={() => navigate('/ho-so')}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="p-3.5 rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Đã đủ 5/5 giấy tờ</p>
            <h3 className="text-2xl font-bold text-emerald-700">{loading ? '...' : completeDocsCount}</h3>
          </div>
        </div>

        <div
          onClick={() => navigate('/ho-so')}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:border-orange-300 transition-colors"
        >
          <div className="p-3.5 rounded-full bg-orange-100 text-orange-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Còn thiếu giấy tờ</p>
            <h3 className="text-2xl font-bold text-orange-600">{loading ? '...' : missingDocsCount}</h3>
          </div>
        </div>
      </div>

      {/* Thống kê theo từng Loại Dân quân */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-base font-bold text-gray-800 mb-4">Số lượng theo Phân loại Dân quân</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {countByType.map(item => (
            <div key={item.type} className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <span className="text-xs font-medium text-gray-600">{item.type}</span>
              <span className="text-2xl font-bold text-green-800 mt-2">{loading ? '...' : item.count} <span className="text-xs font-normal text-gray-500">hồ sơ</span></span>
            </div>
          ))}
        </div>
        {unclassifiedCount > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            * Có <b>{unclassifiedCount}</b> hồ sơ chưa chọn loại dân quân.
          </p>
        )}
      </div>

      {/* 2 Cột: Hồ sơ mới thêm gần đây & Nhắc việc đang chờ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: Hồ sơ mới thêm gần đây */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Hồ sơ cập nhật gần đây</h2>
              <button
                onClick={() => navigate('/ho-so')}
                className="text-xs text-green-700 hover:underline font-medium flex items-center gap-1"
              >
                Xem tất cả <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
            ) : recentRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Chưa có hồ sơ dân quân nào trong hệ thống.
              </div>
            ) : (
              <div className="space-y-3">
                {recentRecords.map(rec => {
                  const full = isDocComplete(rec.attachments);
                  return (
                    <div
                      key={rec.id}
                      onClick={() => navigate(`/ho-so/chi-tiet/${rec.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 font-bold flex items-center justify-center text-sm">
                          {rec.fullName?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{rec.fullName}</p>
                          <p className="text-xs text-gray-500">
                            {rec.militiaType || 'Chưa phân loại'}
                            {rec.militiaUnit ? ` • ${rec.militiaUnit}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {full ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 font-medium">
                            <CheckCircle2 size={12} /> Đủ hồ sơ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200 font-medium">
                            <FileWarning size={12} /> Thiếu giấy tờ
                          </span>
                        )}
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(rec.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cột 2: Nhắc việc & Tiến độ đang thực hiện */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList size={18} className="text-green-700" />
                Công việc cần thực hiện
              </h2>
              <button
                onClick={() => navigate('/cong-viec')}
                className="text-xs text-green-700 hover:underline font-medium flex items-center gap-1"
              >
                Quản lý công việc <ArrowRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Đang tải công việc...</div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Hiện không có công việc nào đang tồn đọng.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => navigate('/cong-viec')}
                    className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{task.title}</span>
                      <span className="text-xs font-bold text-blue-600">{task.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Người phụ trách: <b>{task.assigneeName}</b></span>
                      {task.dueDate && (
                        <span>Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
