import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';
import path from 'path';

const files = [];
const scan = (dir) => {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) scan(fullPath);
    else if (item.name === 'page.tsx' || item.name === 'layout.tsx') files.push(fullPath);
  }
};
scan('app/[locale]/(dashboard)/[clinicSlug]');

const project = new Project();
files.forEach(f => project.addSourceFileAtPath(f));

let count = 0;
for (const sourceFile of project.getSourceFiles()) {
  const defaultExport = sourceFile.getDefaultExportSymbol()?.getDeclarations()[0];
  if (!defaultExport || !defaultExport.isKind(SyntaxKind.FunctionDeclaration)) continue;

  const func = defaultExport;
  const params = func.getParameters();
  if (params.length === 0) continue;

  const param = params.find(p => p.getName().includes('params'));
  if (!param) continue;

  const typeNode = param.getTypeNode();
  if (typeNode) {
    const typeText = typeNode.getText();
    if (typeText.includes('clinicId')) {
      param.setType(typeText.replace(/clinicId/g, 'clinicSlug'));
    }
  }

  let foundClinicId = false;
  const paramText = param.getFullText();
  if (paramText.includes('clinicId')) {
    param.replaceWithText(paramText.replace(/clinicId/g, 'clinicSlug'));
    foundClinicId = true;
  }

  if (foundClinicId) {
    const body = func.getBody();
    if (body && body.isKind(SyntaxKind.Block)) {
      body.insertStatements(0, 'const clinicId = await requireClinicId(clinicSlug);');
      
      let fileText = sourceFile.getFullText();
      fileText = fileText.replace(/<Sidebar[\s\S]*?clinicId=\{clinicId\}/g, match => match.replace('clinicId={clinicId}', 'clinicId={clinicSlug}'));
      fileText = fileText.replace(/<HeaderActions[\s\S]*?clinicId=\{clinicId\}/g, match => match.replace('clinicId={clinicId}', 'clinicId={clinicSlug}'));
      fileText = fileText.replace(/href=\{\`\/\$\{locale\}\/\$\{clinicId\}/g, 'href={`/${locale}/${clinicSlug}');
      
      sourceFile.replaceWithText(fileText);
      
      const importDecl = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '@/lib/utils/clinic');
      if (!importDecl) {
        sourceFile.addImportDeclaration({
          namedImports: ['requireClinicId'],
          moduleSpecifier: '@/lib/utils/clinic'
        });
      }
      count++;
    }
  }
}
project.saveSync();
console.log('Processed ' + count + ' files');
