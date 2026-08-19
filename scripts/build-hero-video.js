const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const mediaDir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const entradaVid = path.join(mediaDir, 'video entrada da loja.mp4');
const extendedLogoImg = path.join(mediaDir, 'ChatGPT Image 14 de ago. de 2026, 22_22_15.png');
const outVideosDir = path.join(__dirname, '../public/videos');
const scratchDir = path.join(__dirname, '../scratch_video_build');

const targetWidth = 1920;
const targetHeight = 1080;
const fps = 30;

console.log('--- Step 1: Trim entrance video (0s to 7.8s) and scale to 1080p 30fps ---');
const trimmedEntrance = path.join(scratchDir, 'p1_entrance_main.mp4');
execSync(`ffmpeg -y -ss 0 -to 7.8 -i "${entradaVid}" -vf "scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},fps=${fps}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${trimmedEntrance}"`, { stdio: 'inherit' });

console.log('--- Step 2: Push-in / zoom onto counter logo (7.8s to 8.7s, 0.9s duration) ---');
const zoomClip = path.join(scratchDir, 'p2_zoom_counter.mp4');
// Zoom towards the yellow oval logo on the counter (centered slightly below middle)
execSync(`ffmpeg -y -ss 7.8 -to 8.7 -i "${entradaVid}" -vf "scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},fps=${fps},zoompan=z='min(zoom+0.035,1.75)':x='iw/2-(iw/zoom/2)':y='ih*0.62-(ih/zoom*0.62)':d=1:s=${targetWidth}x${targetHeight}:fps=${fps}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${zoomClip}"`, { stdio: 'inherit' });

console.log('--- Step 3: Combine p1 + p2 smoothly ---');
const entranceWithZoom = path.join(scratchDir, 'p1_p2_combined.mp4');
execSync(`ffmpeg -y -i "${trimmedEntrance}" -i "${zoomClip}" -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -preset slow -crf 18 "${entranceWithZoom}"`, { stdio: 'inherit' });

console.log('--- Step 4: Create extended logo holding clip (2.2 seconds) ---');
const logoClip = path.join(scratchDir, 'p3_logo.mp4');
execSync(`ffmpeg -y -loop 1 -i "${extendedLogoImg}" -t 2.2 -vf "scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},fps=${fps}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${logoClip}"`, { stdio: 'inherit' });

console.log('--- Step 5: Final Crossfade into extended logo ---');
const finalVideo = path.join(outVideosDir, 'hero-tour-carro-e-casa.mp4');
// Total entrance with zoom is 7.8 + 0.9 = 8.7s. Transition starts at 8.0s with duration 0.7s
execSync(`ffmpeg -y -i "${entranceWithZoom}" -i "${logoClip}" -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.7:offset=8.0,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset slow -crf 18 "${finalVideo}"`, { stdio: 'inherit' });

console.log('--- Step 6: Verify Final Video ---');
const probe = execSync(`ffprobe -v error -show_entries format=duration,size:stream=width,height,r_frame_rate -of json "${finalVideo}"`).toString();
console.log('Video Info:', probe);
