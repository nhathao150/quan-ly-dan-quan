const fs = require('fs');

let edit = fs.readFileSync('frontend/src/pages/MilitiaEdit.tsx', 'utf8');
edit = edit.replace(
  'fullName: result.fullName,',
  'fullName: result.fullName,\n            militiaType: result.militiaType || "",\n            militiaUnit: result.militiaUnit || "",'
);
fs.writeFileSync('frontend/src/pages/MilitiaEdit.tsx', edit);

let list = fs.readFileSync('frontend/src/pages/MilitiaList.tsx', 'utf8');
if (!list.includes('filterType}')) {
  // It didn't replace the search block. Let's find it properly.
  const searchBlock = `          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>`;
          
  const newSearchBlock = `<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>`;
        
  list = list.replace(searchBlock, newSearchBlock);
  fs.writeFileSync('frontend/src/pages/MilitiaList.tsx', list);
}

