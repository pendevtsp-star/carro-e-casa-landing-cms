const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const dir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const vid = path.join(dir, 'video entrada da loja.mp4');
const outDir = path.join(__dirname, '../scratch_frames/entrada_fine');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract every 0.25s (fps=4)
execSync(`ffmpeg -y -i "${vid}" -vf "fps=4" "${path.join(outDir, 'frame_%03d.jpg')}"`);
console.log('Done, extracted:', fs.readdirSync(outDir).length);
