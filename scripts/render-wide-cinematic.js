const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const mediaDir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';
const facadePath = path.join(mediaDir, 'foto da frente da loja.jpeg');
const aislePath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.03 (1).jpeg');
const counterPath = path.join(mediaDir, 'WhatsApp Image 2026-08-13 at 13.48.04 (2).jpeg');
const logoPath = path.join(mediaDir, 'ChatGPT Image 14 de ago. de 2026, 22_22_15.png');

const outDir = path.join(__dirname, '../public/video-frames');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const targetW = 1600;
const targetH = 900;
const TOTAL_FRAMES = 300;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Function to render a wide frame with controlled subtle zoom/pan
async function renderWideFrame(imgMeta, imgPath, cropTopBase, zoomStart, zoomEnd, progress) {
  const t = smoothStep(progress);
  const zoom = lerp(zoomStart, zoomEnd, t);

  // Keep width as wide as possible
  const cropW = Math.round(imgMeta.width / zoom);
  const cropH = Math.round(cropW * (targetH / targetW));

  const maxLeft = imgMeta.width - cropW;
  const left = Math.round(maxLeft * 0.5); // centered horizontally

  const maxTop = imgMeta.height - cropH;
  const top = Math.min(maxTop, Math.max(0, Math.round(cropTopBase + (t * 20))));

  return await sharp(imgPath)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(targetW, targetH, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function renderLogoFrame(logoMeta, logoPath) {
  return await sharp(logoPath)
    .resize(targetW, targetH, { fit: 'cover', position: 'center' })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function generateAllFrames() {
  console.log('--- Loading Source Images ---');
  const facadeMeta = await sharp(facadePath).metadata();
  const aisleMeta = await sharp(aislePath).metadata();
  const counterMeta = await sharp(counterPath).metadata();
  const logoMeta = await sharp(logoPath).metadata();

  console.log('--- Generating 300 Ultra-Smooth Wide First-Person Frames ---');

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const paddedIndex = i.toString().padStart(3, '0');
    const destFile = path.join(outDir, `ezgif-frame-${paddedIndex}.jpg`);

    let finalRawBuffer;

    if (i <= 60) {
      // Phase 1: Pure Wide Facade (Frames 1 - 60)
      const prog = (i - 1) / 59;
      finalRawBuffer = await renderWideFrame(
        facadeMeta, facadePath,
        120, // top offset
        1.0, 1.12, // subtle zoom
        prog
      );
    } else if (i <= 110) {
      // Transition 1: Facade -> Aisle (Frames 61 - 110: 50 frames long dissolve)
      const blendT = (i - 60) / 50;
      const s1Prog = lerp(0.8, 1.0, blendT);
      const s2Prog = lerp(0.0, 0.25, blendT);

      const buf1 = await renderWideFrame(facadeMeta, facadePath, 120, 1.0, 1.15, s1Prog);
      const buf2 = await renderWideFrame(aisleMeta, aislePath, 380, 1.0, 1.16, s2Prog);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const alpha = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(buf1[j] * (1 - alpha) + buf2[j] * alpha);
        blended[j + 1] = Math.round(buf1[j + 1] * (1 - alpha) + buf2[j + 1] * alpha);
        blended[j + 2] = Math.round(buf1[j + 2] * (1 - alpha) + buf2[j + 2] * alpha);
        blended[j + 3] = 255;
      }
      finalRawBuffer = blended;
    } else if (i <= 165) {
      // Phase 2: Pure Wide Aisle Walking (Frames 111 - 165)
      const prog = (i - 110) / 55;
      finalRawBuffer = await renderWideFrame(
        aisleMeta, aislePath,
        380,
        1.04, 1.18,
        prog
      );
    } else if (i <= 215) {
      // Transition 2: Aisle -> Counter (Frames 166 - 215: 50 frames long dissolve)
      const blendT = (i - 165) / 50;
      const s2Prog = lerp(0.75, 1.0, blendT);
      const s3Prog = lerp(0.0, 0.25, blendT);

      const buf1 = await renderWideFrame(aisleMeta, aislePath, 380, 1.04, 1.20, s2Prog);
      const buf2 = await renderWideFrame(counterMeta, counterPath, 340, 1.0, 1.15, s3Prog);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const alpha = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(buf1[j] * (1 - alpha) + buf2[j] * alpha);
        blended[j + 1] = Math.round(buf1[j + 1] * (1 - alpha) + buf2[j + 1] * alpha);
        blended[j + 2] = Math.round(buf1[j + 2] * (1 - alpha) + buf2[j + 2] * alpha);
        blended[j + 3] = 255;
      }
      finalRawBuffer = blended;
    } else if (i <= 245) {
      // Phase 3: Pure Wide Counter View (Frames 216 - 245)
      const prog = (i - 215) / 30;
      finalRawBuffer = await renderWideFrame(
        counterMeta, counterPath,
        340,
        1.04, 1.14,
        prog
      );
    } else if (i <= 275) {
      // Transition 3: Counter -> Full Brand Logo (Frames 246 - 275: 30 frames long dissolve)
      const blendT = (i - 245) / 30;
      const s3Prog = lerp(0.8, 1.0, blendT);

      const buf1 = await renderWideFrame(counterMeta, counterPath, 340, 1.04, 1.16, s3Prog);
      const buf2 = await renderLogoFrame(logoMeta, logoPath);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const alpha = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(buf1[j] * (1 - alpha) + buf2[j] * alpha);
        blended[j + 1] = Math.round(buf1[j + 1] * (1 - alpha) + buf2[j + 1] * alpha);
        blended[j + 2] = Math.round(buf1[j + 2] * (1 - alpha) + buf2[j + 2] * alpha);
        blended[j + 3] = 255;
      }
      finalRawBuffer = blended;
    } else {
      // Phase 4: Full Brand Logo Hold (Frames 276 - 300)
      finalRawBuffer = await renderLogoFrame(logoMeta, logoPath);
    }

    // Save as MozJPEG
    await sharp(finalRawBuffer, {
      raw: {
        width: targetW,
        height: targetH,
        channels: 4,
      }
    })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(destFile);

    if (i % 50 === 0 || i === TOTAL_FRAMES) {
      console.log(`Rendered frame ${i}/${TOTAL_FRAMES}`);
    }
  }

  console.log('--- All 300 frames rendered successfully! ---');

  const { execSync } = require('child_process');
  const videoOut = path.join(__dirname, '../public/videos/hero-tour-carro-e-casa.mp4');
  console.log('--- Compiling standalone MP4 video ---');
  execSync(`ffmpeg -y -framerate 30 -i "${path.join(outDir, 'ezgif-frame-%03d.jpg')}" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${videoOut}"`, { stdio: 'inherit' });
  console.log('--- MP4 video updated successfully! ---');
}

generateAllFrames().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
