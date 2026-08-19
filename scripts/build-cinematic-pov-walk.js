const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const brainDir = 'C:/Users/maxue/.gemini/antigravity-ide/brain/877e1a05-ffeb-4b91-bd37-f84024c13e28';
const mediaDir = 'C:/Users/maxue/Downloads/fotos loja-carro-e-casa';

// 5 Keyframes
const frame1_facade = path.join(brainDir, 'hero_pov_entrance_1787160128399.jpg');
const frame2_door = path.join(brainDir, 'hero_pov_opening_door_1787160176872.jpg');
const frame3_aisle = path.join(brainDir, 'hero_pov_walking_aisle_1787160225721.jpg');
const frame4_counter = path.join(brainDir, 'hero_pov_reaching_counter_1787160279324.jpg');
const frame5_logo = path.join(mediaDir, 'ChatGPT Image 14 de ago. de 2026, 22_22_15.png');

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

// Function to render a wide frame with controlled subtle zoom/pan
async function renderFrame(imgMeta, imgPath, zoomStart, zoomEnd, panYStart, panYEnd, progress) {
  const t = smoothStep(progress);
  const zoom = lerp(zoomStart, zoomEnd, t);
  const panY = lerp(panYStart, panYEnd, t);

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
  const left = Math.min(maxLeft, Math.max(0, Math.round(maxLeft * 0.5)));

  const maxTop = Math.max(0, imgMeta.height - cropH);
  const top = Math.min(maxTop, Math.max(0, Math.round(panY * maxTop)));

  return await sharp(imgPath)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(targetW, targetH, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function renderLogo(logoPath) {
  return await sharp(logoPath)
    .resize(targetW, targetH, { fit: 'cover', position: 'center' })
    .ensureAlpha()
    .raw()
    .toBuffer();
}

async function generate() {
  console.log('--- Loading Keyframe Metadata ---');
  const m1 = await sharp(frame1_facade).metadata();
  const m2 = await sharp(frame2_door).metadata();
  const m3 = await sharp(frame3_aisle).metadata();
  const m4 = await sharp(frame4_counter).metadata();
  const m5 = await sharp(frame5_logo).metadata();

  console.log('--- Rendering 300 Cinematic Steadicam Frames ---');

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const paddedIndex = i.toString().padStart(3, '0');
    const destFile = path.join(outDir, `ezgif-frame-${paddedIndex}.jpg`);
    let finalRaw;

    if (i <= 40) {
      // Scene 1: Facade Walk
      const prog = (i - 1) / 39;
      finalRaw = await renderFrame(m1, frame1_facade, 1.0, 1.12, 0.4, 0.45, prog);
    } else if (i <= 75) {
      // Transition 1: Facade -> Door push (35 frames blend)
      const blendT = (i - 40) / 35;
      const s1Prog = lerp(0.8, 1.0, blendT);
      const s2Prog = lerp(0.0, 0.25, blendT);

      const b1 = await renderFrame(m1, frame1_facade, 1.0, 1.15, 0.45, 0.5, s1Prog);
      const b2 = await renderFrame(m2, frame2_door, 1.0, 1.12, 0.35, 0.4, s2Prog);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const a = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else if (i <= 110) {
      // Scene 2: Stepping through door into store
      const prog = (i - 75) / 35;
      finalRaw = await renderFrame(m2, frame2_door, 1.04, 1.18, 0.4, 0.45, prog);
    } else if (i <= 145) {
      // Transition 2: Door -> Aisle walk (35 frames blend)
      const blendT = (i - 110) / 35;
      const s2Prog = lerp(0.8, 1.0, blendT);
      const s3Prog = lerp(0.0, 0.25, blendT);

      const b1 = await renderFrame(m2, frame2_door, 1.04, 1.20, 0.45, 0.5, s2Prog);
      const b2 = await renderFrame(m3, frame3_aisle, 1.0, 1.14, 0.35, 0.4, s3Prog);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const a = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else if (i <= 180) {
      // Scene 3: Walking along the main product aisle
      const prog = (i - 145) / 35;
      finalRaw = await renderFrame(m3, frame3_aisle, 1.04, 1.18, 0.4, 0.45, prog);
    } else if (i <= 215) {
      // Transition 3: Aisle -> Counter approach (35 frames blend)
      const blendT = (i - 180) / 35;
      const s3Prog = lerp(0.8, 1.0, blendT);
      const s4Prog = lerp(0.0, 0.25, blendT);

      const b1 = await renderFrame(m3, frame3_aisle, 1.04, 1.20, 0.45, 0.5, s3Prog);
      const b2 = await renderFrame(m4, frame4_counter, 1.0, 1.14, 0.35, 0.4, s4Prog);

      const blended = Buffer.alloc(targetW * targetH * 4);
      const a = smoothStep(blendT);
      for (let j = 0; j < blended.length; j += 4) {
        blended[j] = Math.round(b1[j] * (1 - a) + b2[j] * a);
        blended[j + 1] = Math.round(b1[j + 1] * (1 - a) + b2[j + 1] * a);
        blended[j + 2] = Math.round(b1[j + 2] * (1 - a) + b2[j + 2] * a);
        blended[j + 3] = 255;
      }
      finalRaw = blended;
    } else if (i <= 245) {
      // Scene 4: Approaching the wooden counter
      const prog = (i - 215) / 30;
      finalRaw = await renderFrame(m4, frame4_counter, 1.04, 1.16, 0.4, 0.45, prog);
    } else if (i <= 275) {
      // Transition 4: Counter -> Full Brand Logo (30 frames blend)
      const blendT = (i - 245) / 30;
      const s4Prog = lerp(0.8, 1.0, blendT);

      const b1 = await renderFrame(m4, frame4_counter, 1.04, 1.18, 0.45, 0.5, s4Prog);
      const b2 = await renderLogo(frame5_logo);

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
      // Scene 5: Full Brand Logo Hold
      finalRaw = await renderLogo(frame5_logo);
    }

    // Save as MozJPEG
    await sharp(finalRaw, {
      raw: {
        width: targetW,
        height: targetH,
        channels: 4,
      }
    })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(destFile);

    if (i % 50 === 0 || i === TOTAL_FRAMES) {
      console.log(`Rendered frame ${i}/${TOTAL_FRAMES}`);
    }
  }

  console.log('--- Compiling Master 1080p MP4 Video ---');
  const videoOut = path.join(__dirname, '../public/videos/hero-tour-carro-e-casa.mp4');
  execSync(`ffmpeg -y -framerate 30 -i "${path.join(outDir, 'ezgif-frame-%03d.jpg')}" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p "${videoOut}"`, { stdio: 'inherit' });
  console.log('--- Video and Frames Generated Successfully! ---');
}

generate().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
