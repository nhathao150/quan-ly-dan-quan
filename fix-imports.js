const fs = require('fs');

['MilitiaForm.tsx', 'MilitiaEdit.tsx'].forEach(file => {
  let content = fs.readFileSync('frontend/src/pages/' + file, 'utf8');
  content = content.replace(
    "import { API_BASE_URL } from '../config';",
    "import { API_BASE_URL, TYPE_OPTIONS, UNIT_MAPPING } from '../config';"
  );
  fs.writeFileSync('frontend/src/pages/' + file, content);
});

