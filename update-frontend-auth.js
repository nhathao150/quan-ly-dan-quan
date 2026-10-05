const fs = require('fs');

const files = [
  'frontend/src/pages/MilitiaList.tsx',
  'frontend/src/pages/MilitiaEdit.tsx',
  'frontend/src/pages/MilitiaDetail.tsx',
  'frontend/src/pages/MilitiaForm.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('useAuth')) {
    content = "import { useAuth } from '@clerk/clerk-react';\n" + content;
  }
  
  // Replace localStorage.getItem('token') with getToken()
  // We need to inject `const { getToken } = useAuth();` at the top of the component
  
  content = content.replace(/export default function (\w+)\(\) \{/, 'export default function $1() {\n  const { getToken } = useAuth();');
  
  // We need to make sure getToken is awaited
  content = content.replace(/const token = localStorage.getItem\('token'\);/g, 'const token = await getToken();');

  fs.writeFileSync(file, content);
});
console.log('Frontend auth updated!');
