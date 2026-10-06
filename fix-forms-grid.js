const fs = require('fs');

function injectFields(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Let's just find the status field and insert before it
  const statusField = `            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>`;
              
  const newFields = `
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
            )}
            
`;
  if (!content.includes('Loại dân quân')) {
    content = content.replace(statusField, newFields + statusField);
    fs.writeFileSync(filePath, content);
  }
}

injectFields('frontend/src/pages/MilitiaForm.tsx');
injectFields('frontend/src/pages/MilitiaEdit.tsx');

