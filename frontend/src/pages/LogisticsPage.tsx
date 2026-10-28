import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  DollarSign,
  FolderCheck,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  RotateCcw,
  Upload,
  FileText,
  Eye,
  X
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { API_BASE_URL, SERVER_URL } from '../config';

const LOGISTICS_DOC_TYPES = [
  { id: 'phieuNhapXuat', label: 'Phiếu nhập / xuất kho quân trang' },
  { id: 'bienBanKiemKe', label: 'Biên bản kiểm kê vật chất hậu cần' },
  { id: 'chamCongAn', label: 'Bảng chấm công ăn trực & phụ cấp' },
  { id: 'hoaDonMuaSam', label: 'Hóa đơn / Chứng từ mua sắm hậu cần' },
  { id: 'quyetDinhKinhPhi', label: 'Quyết định phân bổ / quyết toán kinh phí' },
  { id: 'chungTuKhac', label: 'Các loại chứng từ hậu cần khác' }
];

const INVENTORY_CATEGORIES = [
  'Quân trang',
  'Công cụ hỗ trợ',
  'Vật chất doanh trại',
  'Giường / Chăn màn',
  'Vật tư y tế / Khác'
];

export default function LogisticsPage() {
  const { getToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'inventory';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // ==================== STATE: 1. KHO QUÂN TRANG ====================
  const [inventory, setInventory] = useState<any[]>([]);
  const [invSearch, setInvSearch] = useState('');
  const [invCategory, setInvCategory] = useState('');
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({
    itemName: '',
    category: 'Quân trang',
    quantity: 1,
    unit: 'Bộ',
    condition: 'Tốt',
    note: ''
  });

  // ==================== STATE: 2. CẤP PHÁT & THU HỒI ====================
  const [distributions, setDistributions] = useState<any[]>([]);
  const [distSearch, setDistSearch] = useState('');
  const [distStatus, setDistStatus] = useState('');
  const [showDistModal, setShowDistModal] = useState(false);
  const [distForm, setDistForm] = useState({
    itemName: '',
    recipientName: '',
    recipientUnit: '',
    quantity: 1,
    issueDate: new Date().toISOString().substring(0, 10),
    note: ''
  });

  // ==================== STATE: 3. KINH PHÍ & ĂN UỐNG ====================
  const [finances, setFinances] = useState<any[]>([]);
  const [finType, setFinType] = useState('');
  const [showFinModal, setShowFinModal] = useState(false);
  const [finForm, setFinForm] = useState({
    title: '',
    type: 'CHI_AN',
    amount: '',
    recordDate: new Date().toISOString().substring(0, 10),
    personInCharge: '',
    note: ''
  });

  // ==================== STATE: 4. HỒ SƠ CHỨNG TỪ HẬU CẦN ====================
  const [documents, setDocuments] = useState<any[]>([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docSaving, setDocSaving] = useState(false);
  const [docForm, setDocForm] = useState({
    title: '',
    period: '',
    note: ''
  });
  const [docChecked, setDocChecked] = useState<Record<string, boolean>>({});
  const [docFiles, setDocFiles] = useState<Record<string, File[]>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ==================== FETCH DATA ====================
  const fetchInventory = async () => {
    try {
      const token = await getToken();
      const q = new URLSearchParams();
      if (invSearch) q.append('search', invSearch);
      if (invCategory) q.append('category', invCategory);
      const res = await fetch(`${API_BASE_URL}/logistics/inventory?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setInventory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDistributions = async () => {
    try {
      const token = await getToken();
      const q = new URLSearchParams();
      if (distSearch) q.append('search', distSearch);
      if (distStatus) q.append('status', distStatus);
      const res = await fetch(`${API_BASE_URL}/logistics/distribution?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDistributions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFinances = async () => {
    try {
      const token = await getToken();
      const q = new URLSearchParams();
      if (finType) q.append('type', finType);
      const res = await fetch(`${API_BASE_URL}/logistics/finance?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setFinances(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/logistics/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDocuments(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [invSearch, invCategory]);

  useEffect(() => {
    fetchDistributions();
  }, [distSearch, distStatus]);

  useEffect(() => {
    fetchFinances();
  }, [finType]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // ==================== HANDLERS: 1. INVENTORY ====================
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(invForm)
    });
    setShowInvModal(false);
    setInvForm({ itemName: '', category: 'Quân trang', quantity: 1, unit: 'Bộ', condition: 'Tốt', note: '' });
    fetchInventory();
  };

  const handleDeleteInventory = async (id: number) => {
    if (!window.confirm('Xóa vật tư này khỏi kho?')) return;
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/inventory/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchInventory();
  };

  // ==================== HANDLERS: 2. DISTRIBUTION ====================
  const handleAddDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/distribution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(distForm)
    });
    setShowDistModal(false);
    setDistForm({
      itemName: '',
      recipientName: '',
      recipientUnit: '',
      quantity: 1,
      issueDate: new Date().toISOString().substring(0, 10),
      note: ''
    });
    fetchDistributions();
  };

  const handleToggleReturn = async (item: any) => {
    const newStatus = item.status === 'ISSUED' ? 'RETURNED' : 'ISSUED';
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/distribution/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus })
    });
    fetchDistributions();
  };

  const handleDeleteDistribution = async (id: number) => {
    if (!window.confirm('Xóa bản ghi cấp phát này?')) return;
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/distribution/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchDistributions();
  };

  // ==================== HANDLERS: 3. FINANCE ====================
  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/finance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...finForm,
        amount: Number(finForm.amount)
      })
    });
    setShowFinModal(false);
    setFinForm({
      title: '',
      type: 'CHI_AN',
      amount: '',
      recordDate: new Date().toISOString().substring(0, 10),
      personInCharge: '',
      note: ''
    });
    fetchFinances();
  };

  const handleDeleteFinance = async (id: number) => {
    if (!window.confirm('Xóa khoản thu/chi này?')) return;
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/finance/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchFinances();
  };

  // ==================== HANDLERS: 4. DOCUMENTS ====================
  const handleDocFileChange = async (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const processed = await Promise.all(
        files.map(async (f) => {
          if (f.type.startsWith('image/')) {
            try {
              const blob = await imageCompression(f, { maxSizeMB: 0.5, maxWidthOrHeight: 1920, useWebWorker: true });
              return new File([blob], f.name, { type: f.type });
            } catch {
              return f;
            }
          }
          return f;
        })
      );
      setDocFiles(prev => ({ ...prev, [docId]: [...(prev[docId] || []), ...processed] }));
      setDocChecked(prev => ({ ...prev, [docId]: true }));
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocSaving(true);
    try {
      const token = await getToken();
      const uploadedUrls: Record<string, string[]> = {};

      for (const doc of LOGISTICS_DOC_TYPES) {
        if (docFiles[doc.id] && docFiles[doc.id].length > 0) {
          const fd = new FormData();
          docFiles[doc.id].forEach(file => fd.append('files', file, file.name));
          const upRes = await fetch(`${API_BASE_URL}/militia/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd
          });
          if (upRes.ok) {
            uploadedUrls[doc.id] = await upRes.json();
          }
        } else if (docChecked[doc.id]) {
          uploadedUrls[doc.id] = ['MANUAL_CHECK'];
        }
      }

      await fetch(`${API_BASE_URL}/logistics/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...docForm,
          attachments: uploadedUrls
        })
      });

      setShowDocModal(false);
      setDocForm({ title: '', period: '', note: '' });
      setDocChecked({});
      setDocFiles({});
      fetchDocuments();
    } catch (err: any) {
      alert('Lỗi lưu chứng từ: ' + err.message);
    } finally {
      setDocSaving(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm('Xóa bộ hồ sơ chứng từ này?')) return;
    const token = await getToken();
    await fetch(`${API_BASE_URL}/logistics/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchDocuments();
  };

  // ==================== SUMMARY STATS ====================
  const totalRevenue = finances.filter(f => f.type === 'THU').reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalExpense = finances.filter(f => f.type !== 'THU').reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const balance = totalRevenue - totalExpense;

  return (
    <div className="space-y-6 pb-16">
      {/* Lightbox xem ảnh */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewUrl(null)}>
          <button className="absolute top-4 right-4 text-white p-2 bg-black/50 rounded-full" onClick={() => setPreviewUrl(null)}>
            <X size={28} />
          </button>
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg bg-white" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Hậu cần - Kỹ thuật</h1>
          <p className="text-sm text-gray-500">Quản lý kho quân trang, cấp phát, chế độ ăn trực và hồ sơ chứng từ hậu cần</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setTab('inventory')}
          className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
            activeTab === 'inventory'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          <Package size={24} className="shrink-0" />
          <div>
            <div className="font-bold text-sm">Kho Quân trang</div>
            <div className={`text-xs ${activeTab === 'inventory' ? 'text-amber-100' : 'text-gray-500'}`}>
              {inventory.length} danh mục vật chất
            </div>
          </div>
        </button>

        <button
          onClick={() => setTab('distribution')}
          className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
            activeTab === 'distribution'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          <Truck size={24} className="shrink-0" />
          <div>
            <div className="font-bold text-sm">Cấp phát & Thu hồi</div>
            <div className={`text-xs ${activeTab === 'distribution' ? 'text-amber-100' : 'text-gray-500'}`}>
              {distributions.filter(d => d.status === 'ISSUED').length} đang cấp phát
            </div>
          </div>
        </button>

        <button
          onClick={() => setTab('finance')}
          className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
            activeTab === 'finance'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          <DollarSign size={24} className="shrink-0" />
          <div>
            <div className="font-bold text-sm">Kinh phí & Ăn trực</div>
            <div className={`text-xs ${activeTab === 'finance' ? 'text-amber-100' : 'text-gray-500'}`}>
              Tồn quỹ: {balance.toLocaleString('vi-VN')} đ
            </div>
          </div>
        </button>

        <button
          onClick={() => setTab('documents')}
          className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
            activeTab === 'documents'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50'
          }`}
        >
          <FolderCheck size={24} className="shrink-0" />
          <div>
            <div className="font-bold text-sm">Hồ sơ & Chứng từ</div>
            <div className={`text-xs ${activeTab === 'documents' ? 'text-amber-100' : 'text-gray-500'}`}>
              {documents.length} bộ chứng từ
            </div>
          </div>
        </button>
      </div>

      {/* ==================== TAB 1: KHO QUÂN TRANG ==================== */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex flex-1 gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm tên quân trang, vật tư..."
                  value={invSearch}
                  onChange={e => setInvSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
              <select
                value={invCategory}
                onChange={e => setInvCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="">-- Tất cả phân loại --</option>
                {INVENTORY_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowInvModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Nhập kho vật tư mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-4">Tên Quân trang / Vật chất</th>
                  <th className="p-4">Phân loại</th>
                  <th className="p-4">Số lượng tồn</th>
                  <th className="p-4">Tình trạng</th>
                  <th className="p-4">Ghi chú</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có vật tư nào trong kho.</td>
                  </tr>
                ) : (
                  inventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900">{item.itemName}</td>
                      <td className="p-4">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        {item.quantity} <span className="font-normal text-gray-500">{item.unit}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                          item.condition === 'Tốt' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{item.note || '-'}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteInventory(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
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
      )}

      {/* ==================== TAB 2: CẤP PHÁT & THU HỒI ==================== */}
      {activeTab === 'distribution' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex flex-1 gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm theo người nhận hoặc tên quân trang..."
                  value={distSearch}
                  onChange={e => setDistSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
              <select
                value={distStatus}
                onChange={e => setDistStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="">-- Tất cả trạng thái --</option>
                <option value="ISSUED">Đang cấp phát</option>
                <option value="RETURNED">Đã thu hồi</option>
              </select>
            </div>
            <button
              onClick={() => setShowDistModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Tạo phiếu cấp phát</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                  <th className="p-4">Người nhận</th>
                  <th className="p-4">Đơn vị / Khu phố</th>
                  <th className="p-4">Quân trang cấp phát</th>
                  <th className="p-4">Số lượng</th>
                  <th className="p-4">Ngày cấp</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y">
                {distributions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">Chưa có danh sách cấp phát nào.</td>
                  </tr>
                ) : (
                  distributions.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-4 font-semibold text-gray-900">{item.recipientName}</td>
                      <td className="p-4 text-gray-600">{item.recipientUnit || '-'}</td>
                      <td className="p-4 font-medium text-blue-700">{item.itemName}</td>
                      <td className="p-4 font-bold">{item.quantity}</td>
                      <td className="p-4 text-gray-600">{new Date(item.issueDate).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4">
                        {item.status === 'ISSUED' ? (
                          <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded text-xs font-medium">
                            Đang cấp phát
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded text-xs font-medium">
                            Đã thu hồi ({item.returnDate ? new Date(item.returnDate).toLocaleDateString('vi-VN') : ''})
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleReturn(item)}
                          className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 border ${
                            item.status === 'ISSUED'
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {item.status === 'ISSUED' ? (
                            <>
                              <CheckCircle2 size={14} /> Đánh dấu Thu hồi
                            </>
                          ) : (
                            <>
                              <RotateCcw size={14} /> Hoàn tác
                            </>
                          )}
                        </button>
                        <button onClick={() => handleDeleteDistribution(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
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
      )}

      {/* ==================== TAB 3: KINH PHÍ & ĂN UỐNG / CHẾ ĐỘ TRỰC ==================== */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-semibold">Tổng kinh phí nhận (Thu)</p>
              <p className="text-2xl font-bold text-green-600 mt-1">+{totalRevenue.toLocaleString('vi-VN')} đ</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-semibold">Tổng chi ăn trực & Phụ cấp</p>
              <p className="text-2xl font-bold text-red-600 mt-1">-{totalExpense.toLocaleString('vi-VN')} đ</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-semibold">Kinh phí còn tồn</p>
              <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {balance.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-3">
              <select
                value={finType}
                onChange={e => setFinType(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm bg-white max-w-xs"
              >
                <option value="">-- Tất cả khoản Thu / Chi --</option>
                <option value="THU">Kinh phí cấp (Thu)</option>
                <option value="CHI_AN">Chi tiền ăn trực</option>
                <option value="PHU_CAP">Chi phụ cấp ngày công</option>
                <option value="KHAC">Chi mua sắm hậu cần khác</option>
              </select>
              <button
                onClick={() => setShowFinModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Ghi sổ Thu / Chi / Chấm ăn</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                    <th className="p-4">Ngày</th>
                    <th className="p-4">Nội dung</th>
                    <th className="p-4">Loại</th>
                    <th className="p-4">Số tiền (VNĐ)</th>
                    <th className="p-4">Người phụ trách</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y">
                  {finances.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Chưa có bản ghi kinh phí / chấm ăn nào.</td>
                    </tr>
                  ) : (
                    finances.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-600">{new Date(item.recordDate).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 font-semibold text-gray-900">
                          {item.title}
                          {item.note && <div className="text-xs text-gray-500 font-normal">{item.note}</div>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                            item.type === 'THU'
                              ? 'bg-green-100 text-green-800'
                              : item.type === 'CHI_AN'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.type === 'THU'
                              ? 'Kinh phí cấp'
                              : item.type === 'CHI_AN'
                              ? 'Tiền ăn trực'
                              : item.type === 'PHU_CAP'
                              ? 'Phụ cấp trực'
                              : 'Chi hậu cần khác'}
                          </span>
                        </td>
                        <td className={`p-4 font-bold ${item.type === 'THU' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.type === 'THU' ? '+' : '-'}{Number(item.amount).toLocaleString('vi-VN')} đ
                        </td>
                        <td className="p-4 text-gray-700">{item.personInCharge || '-'}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteFinance(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
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
      )}

      {/* ==================== TAB 4: HỒ SƠ & CHỨNG TỪ HẬU CẦN ==================== */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="font-bold text-gray-800">Lưu trữ Hồ sơ & Chứng từ Hậu cần</h3>
              <p className="text-xs text-gray-500">Có thể tích chọn "Đã có bản cứng" hoặc tải lên file ảnh/PDF hóa đơn, biên bản</p>
            </div>
            <button
              onClick={() => setShowDocModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Thêm Bộ Chứng Từ Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <div className="md:col-span-2 bg-white p-8 rounded-xl border text-center text-gray-500">
                Chưa có bộ hồ sơ chứng từ hậu cần nào.
              </div>
            ) : (
              documents.map(docRecord => {
                const att = docRecord.attachments || {};
                return (
                  <div key={docRecord.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{docRecord.title}</h4>
                        <p className="text-xs text-gray-500">
                          Kỳ/Đợt: <b>{docRecord.period || 'Chưa rõ'}</b> • Ngày tạo: {new Date(docRecord.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        {docRecord.note && <p className="text-xs text-gray-600 mt-1">{docRecord.note}</p>}
                      </div>
                      <button onClick={() => handleDeleteDocument(docRecord.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {LOGISTICS_DOC_TYPES.map(dtype => {
                        const urls: string[] = att[dtype.id] || [];
                        const isPresent = urls.length > 0;
                        const realFiles = urls.filter(u => u !== 'MANUAL_CHECK');
                        return (
                          <div
                            key={dtype.id}
                            className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1.5 ${
                              isPresent ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${isPresent ? 'text-green-900' : 'text-gray-500'}`}>
                                {isPresent ? '✓ ' : '○ '} {dtype.label}
                              </span>
                              {isPresent && realFiles.length === 0 && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                                  Đã có bản cứng
                                </span>
                              )}
                            </div>
                            {realFiles.length > 0 && (
                              <div className="flex flex-wrap gap-2 pl-4">
                                {realFiles.map((u, i) => {
                                  const fullUrl = u.startsWith('http') ? u : `${SERVER_URL}${u}`;
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => setPreviewUrl(fullUrl)}
                                      className="inline-flex items-center gap-1 bg-white border border-green-300 text-blue-600 px-2 py-1 rounded hover:underline"
                                    >
                                      <Eye size={12} /> Xem file {i + 1}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL 1: THÊM VẬT TƯ KHO ==================== */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800">Nhập kho Quân trang / Vật chất</h3>
            <form onSubmit={handleAddInventory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên vật tư / quân trang *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Quần áo DQTV, Mũ cứng, Giường xếp..."
                  value={invForm.itemName}
                  onChange={e => setInvForm({ ...invForm, itemName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phân loại</label>
                  <select
                    value={invForm.category}
                    onChange={e => setInvForm({ ...invForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tình trạng</label>
                  <select
                    value={invForm.condition}
                    onChange={e => setInvForm({ ...invForm, condition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="Tốt">Tốt (Mới)</option>
                    <option value="Đang dùng">Đang sử dụng</option>
                    <option value="Hư hỏng">Hư hỏng / Cần thanh lý</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={invForm.quantity}
                    onChange={e => setInvForm({ ...invForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    placeholder="Bộ, Cái, Đôi..."
                    value={invForm.unit}
                    onChange={e => setInvForm({ ...invForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={invForm.note}
                  onChange={e => setInvForm({ ...invForm, note: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowInvModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
                  Lưu vào kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: PHIẾU CẤP PHÁT ==================== */}
      {showDistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800">Tạo Phiếu Cấp phát Quân trang</h3>
            <form onSubmit={handleAddDistribution} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Họ tên người nhận *</label>
                <input
                  required
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={distForm.recipientName}
                  onChange={e => setDistForm({ ...distForm, recipientName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị / Khu phố / Đội</label>
                <input
                  type="text"
                  placeholder="VD: Dân quân thường trực / Đội 1 / Khu phố 3"
                  value={distForm.recipientUnit}
                  onChange={e => setDistForm({ ...distForm, recipientUnit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên quân trang / Vật tư cấp phát *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Quân phục thường dùng, Giày vải, Mũ..."
                  value={distForm.itemName}
                  onChange={e => setDistForm({ ...distForm, itemName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={distForm.quantity}
                    onChange={e => setDistForm({ ...distForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ngày cấp *</label>
                  <input
                    required
                    type="date"
                    value={distForm.issueDate}
                    onChange={e => setDistForm({ ...distForm, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowDistModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
                  Lưu phiếu cấp phát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 3: GHI SỔ THU / CHI / ĂN TRỰC ==================== */}
      {showFinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800">Ghi sổ Kinh phí & Chế độ ăn trực</h3>
            <form onSubmit={handleAddFinance} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Loại giao dịch</label>
                <select
                  value={finForm.type}
                  onChange={e => setFinForm({ ...finForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="CHI_AN">Chi tiền ăn trực (Chấm ăn)</option>
                  <option value="PHU_CAP">Chi phụ cấp ngày công trực</option>
                  <option value="KHAC">Chi mua sắm hậu cần khác</option>
                  <option value="THU">Nhận kinh phí cấp trên (Thu)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nội dung *</label>
                <input
                  required
                  type="text"
                  placeholder="VD: Tiền ăn ca trực tuần 1 tháng 10..."
                  value={finForm.title}
                  onChange={e => setFinForm({ ...finForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số tiền (VNĐ) *</label>
                  <input
                    required
                    type="number"
                    min={0}
                    placeholder="1500000"
                    value={finForm.amount}
                    onChange={e => setFinForm({ ...finForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ngày thực hiện *</label>
                  <input
                    required
                    type="date"
                    value={finForm.recordDate}
                    onChange={e => setFinForm({ ...finForm, recordDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Người phụ trách / Người nhận</label>
                <input
                  type="text"
                  placeholder="Tên cán bộ hậu cần / Bếp ăn"
                  value={finForm.personInCharge}
                  onChange={e => setFinForm({ ...finForm, personInCharge: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowFinModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
                  Lưu vào sổ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: THÊM BỘ CHỨNG TỪ HẬU CẦN ==================== */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-4 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Thêm Bộ Hồ Sơ & Chứng Từ Hậu Cần</h3>
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tên bộ hồ sơ / Đợt quyết toán *</label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Hồ sơ quyết toán hậu cần Quý 4/2026"
                    value={docForm.title}
                    onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kỳ / Tháng / Quý</label>
                  <input
                    type="text"
                    placeholder="VD: Tháng 10/2026"
                    value={docForm.period}
                    onChange={e => setDocForm({ ...docForm, period: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Danh mục chứng từ (Tích chọn nếu đã có bản cứng hoặc bấm Tải lên file ảnh/PDF)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {LOGISTICS_DOC_TYPES.map(doc => {
                    const files = docFiles[doc.id] || [];
                    const hasFiles = files.length > 0;
                    const isChecked = !!docChecked[doc.id] || hasFiles;
                    return (
                      <div
                        key={doc.id}
                        className={`p-3 border rounded-xl transition-all ${
                          isChecked ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="font-medium text-xs text-gray-800 flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={hasFiles}
                              onChange={() => setDocChecked(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                              className="w-4 h-4 rounded accent-green-600"
                            />
                            <span>{doc.label}</span>
                          </label>
                          <label className="cursor-pointer shrink-0">
                            <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-medium hover:bg-blue-200">
                              <Upload size={14} />
                              <span>Tải lên</span>
                            </div>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              accept=".pdf,.doc,.docx,image/*"
                              onChange={e => handleDocFileChange(doc.id, e)}
                            />
                          </label>
                        </div>
                        {isChecked && !hasFiles && (
                          <p className="text-[11px] text-green-700 mt-1 pl-6 font-medium">
                            ✓ Đã đánh dấu có chứng từ bản cứng
                          </p>
                        )}
                        {hasFiles && (
                          <div className="mt-2 space-y-1 pl-6">
                            {files.map((f, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white px-2 py-1 rounded border text-xs">
                                <span className="truncate flex items-center gap-1">
                                  <FileText size={12} className="text-blue-500 shrink-0" />
                                  {f.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={docSaving}
                  className="px-5 py-2 text-sm bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:opacity-60"
                >
                  {docSaving ? 'Đang lưu...' : 'Lưu Bộ Chứng Từ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
