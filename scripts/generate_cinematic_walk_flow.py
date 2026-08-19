import cv2
import numpy as np
import os
import subprocess

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.abspath(os.path.join(script_dir, ".."))

media_dir = r"C:\Users\maxue\Downloads\fotos loja-carro-e-casa"
facade_path = os.path.join(media_dir, "foto da frente da loja.jpeg")
aisle_path = os.path.join(media_dir, "WhatsApp Image 2026-08-13 at 13.48.03 (1).jpeg")
counter_path = os.path.join(media_dir, "WhatsApp Image 2026-08-13 at 13.48.04 (2).jpeg")
logo_path = os.path.join(media_dir, "ChatGPT Image 14 de ago. de 2026, 22_22_15.png")

out_dir = os.path.join(project_dir, "public", "video-frames")
os.makedirs(out_dir, exist_ok=True)

target_w = 1600
target_h = 900
TOTAL_FRAMES = 300

def get_base_frame(path, crop_y_ratio=0.5, zoom=1.0):
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Could not read image at {path}")
    h, w = img.shape[:2]
    
    crop_w = int(w / zoom)
    crop_h = int(crop_w * (target_h / target_w))
    if crop_h > h:
        crop_h = h
        crop_w = int(crop_h * (target_w / target_h))
    
    left = int((w - crop_w) * 0.5)
    top = int((h - crop_h) * crop_y_ratio)
    top = max(0, min(h - crop_h, top))
    
    cropped = img[top:top+crop_h, left:left+crop_w]
    resized = cv2.resize(cropped, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    return resized

def smooth_step(t):
    return t * t * (3 - 2 * t)

def lerp(a, b, t):
    return a + (b - a) * t

def generate_zoom_sequence(img_path, crop_y_ratio, zoom_start, zoom_end, count):
    frames = []
    for i in range(count):
        t = smooth_step(i / float(max(1, count - 1)))
        z = lerp(zoom_start, zoom_end, t)
        frames.append(get_base_frame(img_path, crop_y_ratio, z))
    return frames

def optical_flow_morph(frame_start, frame_end, count):
    gray1 = cv2.cvtColor(frame_start, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(frame_end, cv2.COLOR_BGR2GRAY)
    
    try:
        dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
        flow_fwd = dis.calc(gray1, gray2, None)
        flow_bwd = dis.calc(gray2, gray1, None)
    except Exception:
        flow_fwd = cv2.calcOpticalFlowFarneback(gray1, gray2, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        flow_bwd = cv2.calcOpticalFlowFarneback(gray2, gray1, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        
    h, w = frame_start.shape[:2]
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    frames = []
    for i in range(count):
        t = i / float(max(1, count - 1))
        t_smooth = smooth_step(t)
        
        # Warp forward
        map1_x = (grid_x - t_smooth * flow_fwd[..., 0]).astype(np.float32)
        map1_y = (grid_y - t_smooth * flow_fwd[..., 1]).astype(np.float32)
        warp1 = cv2.remap(frame_start, map1_x, map1_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        
        # Warp backward
        map2_x = (grid_x + (1 - t_smooth) * flow_bwd[..., 0]).astype(np.float32)
        map2_y = (grid_y + (1 - t_smooth) * flow_bwd[..., 1]).astype(np.float32)
        warp2 = cv2.remap(frame_end, map2_x, map2_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        
        blended = cv2.addWeighted(warp1, 1.0 - t_smooth, warp2, t_smooth, 0)
        frames.append(blended)
        
    return frames

def build_tour():
    print(f"Output directory: {out_dir}")
    print("--- Stage 1: Clean Facade Walk (Frames 1-60) ---")
    # Exact frame 1 starts at zoom 1.0 using the clean original photo sent by user
    frames_facade = generate_zoom_sequence(facade_path, crop_y_ratio=0.35, zoom_start=1.0, zoom_end=1.14, count=60)
    
    print("--- Stage 2: Stepping Through Glass Door (Frames 61-110) ---")
    frame_facade_end = frames_facade[-1]
    frame_aisle_start = get_base_frame(aisle_path, crop_y_ratio=0.35, zoom=1.0)
    frames_door_morph = optical_flow_morph(frame_facade_end, frame_aisle_start, count=50)
    
    print("--- Stage 3: Aisle Walking Past Shelves (Frames 111-170) ---")
    frames_aisle = generate_zoom_sequence(aisle_path, crop_y_ratio=0.35, zoom_start=1.0, zoom_end=1.16, count=60)
    
    print("--- Stage 4: Approaching Wooden Counter (Frames 171-220) ---")
    frame_aisle_end = frames_aisle[-1]
    frame_counter_start = get_base_frame(counter_path, crop_y_ratio=0.32, zoom=1.0)
    frames_counter_morph = optical_flow_morph(frame_aisle_end, frame_counter_start, count=50)
    
    print("--- Stage 5: At Counter Viewing Logo & TV (Frames 221-255) ---")
    frames_counter = generate_zoom_sequence(counter_path, crop_y_ratio=0.32, zoom_start=1.0, zoom_end=1.12, count=35)
    
    print("--- Stage 6: Smooth Logo Morph & Display (Frames 256-300) ---")
    frame_counter_end = frames_counter[-1]
    frame_logo_clean = get_base_frame(logo_path, crop_y_ratio=0.5, zoom=1.0)
    frames_logo_morph = optical_flow_morph(frame_counter_end, frame_logo_clean, count=25)
    frames_logo_hold = [frame_logo_clean] * 20
    
    all_frames = (
        frames_facade + 
        frames_door_morph + 
        frames_aisle + 
        frames_counter_morph + 
        frames_counter + 
        frames_logo_morph + 
        frames_logo_hold
    )
    
    print(f"Generated {len(all_frames)} raw frames, normalizing to {TOTAL_FRAMES} frames...")
    final_300 = []
    for i in range(TOTAL_FRAMES):
        idx = int(i * (len(all_frames) - 1) / float(TOTAL_FRAMES - 1))
        final_300.append(all_frames[idx])
        
    print("--- Saving 300 High Definition Frames ---")
    for i, frame in enumerate(final_300, start=1):
        padded = str(i).zfill(3)
        file_path = os.path.join(out_dir, f"ezgif-frame-{padded}.jpg")
        cv2.imwrite(file_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
        if i % 50 == 0 or i == TOTAL_FRAMES:
            print(f"Saved frame {i}/{TOTAL_FRAMES}")
            
    print("--- Compiling 1080p Master Video ---")
    video_out = os.path.join(project_dir, "public", "videos", "hero-tour-carro-e-casa.mp4")
    cmd = f'ffmpeg -y -framerate 30 -i "{out_dir}\\ezgif-frame-%03d.jpg" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p "{video_out}"'
    subprocess.run(cmd, shell=True, check=True)
    print("--- Video and Frames Generated Successfully! ---")

if __name__ == "__main__":
    build_tour()
