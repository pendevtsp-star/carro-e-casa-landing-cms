const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const mediaDir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';

// Exact real photos
const facadePath = path.join(mediaDir, 'foto da frente da loja.jpeg');
const aislePath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.03 (1).jpeg');
const counterPath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.04 (2).jpeg');
const logoPath = path.join(mediaDir, 'ChatGPT Image 14 de ago. de 2026, 22_22_15.png');

const outDir = path.join(__dirname, '../public/video-frames');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targetW = 1600;
const targetH = 900;
const TOTAL_FRAMES = 300;

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Function to render a base frame from image path
async function getBaseRaw(imgPath, cropYRatio = 0.5, zoom = 1.0) {
  const meta = await sharp(imgPath).metadata();
  const w = meta.width;
  const h = meta.height;

  let cropW = Math.round(w / zoom);
  let cropH = Math.round(cropW * (targetH / targetW));

  if (cropH > h) {
    cropH = h;
    cropW = Math.round(cropH * (targetW / targetH));
  }
  if (cropW > w) {
    cropW = w;
    cropH = Math.round(cropW * (targetH / targetW));
  }

  const maxLeft = Math.max(0, w - cropW);
  const left = Math.round(maxLeft * 0.5);

  const maxTop = Math.max(0, h - cropH);
  const top = Math.min(maxTop, Math.max(0, Math.round(cropYRatio * maxTop)));

  return await sharp(imgPath)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(targetW, targetH, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function getLogoRaw(imgPath) {
  return await sharp(imgPath)
    .resize(targetW, targetH, { fit: 'cover', position: 'center', kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function buildCleanTour() {
  console.log('--- Generating Clean, Fluid 300 Frames with Node + Sharp ---');

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const paddedIndex = i.toString().padStart(3, '0');
    const destFile = path.join(outDir, `ezgif-frame-${paddedIndex}.jpg`);
    let finalRaw;

    if (i <= 60) {
      // Stage 1: Clean Facade Walk (Frame 1 is EXACTLY the photo with zoom 1.0)
      const prog = (i - 1) / 59;
      const t = smoothStep(prog);
      const zoom = lerp(1.0, 1.14, t);
      finalRaw = await getBaseRaw(facadePath, 0.35, zoom);
    } else if (i <= 110) {
      // Stage 2: Stepping Through Glass Door (50 frames progressive morph)
      const blendT = (i - 60) / 50;
      const a = smoothStep(blendT);
      const s1Zoom = lerp(1.10, 1.18, a);
      const s2Zoom = lerp(1.0, 1.06, a);

      const b1 = await getBaseRaw(facadePath, 0.35, s1Zoom);
      const b2 = await getBaseRaw(aislePath, 0.35, s2Zoom);

      const blended = Buffer.alloc(targetW * targetH * 4);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else if (i <= 170) {
      // Stage 3: Aisle Walking Past Shelves (Frames 111-170)
      const prog = (i - 110) / 60;
      const t = smoothStep(prog);
      const zoom = lerp(1.04, 1.16, t);
      finalRaw = await getBaseRaw(aislePath, 0.35, zoom);
    } else if (i <= 220) {
      // Stage 4: Approaching Wooden Counter (50 frames progressive morph)
      const blendT = (i - 170) / 50;
      const a = smoothStep(blendT);
      const s2Zoom = lerp(1.12, 1.18, a);
      const s3Zoom = lerp(1.0, 1.06, a);

      const b1 = await getBaseRaw(aislePath, 0.35, s2Zoom);
      const b2 = await getBaseRaw(counterPath, 0.32, s3Zoom);

      const blended = Buffer.alloc(targetW * targetH * 4);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else if (i <= 250) {
      // Stage 5: At Counter Viewing Logo & TV (Frames 221-250)
      const prog = (i - 220) / 30;
      const t = smoothStep(prog);
      const zoom = lerp(1.04, 1.12, t);
      finalRaw = await getBaseRaw(counterPath, 0.32, zoom);
    } else if (i <= 280) {
      // Stage 6: Smooth Logo Morph (30 frames progressive morph)
      const blendT = (i - 250) / 30;
      const a = smoothStep(blendT);
      const s3Zoom = lerp(1.08, 1.14, a);

      const b1 = await getBaseRaw(counterPath, 0.32, s3Zoom);
      const b2 = await getLogoRaw(logoPath);

      const blended = Buffer.alloc(targetW * targetH * 4);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else {
      // Stage 7: Full Brand Logo Hold (Frames 281-300)
      finalRaw = await getLogoRaw(logoPath);
    }

    // Save as pristine Full HD MozJPEG (quality 92)
    await sharp(finalRaw, {
      raw: {
        width: targetW,
        height: targetH,
        channels: 4,
      }
    })
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(destFile);

    if (i % 50 === 0 || i === TOTAL_FRAMES) {
      console.log(`Rendered frame ${i}/${TOTAL_FRAMES}`);
    }
  }

  console.log('--- Compiling Master 1080p MP4 Video ---');
  const videoOut = path.join(__dirname, '../public/videos/hero-tour-carro-e-casa.mp4');
  execSync(`ffmpeg -y -framerate 30 -i "${path.join(outDir, 'ezgif-frame-%03d.jpg')}" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p "${videoOut}"`, { stdio: 'inherit' });
  console.log('--- Completed successfully! ---');
}

buildCleanTour().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
