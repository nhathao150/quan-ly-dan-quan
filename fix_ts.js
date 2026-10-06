const fs = require('fs');

// Fix MilitiaForm
let form = fs.readFileSync('frontend/src/pages/MilitiaForm.tsx', 'utf8');
if (!form.includes('Loại dân quân')) {
  form = form.replace(/<h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Thông tin cơ bản<\/h3>\s+<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/, 
  `<h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              )}`);
  fs.writeFileSync('frontend/src/pages/MilitiaForm.tsx', form);
}

// Fix MilitiaEdit
let edit = fs.readFileSync('frontend/src/pages/MilitiaEdit.tsx', 'utf8');
if (!edit.includes('Loại dân quân')) {
  edit = edit.replace(/<h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Thông tin cơ bản<\/h3>\s+<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/, 
  `<h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              )}`);
}
// Fix missing state variables
edit = edit.replace(
  /fullName: result.fullName,\n\s*gender: result.gender,/,
  `fullName: result.fullName,\n            gender: result.gender,\n            militiaType: result.militiaType || '',\n            militiaUnit: result.militiaUnit || '',`
);
fs.writeFileSync('frontend/src/pages/MilitiaEdit.tsx', edit);


// Fix MilitiaList
let list = fs.readFileSync('frontend/src/pages/MilitiaList.tsx', 'utf8');
if (!list.includes('filterType}')) {
  list = list.replace(/<div className="flex-1 relative">\s+<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 text-gray-400" size={20} \/>\s+<input\s+type="text"\s+placeholder="Tìm kiếm theo tên hoặc CCCD..."\s+value={search}\s+onChange={\(e\) => setSearch\(e.target.value\)}\s+className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"\s+\/>\s+<\/div>/,
  `<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setFilterUnit(''); }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
            >
              <option value="">-- Tất cả các loại --</option>
              {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
              disabled={!filterType || !UNIT_MAPPING[filterType]?.length}
            >
              <option value="">-- Tất cả đơn vị --</option>
              {filterType && UNIT_MAPPING[filterType]?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>`);
  fs.writeFileSync('frontend/src/pages/MilitiaList.tsx', list);
}

console.log("Fixed all typescript errors");
