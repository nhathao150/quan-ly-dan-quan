import { useAuth } from '@clerk/clerk-react';
import { Search, Plus, Edit, Trash2, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL, API_BASE_URL } from '../config';

const REQUIRED_DOCS = [
  { id: 'donXin', label: 'Đơn xin' },
  { id: 'lyLich', label: 'Lý lịch' },
  { id: 'xacMinh', label: 'Xác minh' },
  { id: 'khamSucKhoe', label: 'Khám SK' },
  { id: 'quyetDinhDQTV', label: 'QĐ DQTV' }
];

export default function MilitiaList() {
  const { getToken } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('');
  const navigate = useNavigate();

  const fetchMilitia = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (classification) query.append('classification', classification);

      const res = await fetch(`${API_BASE_URL}/militia?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilitia();
  }, [search, classification]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return;
    
    try {
      const token = await getToken();
      await fetch(`${API_BASE_URL}/militia/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMilitia(); // Reload list
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa!');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const checkDocStatus = (attachments: any) => {
    if (!attachments || typeof attachments !== 'object') return { missing: REQUIRED_DOCS, count: 0 };
    
    const missing = REQUIRED_DOCS.filter(doc => !attachments[doc.id] || attachments[doc.id].length === 0);
    return {
      missing,
      count: REQUIRED_DOCS.length - missing.length,
      total: REQUIRED_DOCS.length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Danh sách Hồ sơ</h1>
        <button onClick={() => navigate("/ho-so/them-moi")} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm">
          <Plus size={20} />
          <span>Thêm hồ sơ mới</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo tên, CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex space-x-2">
            <select 
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Tất cả phân loại</option>
              <option value="NONG_COT">Nòng cốt</option>
              <option value="CO_DONG">Cơ động</option>
              <option value="TAI_CHO">Tại chỗ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                <th className="p-4 font-medium">Họ và tên</th>
                <th className="p-4 font-medium">CCCD</th>
                <th className="p-4 font-medium">Phân loại</th>
                <th className="p-4 font-medium w-64">Tiến độ Giấy tờ</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có hồ sơ nào.</td>
                </tr>
              ) : (
                data.map((item) => {
                  const docStatus = checkDocStatus(item.attachments);
                  const isComplete = docStatus.missing.length === 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">
                        {item.fullName}
                        <div className="text-xs text-gray-500 font-normal mt-0.5">SN: {formatDate(item.dateOfBirth)}</div>
                      </td>
                      <td className="p-4 text-gray-600">{item.nationalId}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {item.classification === 'NONG_COT' ? 'Nòng cốt' : item.classification === 'CO_DONG' ? 'Cơ động' : 'Tại chỗ'}
                        </span>
                      </td>
                      
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center space-x-2">
                            {isComplete ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : (
                              <AlertCircle size={16} className="text-orange-500" />
                            )}
                            <span className={`font-medium text-xs ${isComplete ? 'text-green-600' : 'text-orange-600'}`}>
                              {docStatus.count} / {docStatus.total} giấy tờ bắt buộc
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full max-w-[150px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isComplete ? 'bg-green-500' : 'bg-orange-400'}`} 
                              style={{ width: `${(docStatus.count / docStatus.total) * 100}%` }}
                            ></div>
                          </div>

                          {/* Hiển thị trực tiếp các giấy tờ còn thiếu mà không cần hover */}
                          {!isComplete && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {docStatus.missing.map(m => (
                                <span key={m.id} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">
                                  Thiếu: {m.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {item.status === 'ACTIVE' ? 'Đang tại ngũ' : item.status === 'INACTIVE' ? 'Tạm hoãn' : 'Đã xuất ngũ'}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-end space-x-1">
                        <button onClick={() => navigate(`/ho-so/chi-tiet/${item.id}`)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Xem chi tiết">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => navigate(`/ho-so/sua/${item.id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
