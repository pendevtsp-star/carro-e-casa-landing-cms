const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const vid = path.join(__dirname, '../public/videos/hero-tour-carro-e-casa.mp4');
const outDir = path.join(__dirname, '../scratch_video_build/preview_samples');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract frames at 0s, 2s, 4s, 6s, 7.5s, 8.0s, 8.3s, 8.6s, 9.5s
const timestamps = [0, 2, 4, 6, 7.5, 8.0, 8.3, 8.6, 9.5];
timestamps.forEach((t, i) => {
  const outPath = path.join(outDir, `sample_${i}_${t}s.jpg`);
  execFileSync('ffmpeg', ['-y', '-ss', String(t), '-i', vid, '-vframes', '1', '-q:v', '2', outPath]);
});

console.log('Sample extraction complete!');
