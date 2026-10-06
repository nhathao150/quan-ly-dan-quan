const fs = require('fs');

const mappings = `
export const TYPE_OPTIONS = [
  'Dân quân thường trực',
  'Dân quân cơ động',
  'Dân quân tại chỗ',
  'Dân quân binh chủng'
];

export const UNIT_MAPPING: Record<string, string[]> = {
  'Dân quân thường trực': [],
  'Dân quân cơ động': ['Đội 1', 'Đội 2', 'Đội 3'],
  'Dân quân tại chỗ': [
    'Khu phố 1', 'Khu phố 2', 'Khu phố 3', 'Khu phố 4', 'Khu phố 5',
    'Khu phố 8', 'Khu phố 9', 'Khu phố 10', 'Khu phố 11', 'Khu phố 12', 'Khu phố 13', 'Khu phố 14',
    'Khu phố 15', 'Khu phố 16', 'Khu phố 17', 'Khu phố 18', 'Khu phố 19', 'Khu phố 20', 'Khu phố 21', 'Khu phố 22'
  ],
  'Dân quân binh chủng': [
    'Thông tin hữu tuyến điện (DQ TTHTĐ)',
    'Thông tin vô tuyến điện (DQ TTVTĐ)',
    'Thông tin vô tuyến (DQ TTVĐ)',
    'Cối 60MM',
    'Cối 82MM',
    'Công binh (DQCB)',
    'Hóa học (DQHH)',
    'Trinh sát (DQTS)',
    'Y tế (DQYT)',
    'Phòng không (DQPH)'
  ]
};
`;

let config = fs.readFileSync('frontend/src/config.ts', 'utf8');
if (!config.includes('TYPE_OPTIONS')) {
  fs.writeFileSync('frontend/src/config.ts', config + '\n' + mappings);
}

function removeConstants(content) {
  let start = content.indexOf('const TYPE_OPTIONS = [');
  if (start > -1) {
    let end = content.indexOf('};', content.indexOf('const UNIT_MAPPING')) + 2;
    content = content.slice(0, start) + content.slice(end);
  }
  return content;
}

['MilitiaForm.tsx', 'MilitiaEdit.tsx', 'MilitiaList.tsx'].forEach(file => {
  let content = fs.readFileSync('frontend/src/pages/' + file, 'utf8');
  content = removeConstants(content);
  // add imports
  content = content.replace("import { API_BASE_URL } from '../config';", "import { API_BASE_URL, TYPE_OPTIONS, UNIT_MAPPING } from '../config';");
  
  if (file === 'MilitiaForm.tsx' || file === 'MilitiaEdit.tsx') {
    if (!content.includes('Loại dân quân')) {
      // Find the grid container for inputs
      let gridPattern = /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/;
      
      const newFields = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại dân quân</label>
              <select
                value={formData.militiaType || ''}
                onChange={(e) => setFormData({ ...formData, militiaType: e.target.value, militiaUnit: '' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Chọn loại --</option>
                {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {formData.militiaType && UNIT_MAPPING[formData.militiaType]?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị / Chuyên môn</label>
                <select
                  value={formData.militiaUnit || ''}
                  onChange={(e) => setFormData({ ...formData, militiaUnit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {UNIT_MAPPING[formData.militiaType].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            )}`;
            
      content = content.replace(gridPattern, newFields);
    }
  }
  
  if (file === 'MilitiaEdit.tsx') {
    content = content.replace(
      /fullName: result.fullName,\n\s*gender: result.gender,/,
      `fullName: result.fullName,\n            gender: result.gender,\n            militiaType: result.militiaType || '',\n            militiaUnit: result.militiaUnit || '',`
    );
  }
  
  fs.writeFileSync('frontend/src/pages/' + file, content);
});

console.log("Fixed!");
