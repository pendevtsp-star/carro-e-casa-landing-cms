const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const videoPath = path.join(__dirname, '../public/videos/hero-tour-carro-e-casa.mp4');
const framesOutputDir = path.join(__dirname, '../public/video-frames');
const tempFramesDir = path.join(__dirname, '../scratch_raw_frames');

if (!fs.existsSync(framesOutputDir)) fs.mkdirSync(framesOutputDir, { recursive: true });
if (!fs.existsSync(tempFramesDir)) fs.mkdirSync(tempFramesDir, { recursive: true });

// Clear temp frames dir
fs.readdirSync(tempFramesDir).forEach(f => fs.unlinkSync(path.join(tempFramesDir, f)));

console.log('--- Step 1: Extracting raw frames from video ---');
// Extract all 306 frames at original 30fps
execSync(`ffmpeg -y -i "${videoPath}" -q:v 2 "${path.join(tempFramesDir, 'raw_%04d.jpg')}"`, { stdio: 'inherit' });

const rawFiles = fs.readdirSync(tempFramesDir).filter(f => f.endsWith('.jpg')).sort();
console.log(`Extracted ${rawFiles.length} raw frames.`);

console.log('--- Step 2: Sampling and optimizing exactly 300 frames ---');
const TOTAL_FRAMES = 300;

async function processFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    // Linear mapping from 0..(TOTAL_FRAMES-1) to 0..(rawFiles.length - 1)
    const rawIdx = Math.min(Math.round((i / (TOTAL_FRAMES - 1)) * (rawFiles.length - 1)), rawFiles.length - 1);
    const srcFile = path.join(tempFramesDir, rawFiles[rawIdx]);
    
    const paddedIndex = (i + 1).toString().padStart(3, '0');
    const destFile = path.join(framesOutputDir, `ezgif-frame-${paddedIndex}.jpg`);
    
    // Resize to 1280x720 (crisp 720p HD, super lightweight for instant 60fps canvas scroll)
    await sharp(srcFile)
      .resize(1280, 720, { fit: 'cover' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(destFile);

    if ((i + 1) % 50 === 0 || i === TOTAL_FRAMES - 1) {
      console.log(`Processed frame ${i + 1}/${TOTAL_FRAMES}`);
    }
  }
  console.log('--- Frame generation complete! ---');
  
  // Calculate total folder size
  const allFrames = fs.readdirSync(framesOutputDir).filter(f => f.startsWith('ezgif-frame-') && f.endsWith('.jpg'));
  let totalBytes = 0;
  allFrames.forEach(f => {
    totalBytes += fs.statSync(path.join(framesOutputDir, f)).size;
  });
  console.log(`Total frames: ${allFrames.length}, Total size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB (avg ${(totalBytes / allFrames.length / 1024).toFixed(1)} KB/frame)`);
}

processFrames().catch(err => {
  console.error('Error generating frames:', err);
  process.exit(1);
});
