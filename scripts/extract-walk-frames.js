const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const videoPath = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa/WhatsApp Video 2026-08-14 at 11.13.15.mp4';
const outDir = path.join(__dirname, '../scratch_walk_frames');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract from 0 to 12 seconds
execSync(`ffmpeg -y -ss 0 -t 12 -i "${videoPath}" "${path.join(outDir, 'walk_%04d.jpg')}"`, { stdio: 'inherit' });
console.log('Extracted walk frames!');
