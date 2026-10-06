const fs = require('fs');
let list = fs.readFileSync('frontend/src/pages/MilitiaList.tsx', 'utf8');

list = list.replace(/if \(classification\) query\.append\('classification', classification\);/g, '');
list = list.replace(/}, \[search, classification\]\);/g, '}, [search, filterType, filterUnit]);');
list = list.replace(/const \[classification, setClassification\] = useState\(''\);/g, '');

fs.writeFileSync('frontend/src/pages/MilitiaList.tsx', list);
