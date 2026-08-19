const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceVideoPath = 'C:/Users/maxue/Downloads/video a ser utilizado/WhatsApp_Video_2026-08-14_at_111315_202608191733.mp4';
const projectPublicDir = path.join(__dirname, '../public');
const destVideoDir = path.join(projectPublicDir, 'videos');
const destFramesDir = path.join(projectPublicDir, 'video-frames');

if (!fs.existsSync(destVideoDir)) fs.mkdirSync(destVideoDir, { recursive: true });
if (!fs.existsSync(destFramesDir)) fs.mkdirSync(destFramesDir, { recursive: true });

// 1. Copy exact video file to public/videos/hero-tour-carro-e-casa.mp4
const destVideoPath = path.join(destVideoDir, 'hero-tour-carro-e-casa.mp4');
fs.copyFileSync(sourceVideoPath, destVideoPath);
console.log('1. Exact video copied to:', destVideoPath);

// 2. Clean existing frames
const existingFiles = fs.readdirSync(destFramesDir);
for (const file of existingFiles) {
  if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
    fs.unlinkSync(path.join(destFramesDir, file));
  }
}
console.log('2. Cleaned previous frames directory.');

// 3. Extract exact frames from the video with highest quality (qscale:v 2)
execSync(`ffmpeg -y -i "${sourceVideoPath}" -q:v 2 "${path.join(destFramesDir, 'ezgif-frame-%03d.jpg')}"`, { stdio: 'inherit' });

const extractedFrames = fs.readdirSync(destFramesDir).filter(f => f.startsWith('ezgif-frame-') && f.endsWith('.jpg'));
console.log(`3. Extracted ${extractedFrames.length} exact frames from user video.`);
