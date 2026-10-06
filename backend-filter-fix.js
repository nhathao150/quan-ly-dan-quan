const fs = require('fs');
let content = fs.readFileSync('backend/src/militia/militia.service.ts', 'utf8');

// The findAll method currently takes search and classification.
// Let's modify the controller and service to accept all queries.
let controller = fs.readFileSync('backend/src/militia/militia.controller.ts', 'utf8');
controller = controller.replace(
  "@Query('classification') classification?: any",
  "@Query('classification') classification?: any,\n    @Query('militiaType') militiaType?: string,\n    @Query('militiaUnit') militiaUnit?: string"
);
controller = controller.replace(
  "return this.militiaService.findAll(search, classification);",
  "return this.militiaService.findAll(search, classification, militiaType, militiaUnit);"
);
fs.writeFileSync('backend/src/militia/militia.controller.ts', controller);

content = content.replace(
  "findAll(search?: string, classification?: string) {",
  "findAll(search?: string, classification?: string, militiaType?: string, militiaUnit?: string) {"
);

content = content.replace(
  "const where: any = {};",
  `const where: any = {};
    if (militiaType) {
      where.militiaType = militiaType;
    }
    if (militiaUnit) {
      where.militiaUnit = militiaUnit;
    }`
);

fs.writeFileSync('backend/src/militia/militia.service.ts', content);
console.log("Fixed backend filters");
