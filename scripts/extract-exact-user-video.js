const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const videoPath = 'C:/Users/maxue/Downloads/video a ser utilizado/WhatsApp_Video_2026-08-14_at_111315_202608191733.mp4';
const outDir = path.join(__dirname, '../scratch_exact_video_frames');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Extract all frames from this exact video
execSync(`ffmpeg -y -i "${videoPath}" "${path.join(outDir, 'frame_%04d.jpg')}"`, { stdio: 'inherit' });
console.log('Extracted all frames from the exact video provided by the user!');
