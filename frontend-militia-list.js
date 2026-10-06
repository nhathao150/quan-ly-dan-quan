const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/MilitiaList.tsx', 'utf8');

const MILITIA_MAPPING = `
const TYPE_OPTIONS = [
  'Dân quân thường trực',
  'Dân quân cơ động',
  'Dân quân tại chỗ',
  'Dân quân binh chủng'
];

const UNIT_MAPPING: Record<string, string[]> = {
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

const importEnd = content.indexOf('\n\n', content.indexOf('import'));
content = content.slice(0, importEnd) + '\n' + MILITIA_MAPPING + content.slice(importEnd);

// Add states for filtering
content = content.replace("const [search, setSearch] = useState('');", "const [search, setSearch] = useState('');\n  const [filterType, setFilterType] = useState('');\n  const [filterUnit, setFilterUnit] = useState('');");

// Update API call query
content = content.replace(
  "const response = await fetchWithAuth(`${API_BASE_URL}/militia?search=${search}`, getToken);", 
  "const queryParams = new URLSearchParams();\n      if (search) queryParams.append('search', search);\n      if (filterType) queryParams.append('militiaType', filterType);\n      if (filterUnit) queryParams.append('militiaUnit', filterUnit);\n      \n      const response = await fetchWithAuth(`${API_BASE_URL}/militia?${queryParams.toString()}`, getToken);"
);

// Add filterType and filterUnit to dependencies of useEffect
content = content.replace("}, [search]);", "}, [search, filterType, filterUnit]);");

// Add select dropdowns in the UI next to search
const searchSection = `<div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc CCCD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
            />
          </div>`;

const newSearchSection = `<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
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

content = content.replace(searchSection, newSearchSection);

// Add columns to table
content = content.replace("<th>Ngày sinh</th>", "<th>Loại / Đơn vị</th>\n                <th>Ngày sinh</th>");
content = content.replace("<td>{formatDate(record.dateOfBirth)}</td>", "<td>\n                    {record.militiaType && <div className=\"font-medium text-blue-700\">{record.militiaType}</div>}\n                    {record.militiaUnit && <div className=\"text-sm text-gray-500\">{record.militiaUnit}</div>}\n                  </td>\n                  <td>{formatDate(record.dateOfBirth)}</td>");

fs.writeFileSync('frontend/src/pages/MilitiaList.tsx', content);
console.log("Updated MilitiaList.tsx");
