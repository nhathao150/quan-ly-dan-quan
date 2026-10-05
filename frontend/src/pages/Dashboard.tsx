import { Users, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: 'Tổng số dân quân', value: '145', icon: <Users size={24} className="text-blue-600" />, bg: 'bg-blue-100' },
    { title: 'Dân quân nòng cốt', value: '80', icon: <ShieldCheck size={24} className="text-green-600" />, bg: 'bg-green-100' },
    { title: 'Sắp hết nghĩa vụ', value: '12', icon: <AlertTriangle size={24} className="text-orange-600" />, bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm text-gray-800">Cán bộ <b>Admin</b> đã thêm hồ sơ: Nguyễn Văn A</p>
                  <p className="text-xs text-gray-500">10 phút trước</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Lịch huấn luyện sắp tới</h2>
          <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            Chưa có lịch huấn luyện nào trong tháng này.
          </div>
        </div>
      </div>
    </div>
  );
}
