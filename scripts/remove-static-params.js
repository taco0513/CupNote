#!/usr/bin/env node
const fs = require('fs');

const files = [
  'src/app/tasting-flow/[mode]/flavor-selection/page.tsx',
  'src/app/tasting-flow/[mode]/personal-notes/page.tsx', 
  'src/app/tasting-flow/[mode]/result/page.tsx',
  'src/app/tasting-flow/[mode]/coffee-info/page.tsx', 
  'src/app/tasting-flow/[mode]/sensory-mouthfeel/page.tsx',
  'src/app/tasting-flow/[mode]/brew-setup/page.tsx',
  'src/app/tasting-flow/[mode]/sensory-expression/page.tsx',
  'src/app/tasting-flow/[mode]/page.tsx'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('generateStaticParams')) {
      console.log(`Removing generateStaticParams from ${filePath}`);
      
      // Remove the generateStaticParams function and surrounding empty lines
      content = content.replace(/\n\/\/ Generate static paths for export\nexport function generateStaticParams\(\) \{\n  return \[\n    \{ mode: 'cafe' \},\n    \{ mode: 'homecafe' \}\n  \]\n\}\n/g, '');
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️ ${filePath} doesn't have generateStaticParams`);
    }
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('✅ All files processed');