const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const dir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const files = fs.readdirSync(dir);

files.forEach(f => {
  const full = path.join(dir, f);
  try {
    const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height,duration,codec_name,r_frame_rate', '-of', 'json', full], { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    const videoStream = parsed.streams.find(s => s.codec_name !== 'aac' && s.codec_name !== 'mp3') || parsed.streams[0];
    console.log(f, '=>', videoStream ? { codec: videoStream.codec_name, width: videoStream.width, height: videoStream.height, duration: videoStream.duration, fps: videoStream.r_frame_rate } : 'no stream');
  } catch(e) {
    console.log(f, 'error', e.message);
  }
});
