const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const outDir = path.join(__dirname, '../scratch_frames');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract 5 sample frames from each video
const videos = ['video entrada da loja.mp4', 'video do interior da loja.mp4', 'WhatsApp Video 2026-08-14 at 11.13.15.mp4'];
videos.forEach((vid, vi) => {
  const vidPath = path.join(dir, vid);
  for (let i = 1; i <= 5; i++) {
    const time = i * 2;
    try {
      execFileSync('ffmpeg', ['-y', '-ss', String(time), '-i', vidPath, '-vframes', '1', path.join(outDir, `vid_${vi}_frame_${i}.jpg`)]);
    } catch (e) {}
  }
});
console.log('Done extracting sample frames');
