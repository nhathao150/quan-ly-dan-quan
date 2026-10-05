const fs = require('fs');

// Fix api.ts
let apiTs = fs.readFileSync('frontend/src/api.ts', 'utf8');
apiTs = apiTs.replace("import { SERVER_URL, API_BASE_URL } from './config';", "");
fs.writeFileSync('frontend/src/api.ts', apiTs);

// Fix Login.tsx
let loginTsx = fs.readFileSync('frontend/src/pages/Login.tsx', 'utf8');
loginTsx = loginTsx.replace("import { SERVER_URL, API_BASE_URL } from '../config';", "");
fs.writeFileSync('frontend/src/pages/Login.tsx', loginTsx);

// Fix MilitiaDetail.tsx
let detailTsx = fs.readFileSync('frontend/src/pages/MilitiaDetail.tsx', 'utf8');
detailTsx = detailTsx.replace("const handleDownloadZip = () => {", "const handleDownloadZip = async () => {");
detailTsx = detailTsx.replace("Briefcase, ", "");
detailTsx = detailTsx.replace(".catch(error => alert", ".catch(() => alert");
fs.writeFileSync('frontend/src/pages/MilitiaDetail.tsx', detailTsx);

// Fix MilitiaForm.tsx
let formTsx = fs.readFileSync('frontend/src/pages/MilitiaForm.tsx', 'utf8');
formTsx = formTsx.replace("import { SERVER_URL, API_BASE_URL } from '../config';", "");
fs.writeFileSync('frontend/src/pages/MilitiaForm.tsx', formTsx);

// Fix MilitiaList.tsx
let listTsx = fs.readFileSync('frontend/src/pages/MilitiaList.tsx', 'utf8');
listTsx = listTsx.replace("import { SERVER_URL, API_BASE_URL } from '../config';", "import { API_BASE_URL } from '../config';");
listTsx = listTsx.replace("(docStatus.count / docStatus.total)", "(docStatus.count / (docStatus.total || 1))");
fs.writeFileSync('frontend/src/pages/MilitiaList.tsx', listTsx);

console.log("Fixed!");
