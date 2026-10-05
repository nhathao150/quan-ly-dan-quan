import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Shield, FileText, Download, Award, X, FolderOpen, Eye, FileArchive } from 'lucide-react';
import { SERVER_URL, API_BASE_URL } from '../config';

const DOCUMENT_LABELS: Record<string, string> = {
  donXin: 'Đơn xin tham gia DQTV',
  lyLich: 'Lý lịch DQTV nòng cốt',
  xacMinh: 'Phiếu xác minh',
  khamSucKhoe: 'Phiếu khám sức khỏe',
  quyetDinhDQTV: 'Quyết định nghĩa vụ DQTV',
  quyetDinhDangDoan: 'Quyết định kết nạp Đảng, Đoàn',
  quyetDinhBoNhiem: 'Quyết định điều động, bổ nhiệm',
  khac: 'Các loại giấy tờ khác'
};

export default function MilitiaDetail() {
  const { getToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileType, setPreviewFileType] = useState<'image' | 'pdf' | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/militia/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isPdf = (url: string) => /\.pdf$/i.test(url);

  const handlePreview = (url: string) => {
    if (isImage(url)) {
      setPreviewFileType('image');
      setPreviewFileUrl(url.startsWith('http') ? url : `${SERVER_URL}${url}`);
    } else if (isPdf(url)) {
      setPreviewFileType('pdf');
      setPreviewFileUrl(url.startsWith('http') ? url : `${SERVER_URL}${url}`);
    }
  };

  const handleDownloadZip = async () => {
    const token = await getToken();
    fetch(`${API_BASE_URL}/militia/${id}/download-zip`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      if (!response.ok) throw new Error('Download failed');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HoSo_${data.fullName.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(() => alert('Có lỗi xảy ra khi tải file ZIP!'));
  };

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Không tìm thấy hồ sơ!</div>;

  let attachmentsMap: Record<string, string[]> = {};
  if (Array.isArray(data.attachments)) {
    attachmentsMap['khac'] = data.attachments;
  } else if (data.attachments && typeof data.attachments === 'object') {
    attachmentsMap = data.attachments;
  }

  const hasAnyAttachments = Object.values(attachmentsMap).some(urls => urls.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Lightbox Modal cho Preview */}
      {previewFileUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => { setPreviewFileUrl(null); setPreviewFileType(null); }}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50 bg-black/50 rounded-full" onClick={() => { setPreviewFileUrl(null); setPreviewFileType(null); }}>
            <X size={32} />
          </button>
          <div className="w-full max-w-5xl flex justify-center items-center h-full relative pt-10 pb-4" onClick={(e) => e.stopPropagation()}>
            {previewFileType === 'image' && (
              <img 
                src={previewFileUrl} 
                alt="Phóng to" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl bg-white"
              />
            )}
            {previewFileType === 'pdf' && (
              <object 
                data={previewFileUrl} 
                type="application/pdf"
                className="w-full h-[85vh] rounded-lg shadow-2xl bg-white"
              >
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg p-8">
                  <p className="text-gray-700 mb-4">Trình duyệt không hỗ trợ xem trực tiếp PDF.</p>
                  <a href={previewFileUrl} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Tải xuống PDF</a>
                </div>
              </object>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/ho-so')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Chi tiết Hồ sơ</h1>
        </div>
        <div className="flex space-x-2">
          {hasAnyAttachments && (
            <button onClick={handleDownloadZip} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm">
              <FileArchive size={18} />
              <span className="hidden sm:inline">Tải toàn bộ (ZIP)</span>
            </button>
          )}
          <button onClick={() => navigate(`/ho-so/sua/${id}`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Chỉnh sửa hồ sơ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4 mb-6 pb-4 border-b">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-2xl">
                {data.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.fullName} ({data.gender || "Nam"})</h2>
                <p className="text-gray-500">CCCD: {data.nationalId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Ngày sinh</p>
                  <p className="font-medium">{formatDate(data.dateOfBirth)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-700">
                <Shield className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Ngày nhập ngũ</p>
                  <p className="font-medium">{formatDate(data.joinedDate)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-700 sm:col-span-2">
                <MapPin className="text-gray-400" size={20} />
                <div>
                  <p className="text-xs text-gray-500">Nơi thường trú</p>
                  <p className="font-medium">{data.address}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Award className="text-green-600"/> Lịch sử Huấn luyện</h3>
            </div>
            <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed rounded-lg">
                Chưa có lịch sử huấn luyện
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Phân loại & Trạng thái</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Loại Dân quân</p>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                  {data.classification === 'NONG_COT' ? 'Nòng cốt' : data.classification === 'CO_DONG' ? 'Cơ động' : 'Tại chỗ'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái hiện tại</p>
                <span className={`px-3 py-1 rounded text-sm font-medium ${data.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {data.status === 'ACTIVE' ? 'Đang tại ngũ' : data.status === 'INACTIVE' ? 'Tạm hoãn' : 'Đã xuất ngũ'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <FolderOpen size={20} className="text-yellow-600" />
              Tài liệu đính kèm
            </h3>
            
            {hasAnyAttachments ? (
              <div className="space-y-4">
                {Object.entries(attachmentsMap).map(([catKey, urls]) => {
                  if (!urls || urls.length === 0) return null;
                  return (
                    <div key={catKey} className="space-y-2">
                      <p className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded">
                        {DOCUMENT_LABELS[catKey] || 'Tài liệu khác'}
                      </p>
                      <ul className="space-y-2 pl-2">
                        {urls.map((url: string, idx: number) => {
                          const fileName = url.split('/').pop() || `Tai_lieu_${idx+1}`;
                          const imageFlag = isImage(url);
                          const pdfFlag = isPdf(url);
                          const canPreview = imageFlag || pdfFlag;
                          
                          return (
                            <li key={idx} className="flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200">
                              {imageFlag && (
                                <div 
                                  className="w-full h-24 bg-gray-200 cursor-pointer group relative overflow-hidden"
                                  onClick={() => handlePreview(url)}
                                >
                                  <img src={url.startsWith('http') ? url : `${SERVER_URL}${url}`} alt="thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">Phóng to</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-2 overflow-hidden">
                                  <FileText className={`${imageFlag ? 'text-blue-500' : 'text-green-600'} flex-shrink-0`} size={16} />
                                  <span 
                                    className={`text-xs truncate ${canPreview ? 'text-blue-600 cursor-pointer hover:underline font-medium' : 'text-gray-700'}`} 
                                    title={fileName}
                                    onClick={() => canPreview && handlePreview(url)}
                                  >
                                    {fileName}
                                  </span>
                                </div>
                                <div className="flex space-x-1 shrink-0 ml-1">
                                  {canPreview && (
                                    <button onClick={() => handlePreview(url)} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded shadow-sm" title="Xem trước">
                                      <Eye size={14} />
                                    </button>
                                  )}
                                  <a href={url.startsWith('http') ? url : `${SERVER_URL}${url}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-green-600 p-1 bg-gray-50 rounded shadow-sm" title="Tải xuống">
                                    <Download size={14} />
                                  </a>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Chưa có giấy tờ nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
