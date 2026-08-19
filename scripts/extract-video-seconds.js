const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const videoPath = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa/WhatsApp Video 2026-08-14 at 11.13.15.mp4';
const outDir = path.join(__dirname, '../scratch_video_analysis');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract 1 frame per second
execSync(`ffmpeg -y -i "${videoPath}" -vf "fps=1" "${path.join(outDir, 'sec_%02d.jpg')}"`, { stdio: 'inherit' });
console.log('Extracted 1 frame per second from source video!');
