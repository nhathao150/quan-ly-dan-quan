const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/MilitiaDetail.tsx', 'utf8');

const injection = `
            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Phân loại Dân quân</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-blue-700">Loại Dân quân</div>
                  <div className="font-medium text-blue-900">{record.militiaType || 'Chưa cập nhật'}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-700">Đơn vị / Binh chủng</div>
                  <div className="font-medium text-blue-900">{record.militiaUnit || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>
`;

content = content.replace(
  '<div className="bg-gray-50 rounded-2xl p-6 mb-8">',
  '<div className="bg-gray-50 rounded-2xl p-6 mb-8">\n' + injection
);

fs.writeFileSync('frontend/src/pages/MilitiaDetail.tsx', content);
console.log("Updated detail page");
