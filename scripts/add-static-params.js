#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const staticParamsCode = `
// Generate static paths for export
export function generateStaticParams() {
  return [
    { mode: 'cafe' },
    { mode: 'homecafe' }
  ]
}`;

const files = [
  'src/app/tasting-flow/[mode]/result/page.tsx',
  'src/app/tasting-flow/[mode]/coffee-info/page.tsx', 
  'src/app/tasting-flow/[mode]/sensory-mouthfeel/page.tsx',
  'src/app/tasting-flow/[mode]/brew-setup/page.tsx',
  'src/app/tasting-flow/[mode]/sensory-expression/page.tsx',
  'src/app/tasting-flow/[mode]/page.tsx'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('generateStaticParams')) {
      console.log(`Adding generateStaticParams to ${filePath}`);
      
      // Insert after 'use client' line
      const lines = content.split('\n');
      const insertIndex = lines.findIndex(line => line.includes("'use client'")) + 1;
      
      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, staticParamsCode);
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`✅ Updated ${filePath}`);
      } else {
        console.log(`⚠️ Could not find 'use client' in ${filePath}`);
      }
    } else {
      console.log(`⏭️ ${filePath} already has generateStaticParams`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('✅ All files processed');