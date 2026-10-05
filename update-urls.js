const fs = require('fs');
const path = require('path');

const configContent = `
export const SERVER_URL = \`http://\${window.location.hostname}:3000\`;
export const API_BASE_URL = \`\${SERVER_URL}/api\`;
`;
fs.writeFileSync('frontend/src/config.ts', configContent.trim() + '\n');

const files = [
  'frontend/src/pages/Login.tsx',
  'frontend/src/pages/MilitiaList.tsx',
  'frontend/src/pages/MilitiaEdit.tsx',
  'frontend/src/pages/MilitiaDetail.tsx',
  'frontend/src/pages/MilitiaForm.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('SERVER_URL')) {
    // Add import statement after the last import
    const importRegex = /import .* from .*\n/g;
    let match;
    let lastIndex = 0;
    while ((match = importRegex.exec(content)) !== null) {
      lastIndex = importRegex.lastIndex;
    }
    content = content.slice(0, lastIndex) + "import { SERVER_URL, API_BASE_URL } from '../config';\n" + content.slice(lastIndex);
  }

  // Replace fetch calls
  content = content.replace(/http:\/\/localhost:3000\/api/g, '${API_BASE_URL}');
  content = content.replace(/http:\/\/localhost:3000/g, '${SERVER_URL}');
  
  // Now fix cases where it became fetch('${API_BASE_URL}...') but it was in single quotes instead of backticks
  // Let's just use backticks where we replaced
  content = content.replace(/'\$\{API_BASE_URL\}(.*?)'/g, "`\\${API_BASE_URL}$1`");
  content = content.replace(/'\$\{SERVER_URL\}(.*?)'/g, "`\\${SERVER_URL}$1`");
  
  // also fix cases where it was already in backticks, and we replaced http://... with ${...}
  // That actually works naturally if it's already in backticks!
  
  fs.writeFileSync(file, content);
});
console.log('Done!');
