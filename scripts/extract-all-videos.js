const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const outDir = path.join(__dirname, '../scratch_frames');

// Extract 1 frame per second for each video into subfolders
['video entrada da loja.mp4', 'video do interior da loja.mp4', 'WhatsApp Video 2026-08-14 at 11.13.15.mp4'].forEach((v, idx) => {
  const vSub = path.join(outDir, `v${idx}`);
  if (!fs.existsSync(vSub)) fs.mkdirSync(vSub, { recursive: true });
  const vidPath = path.join(dir, v);
  try {
    execFileSync('ffmpeg', ['-y', '-i', vidPath, '-vf', 'fps=1', path.join(vSub, 'frame_%03d.jpg')]);
    console.log(`Extracted v${idx}:`, fs.readdirSync(vSub).length, 'frames');
  } catch (e) {
    console.error(`Error v${idx}:`, e.message);
  }
});
