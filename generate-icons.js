// Script to generate PWA icons using Canvas (run with Node.js)
// Usage: node generate-icons.js
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#001F3F');
  bg.addColorStop(1, '#000613');
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Rupee symbol
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.28;
  ctx.font = `bold ${r * 1.4}px serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', cx, cy + r * 0.05);

  // Emerald dot accent
  ctx.fillStyle = '#66dd8b';
  ctx.beginPath();
  ctx.arc(size * 0.72, size * 0.28, size * 0.055, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer('image/png');
}

const dir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

try {
  fs.writeFileSync(path.join(dir, 'icon-192.png'), generateIcon(192));
  fs.writeFileSync(path.join(dir, 'icon-512.png'), generateIcon(512));
  console.log('Icons generated successfully!');
} catch (e) {
  console.log('canvas module not available — using fallback SVG icons instead');
}
