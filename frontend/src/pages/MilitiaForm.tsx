import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, CheckCircle, X, FileText, Eye } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { SERVER_URL, API_BASE_URL } from '../config';

const DOCUMENT_TYPES = [
  { id: 'donXin', label: 'Đơn xin tham gia DQTV' },
  { id: 'lyLich', label: 'Lý lịch DQTV nòng cốt' },
  { id: 'xacMinh', label: 'Phiếu xác minh' },
  { id: 'khamSucKhoe', label: 'Phiếu khám sức khỏe' },
  { id: 'quyetDinhDQTV', label: 'Quyết định nghĩa vụ DQTV' },
  { id: 'quyetDinhDangDoan', label: 'Quyết định kết nạp Đảng, Đoàn (nếu có)' },
  { id: 'quyetDinhBoNhiem', label: 'Quyết định điều động, bổ nhiệm' },
  { id: 'khac', label: 'Các loại giấy tờ khác' }
];

export default function MilitiaForm() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Record<string, File[]>>({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Nam',
    nationalId: '',
    dateOfBirth: '',
    address: '',
    classification: 'NONG_COT',
    joinedDate: '',
    status: 'ACTIVE'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.type.startsWith('image/')) {
            try {
              const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1920,
                useWebWorker: true
              };
              const compressedBlob = await imageCompression(file, options);
              // Đảm bảo là File object có tên
              return new File([compressedBlob], file.name, { type: file.type });
            } catch (err) {
              console.error('Lỗi nén ảnh:', err);
              return file;
            }
          }
          return file;
        })
      );

      setAttachments(prev => ({
        ...prev,
        [docId]: [...(prev[docId] || []), ...processedFiles]
      }));
    }
  };

  const removeFile = (docId: string, index: number) => {
    setAttachments(prev => {
      const newFiles = [...(prev[docId] || [])];
      newFiles.splice(index, 1);
      return { ...prev, [docId]: newFiles };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const uploadedUrls: Record<string, string[]> = {};

      for (const doc of DOCUMENT_TYPES) {
        if (attachments[doc.id] && attachments[doc.id].length > 0) {
          const formDataFiles = new FormData();
          attachments[doc.id].forEach(file => formDataFiles.append('files', file, file.name));
          
          const uploadRes = await fetch(`\${API_BASE_URL}/militia/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataFiles
          });
          
          if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(()=>({}));
            throw new Error(`Upload ${doc.label} thất bại: ${err.message || 'Unknown'}`);
          }
          uploadedUrls[doc.id] = await uploadRes.json();
        }
      }

      const res = await fetch(`\${API_BASE_URL}/militia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
          joinedDate: new Date(formData.joinedDate).toISOString(),
          attachments: uploadedUrls
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.message || 'Lỗi lưu database');
      }
      
      alert('Thêm hồ sơ thành công!');
      navigate('/ho-so');
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderPreviewContent = () => {
    if (!previewFile) return null;
    const url = URL.createObjectURL(previewFile);
    
    if (previewFile.type.startsWith('image/')) {
      return (
        <img 
          src={url} 
          alt="Bản xem trước" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()} 
        />
      );
    }
    
    if (previewFile.type === 'application/pdf') {
      return (
        <iframe 
          src={url} 
          className="w-full h-[85vh] rounded-lg shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    return (
      <div className="bg-white p-8 rounded-xl text-center" onClick={(e) => e.stopPropagation()}>
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-700">Định dạng file này không hỗ trợ xem trước trực tiếp.</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Lightbox Modal cho Preview */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewFile(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50 bg-black/50 rounded-full" onClick={() => setPreviewFile(null)}>
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl flex justify-center items-center h-full relative pt-10 pb-4">
            {renderPreviewContent()}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/ho-so')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Thêm Hồ sơ Mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Nguyễn Văn A" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số CCCD *</label>
              <input required name="nationalId" value={formData.nationalId} onChange={handleChange} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="001099..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh *</label>
              <input required name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhập ngũ *</label>
              <input required name="joinedDate" value={formData.joinedDate} onChange={handleChange} type="date" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nơi thường trú *</label>
              <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Địa chỉ chi tiết..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
              <select name="classification" value={formData.classification} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="NONG_COT">Dân quân Nòng cốt</option>
                <option value="CO_DONG">Dân quân Cơ động</option>
                <option value="TAI_CHO">Dân quân Tại chỗ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="ACTIVE">Đang tại ngũ</option>
                <option value="INACTIVE">Tạm hoãn</option>
                <option value="DISCHARGED">Đã xuất ngũ</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Hồ sơ & Giấy tờ (Scan / PDF / Ảnh)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_TYPES.map(doc => {
              const hasFiles = attachments[doc.id] && attachments[doc.id].length > 0;
              return (
                <div key={doc.id} className={`p-4 border rounded-xl transition-all ${hasFiles ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2 overflow-hidden">
                      <p className="font-medium text-sm text-gray-800 flex items-center gap-2">
                        {hasFiles && <CheckCircle className="text-green-600 shrink-0" size={18} />}
                        {doc.label}
                      </p>
                      {hasFiles && (
                        <div className="mt-3 space-y-2">
                          {attachments[doc.id].map((file, idx) => {
                            const isImage = file.type.startsWith('image/');
                            const isPdf = file.type === 'application/pdf';
                            const canPreview = isImage || isPdf;
                            
                            return (
                              <div key={idx} className="flex justify-between items-center bg-white px-2 py-2 border rounded shadow-sm">
                                <div className="flex items-center space-x-2 overflow-hidden flex-1">
                                  {isImage ? (
                                    <div 
                                      className="w-8 h-8 rounded border overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => setPreviewFile(file)}
                                      title="Nhấn để xem trước ảnh"
                                    >
                                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div 
                                      className={`w-8 h-8 rounded shrink-0 flex items-center justify-center ${canPreview ? 'bg-red-50 text-red-500 cursor-pointer hover:bg-red-100 transition-colors' : 'bg-gray-100 text-gray-400'}`}
                                      onClick={() => canPreview && setPreviewFile(file)}
                                      title={canPreview ? "Nhấn để xem trước PDF" : ""}
                                    >
                                      <FileText size={20} />
                                    </div>
                                  )}
                                  
                                  <span 
                                    className={`truncate text-xs font-medium ${canPreview ? 'text-blue-600 cursor-pointer hover:underline' : 'text-gray-700'}`} 
                                    title={file.name}
                                    onClick={() => canPreview && setPreviewFile(file)}
                                  >
                                    {file.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3 shrink-0 ml-2">
                                  {canPreview && (
                                    <button type="button" onClick={() => setPreviewFile(file)} className="text-blue-600 hover:text-blue-800" title="Xem trước">
                                      <Eye size={16} />
                                    </button>
                                  )}
                                  <button type="button" onClick={() => removeFile(doc.id, idx)} className="text-red-500 hover:text-red-700 font-medium text-xs">
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <label className="cursor-pointer shrink-0 mt-1">
                      <div className="flex items-center space-x-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                        <Upload size={16} />
                        <span className="hidden sm:inline">Tải lên</span>
                      </div>
                      <input 
                        type="file" 
                        multiple
                        className="hidden" 
                        accept=".pdf,.doc,.docx,image/*" 
                        capture="environment"
                        onChange={(e) => handleFileChange(doc.id, e)} 
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-70 font-bold shadow-lg">
            <Save size={20} />
            <span>{loading ? 'Đang tải lên và lưu...' : 'Lưu Toàn Bộ Hồ Sơ'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
