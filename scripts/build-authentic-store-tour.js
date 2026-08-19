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

const targetW = 1920;
const targetH = 1080;
const TOTAL_FRAMES = 300;

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Function to crop and render a frame with subtle, smooth camera glide
async function renderAuthenticFrame(imgMeta, imgPath, cropTopRatio, zoomStart, zoomEnd, progress) {
  const t = smoothStep(progress);
  const zoom = lerp(zoomStart, zoomEnd, t);

  // Calculate crop window maintaining 16:9 aspect ratio
  let cropW = Math.round(imgMeta.width / zoom);
  let cropH = Math.round(cropW * (targetH / targetW));

  if (cropH > imgMeta.height) {
    cropH = imgMeta.height;
    cropW = Math.round(cropH * (targetW / targetH));
  }
  if (cropW > imgMeta.width) {
    cropW = imgMeta.width;
    cropH = Math.round(cropW * (targetH / targetW));
  }

  const maxLeft = Math.max(0, imgMeta.width - cropW);
  const left = Math.round(maxLeft * 0.5); // perfectly centered horizontally

  const maxTop = Math.max(0, imgMeta.height - cropH);
  const top = Math.min(maxTop, Math.max(0, Math.round(cropTopRatio * maxTop)));

  return await sharp(imgPath)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(targetW, targetH, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function renderLogoFrame(logoPath) {
  return await sharp(logoPath)
    .resize(targetW, targetH, { fit: 'cover', position: 'center', kernel: sharp.kernel.lanczos3 })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function generate() {
  console.log('--- Loading Authentic Store Photos ---');
  const facadeMeta = await sharp(facadePath).metadata();
  const aisleMeta = await sharp(aislePath).metadata();
  const counterMeta = await sharp(counterPath).metadata();
  const logoMeta = await sharp(logoPath).metadata();

  console.log('--- Generating 300 Full HD 1080p Continuous Walk Frames ---');

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const paddedIndex = i.toString().padStart(3, '0');
    const destFile = path.join(outDir, `ezgif-frame-${paddedIndex}.jpg`);
    let finalRaw;

    if (i <= 60) {
      // Stage 1: Frente da Loja (Fachada Real Completa)
      const prog = (i - 1) / 59;
      finalRaw = await renderAuthenticFrame(
        facadeMeta, facadePath,
        0.35, // shows yellow Carro & Casa sign, bricks, and door #205
        1.0, 1.12, // gentle natural forward glide
        prog
      );
    } else if (i <= 110) {
      // Stage 2: Transição Suave Atravessando a Porta (50 frames de dissolvência)
      const blendT = (i - 60) / 50;
      const s1Prog = lerp(0.8, 1.0, blendT);
      const s2Prog = lerp(0.0, 0.25, blendT);

      const b1 = await renderAuthenticFrame(facadeMeta, facadePath, 0.40, 1.0, 1.15, s1Prog);
      const b2 = await renderAuthenticFrame(aisleMeta, aislePath, 0.35, 1.0, 1.12, s2Prog);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const a = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else if (i <= 170) {
      // Stage 3: Caminhada pelo Corredor da Loja (Visão Ampla das Prateleiras)
      const prog = (i - 110) / 60;
      finalRaw = await renderAuthenticFrame(
        aisleMeta, aislePath,
        0.35,
        1.04, 1.16,
        prog
      );
    } else if (i <= 220) {
      // Stage 4: Transição Suave para o Balcão (50 frames de dissolvência)
      const blendT = (i - 170) / 50;
      const s2Prog = lerp(0.75, 1.0, blendT);
      const s3Prog = lerp(0.0, 0.25, blendT);

      const b1 = await renderAuthenticFrame(aisleMeta, aislePath, 0.35, 1.04, 1.18, s2Prog);
      const b2 = await renderAuthenticFrame(counterMeta, counterPath, 0.32, 1.0, 1.12, s3Prog);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const a = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else if (i <= 250) {
      // Stage 5: Visão Ampla do Balcão de Atendimento
      const prog = (i - 220) / 30;
      finalRaw = await renderAuthenticFrame(
        counterMeta, counterPath,
        0.32,
        1.04, 1.12,
        prog
      );
    } else if (i <= 280) {
      // Stage 6: Transição Suave para a Logomarca Oficial (30 frames de dissolvência)
      const blendT = (i - 250) / 30;
      const s3Prog = lerp(0.8, 1.0, blendT);

      const b1 = await renderAuthenticFrame(counterMeta, counterPath, 0.32, 1.04, 1.15, s3Prog);
      const b2 = await renderLogoFrame(logoPath);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const a = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else {
      // Stage 7: Fixação da Logomarca Estendida Oficial
      finalRaw = await renderLogoFrame(logoPath);
    }

    // Save as pristine Full HD MozJPEG
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
  console.log('--- Master Video and Frames Generated Successfully! ---');
}

generate().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
