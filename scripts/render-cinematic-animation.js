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

// Easing functions
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Function to crop & scale an image buffer with zoom and pan
async function renderSceneFrame(imgMetadata, imgPath, zoomStart, zoomEnd, panXStart, panXEnd, panYStart, panYEnd, progress) {
  const t = easeInOutCubic(progress);
  const zoom = lerp(zoomStart, zoomEnd, t);
  const panX = lerp(panXStart, panXEnd, t);
  const panY = lerp(panYStart, panYEnd, t);

  const cropW = Math.round(imgMetadata.width / zoom);
  const cropH = Math.round(cropW * (targetH / targetW));

  // Clamping crop dimensions
  const finalCropW = Math.min(imgMetadata.width, Math.max(10, cropW));
  const finalCropH = Math.min(imgMetadata.height, Math.max(10, cropH));

  const maxLeft = imgMetadata.width - finalCropW;
  const maxTop = imgMetadata.height - finalCropH;

  const left = Math.min(maxLeft, Math.max(0, Math.round(panX * maxLeft)));
  const top = Math.min(maxTop, Math.max(0, Math.round(panY * maxTop)));

  return await sharp(imgPath)
    .extract({ left, top, width: finalCropW, height: finalCropH })
    .resize(targetW, targetH, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function generateAllFrames() {
  console.log('--- Loading Source Image Metadata ---');
  const facadeMeta = await sharp(facadePath).metadata();
  const aisleMeta = await sharp(aislePath).metadata();
  const counterMeta = await sharp(counterPath).metadata();
  const logoMeta = await sharp(logoPath).metadata();

  console.log('--- Starting Frame Generation (300 frames @ 1600x900 HD) ---');

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const paddedIndex = i.toString().padStart(3, '0');
    const destFile = path.join(outDir, `ezgif-frame-${paddedIndex}.jpg`);

    let finalRawBuffer;

    if (i <= 70) {
      // Scene 1: Facade (Frames 1 - 70)
      // Starts wide (zoom 1.0) and glides smoothly into door #205 (zoom 1.75, pan centered on door)
      const prog = (i - 1) / 69;
      finalRawBuffer = await renderSceneFrame(
        facadeMeta, facadePath,
        1.0, 1.75,
        0.50, 0.54,
        0.30, 0.60,
        prog
      );
    } else if (i <= 85) {
      // Transition 1: Facade -> Aisle (Frames 71 - 85)
      const blendT = (i - 70) / 15;
      const s2Prog = blendT * 0.15;

      const buf1 = await renderSceneFrame(
        facadeMeta, facadePath,
        1.75, 1.95,
        0.54, 0.54,
        0.60, 0.65,
        blendT
      );
      const buf2 = await renderSceneFrame(
        aisleMeta, aislePath,
        1.05, 1.18,
        0.50, 0.48,
        0.30, 0.35,
        s2Prog
      );

      const blended = Buffer.alloc(targetW * targetH * 4);
      const alpha = easeInOutQuad(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(buf1[j] * (1 - alpha) + buf2[j] * alpha);
        blended[j + 1] = Math.round(buf1[j + 1] * (1 - alpha) + buf2[j + 1] * alpha);
        blended[j + 2] = Math.round(buf1[j + 2] * (1 - alpha) + buf2[j + 2] * alpha);
        blended[j + 3] = 255;
      }
      finalRawBuffer = blended;
    } else if (i <= 155) {
      // Scene 2: Aisle Walking (Frames 86 - 155)
      // Looking at the shelves, products on both sides, and moving forward past black barrel towards counter
      const prog = (i - 85) / 70;
      finalRawBuffer = await renderSceneFrame(
        aisleMeta, aislePath,
        1.18, 1.75,
        0.48, 0.44,
        0.35, 0.40,
        prog
      );
    } else if (i <= 170) {
      // Transition 2: Aisle -> Counter (Frames 156 - 170)
      const blendT = (i - 155) / 15;
      const s3Prog = blendT * 0.15;

      const buf1 = await renderSceneFrame(
        aisleMeta, aislePath,
        1.75, 1.90,
        0.44, 0.42,
        0.40, 0.42,
        blendT
      );
      const buf2 = await renderSceneFrame(
        counterMeta, counterPath,
        1.05, 1.20,
        0.50, 0.48,
        0.30, 0.38,
        s3Prog
      );

      const blended = Buffer.alloc(targetW * targetH * 4);
      const alpha = easeInOutQuad(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(buf1[j] * (1 - alpha) + buf2[j] * alpha);
        blended[j + 1] = Math.round(buf1[j + 1] * (1 - alpha) + buf2[j + 1] * alpha);
        blended[j + 2] = Math.round(buf1[j + 2] * (1 - alpha) + buf2[j + 2] * alpha);
        blended[j + 3] = 255;
      }
      finalRawBuffer = blended;
    } else if (i <= 235) {
      // Scene 3: Counter Approach & Logo Centering (Frames 171 - 235)
      // Moving up to the wooden counter and zooming directly into the Carro & Casa oval logo
      const prog = (i - 170) / 65;
      finalRawBuffer = await renderSceneFrame(
        counterMeta, counterPath,
        1.20, 2.05,
        0.48, 0.46,
        0.38, 0.52,
        prog
      );
    } else if (i <= 255) {
      // Transition 3: Counter Oval Logo -> Extended HD Widescreen Logo (Frames 236 - 255)
      const blendT = (i - 235) / 20;

      const buf1 = await renderSceneFrame(
        counterMeta, counterPath,
        2.05, 2.35,
        0.46, 0.46,
        0.52, 0.54,
        blendT
      );
      const buf2 = await renderSceneFrame(
        logoMeta, logoPath,
        1.10, 1.0,
        0.5, 0.5,
        0.5, 0.5,
        blendT
      );

      const blended = Buffer.alloc(targetW * targetH * 4);
      const alpha = easeInOutCubic(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(buf1[j] * (1 - alpha) + buf2[j] * alpha);
        blended[j + 1] = Math.round(buf1[j + 1] * (1 - alpha) + buf2[j + 1] * alpha);
        blended[j + 2] = Math.round(buf1[j + 2] * (1 - alpha) + buf2[j + 2] * alpha);
        blended[j + 3] = 255;
      }
      finalRawBuffer = blended;
    } else {
      // Scene 4: Extended Widescreen Logo Hold (Frames 256 - 300)
      const prog = (i - 255) / 45;
      finalRawBuffer = await renderSceneFrame(
        logoMeta, logoPath,
        1.0, 1.0,
        0.5, 0.5,
        0.5, 0.5,
        prog
      );
    }

    // Save as web-optimized MozJPEG
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

  // Also compile the standalone MP4 video from these frames for preview
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
