// Simple script to generate placeholder icons
// In production, use proper icon generation tools like pwa-asset-generator

const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// SVG template for coffee cup icon
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FFF8F3" rx="${size * 0.1}"/>
  <g transform="translate(${size * 0.15}, ${size * 0.2})">
    <path d="M${size * 0.1} ${size * 0.15}
             L${size * 0.1} ${size * 0.5}
             Q${size * 0.1} ${size * 0.6} ${size * 0.2} ${size * 0.6}
             L${size * 0.5} ${size * 0.6}
             Q${size * 0.6} ${size * 0.6} ${size * 0.6} ${size * 0.5}
             L${size * 0.6} ${size * 0.15}
             Z
             M${size * 0.6} ${size * 0.25}
             Q${size * 0.7} ${size * 0.25} ${size * 0.7} ${size * 0.35}
             Q${size * 0.7} ${size * 0.45} ${size * 0.6} ${size * 0.45}"
          fill="#6F4E37" stroke="none"/>
    <path d="M${size * 0.2} ${size * 0.05}
             Q${size * 0.3} ${size * 0} ${size * 0.35} ${size * 0.05}
             M${size * 0.35} ${size * 0.05}
             Q${size * 0.4} ${size * 0} ${size * 0.5} ${size * 0.05}"
          fill="none" stroke="#6F4E37" stroke-width="${size * 0.02}"/>
  </g>
  <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.15}" font-weight="bold" text-anchor="middle" fill="#6F4E37">CupNote</text>
</svg>
`;

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate icons
sizes.forEach(size => {
  const svg = svgTemplate(size);
  const filename = path.join(iconDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
});

// Also create a basic favicon
const faviconSvg = svgTemplate(32);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSvg);
console.log('Generated favicon.svg');

console.log('\nNote: These are placeholder icons. For production, convert SVG to PNG and optimize.');
console.log('You can use tools like:');
console.log('- sharp or jimp for Node.js');
console.log('- pwa-asset-generator for comprehensive PWA assets');
console.log('- real-favicon-generator.net for web-based generation');