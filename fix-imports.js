const fs = require('fs');
const path = require('path');

// Simple function to fix import order in files
function fixImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let result = [];
  let imports = [];
  let importSection = false;
  let hasClientDirective = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle client directive
    if (line.includes("'use client'") || line.includes('"use client"')) {
      result.push(line);
      hasClientDirective = true;
      continue;
    }
    
    // Skip empty lines after client directive
    if (hasClientDirective && line.trim() === '' && !importSection) {
      result.push(line);
      continue;
    }
    
    // Check if this is an import line
    if (line.trim().startsWith('import ')) {
      importSection = true;
      imports.push(line);
      continue;
    }
    
    // If we were in import section and hit non-import, sort and add imports
    if (importSection && !line.trim().startsWith('import ') && line.trim() !== '') {
      // Sort imports
      const reactImports = imports.filter(imp => imp.includes("from 'react'") || imp.includes('from "react"'));
      const nextImports = imports.filter(imp => (imp.includes("from 'next") || imp.includes('from "next')) && !reactImports.includes(imp));
      const lucideImports = imports.filter(imp => (imp.includes("from 'lucide-react'") || imp.includes('from "lucide-react"')) && !reactImports.includes(imp) && !nextImports.includes(imp));
      const componentImports = imports.filter(imp => 
        (imp.includes("'../../components") || imp.includes('"../../components') || 
         imp.includes("'../components") || imp.includes('"../components')) && 
        !reactImports.includes(imp) && !nextImports.includes(imp) && !lucideImports.includes(imp)
      );
      const libImports = imports.filter(imp => 
        (imp.includes("'../../lib") || imp.includes('"../../lib') ||
         imp.includes("'../lib") || imp.includes('"../lib')) &&
        !reactImports.includes(imp) && !nextImports.includes(imp) && !lucideImports.includes(imp) && !componentImports.includes(imp)
      );
      const typeImports = imports.filter(imp => 
        (imp.includes("'../../types") || imp.includes('"../../types') ||
         imp.includes("'../types") || imp.includes('"../types')) &&
        !reactImports.includes(imp) && !nextImports.includes(imp) && !lucideImports.includes(imp) && !componentImports.includes(imp) && !libImports.includes(imp)
      );
      const dataImports = imports.filter(imp => 
        (imp.includes("'../../data") || imp.includes('"../../data') ||
         imp.includes("'../data") || imp.includes('"../data')) &&
        !reactImports.includes(imp) && !nextImports.includes(imp) && !lucideImports.includes(imp) && !componentImports.includes(imp) && !libImports.includes(imp) && !typeImports.includes(imp)
      );
      const otherImports = imports.filter(imp => 
        !reactImports.includes(imp) && !nextImports.includes(imp) && !lucideImports.includes(imp) && 
        !componentImports.includes(imp) && !libImports.includes(imp) && !typeImports.includes(imp) && !dataImports.includes(imp)
      );
      
      // Add imports with proper spacing
      if (reactImports.length > 0) {
        result.push(...reactImports);
        result.push('');
      }
      if (nextImports.length > 0) {
        result.push(...nextImports);
        result.push('');
      }
      if (lucideImports.length > 0) {
        result.push(...lucideImports);
        result.push('');
      }
      if (componentImports.length > 0) {
        result.push(...componentImports.sort());
        result.push('');
      }
      if (dataImports.length > 0) {
        result.push(...dataImports.sort());
      }
      if (libImports.length > 0) {
        result.push(...libImports.sort());
      }
      if (typeImports.length > 0) {
        result.push(...typeImports.sort());
      }
      if (otherImports.length > 0) {
        result.push(...otherImports.sort());
      }
      
      importSection = false;
      imports = [];
    }
    
    // Add the current line
    result.push(line);
  }
  
  return result.join('\n');
}

// Fix a specific file
const filePath = process.argv[2];
if (filePath && fs.existsSync(filePath)) {
  const fixed = fixImports(filePath);
  fs.writeFileSync(filePath, fixed);
  console.log(`Fixed imports in ${filePath}`);
} else {
  console.log('Usage: node fix-imports.js <file-path>');
}