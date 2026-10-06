const fs = require('fs');

// Fix MilitiaList.tsx
let list = fs.readFileSync('frontend/src/pages/MilitiaList.tsx', 'utf8');

// Remove old classification dropdown
list = list.replace(/<div className="flex space-x-2">\s*<select\s*value={classification}\s*onChange={\(e\) => setClassification\(e.target.value\)}[\s\S]*?<\/select>\s*<\/div>/, '');

// Update Table headers
list = list.replace(
  '<th className="p-4 font-medium">Phân loại</th>',
  '<th className="p-4 font-medium">Loại & Đơn vị</th>'
);

// Update Table data
list = list.replace(
  /<td className="p-4">\s*<span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-medium">\s*\{item\.classification === 'NONG_COT' \? 'Nòng cốt' : item\.classification === 'CO_DONG' \? 'Cơ động' : 'Tại chỗ'\}\s*<\/span>\s*<\/td>/,
  `<td className="p-4">
    {item.militiaType ? (
      <div className="text-sm font-medium text-blue-700">{item.militiaType}</div>
    ) : (
      <span className="text-xs text-gray-400 italic">Chưa phân loại</span>
    )}
    {item.militiaUnit && (
      <div className="text-xs text-gray-500 mt-1">{item.militiaUnit}</div>
    )}
  </td>`
);

fs.writeFileSync('frontend/src/pages/MilitiaList.tsx', list);

// Fix MilitiaForm.tsx (Remove classification)
let form = fs.readFileSync('frontend/src/pages/MilitiaForm.tsx', 'utf8');
form = form.replace(/<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Phân loại<\/label>\s*<select name="classification" value={formData\.classification} onChange={handleChange}[\s\S]*?<\/select>\s*<\/div>/, '');
fs.writeFileSync('frontend/src/pages/MilitiaForm.tsx', form);

// Fix MilitiaEdit.tsx (Remove classification)
let edit = fs.readFileSync('frontend/src/pages/MilitiaEdit.tsx', 'utf8');
edit = edit.replace(/<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Phân loại<\/label>\s*<select name="classification" value={formData\.classification} onChange={handleChange}[\s\S]*?<\/select>\s*<\/div>/, '');
fs.writeFileSync('frontend/src/pages/MilitiaEdit.tsx', edit);

console.log('Removed legacy classification');
