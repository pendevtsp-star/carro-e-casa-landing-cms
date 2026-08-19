import cv2
import numpy as np
from PIL import Image
import os

media_dir = r"C:\Users\maxue\Downloads\fotos loja-carro-e-casa"
facade_path = os.path.join(media_dir, "foto da frente da loja.jpeg")
aisle_path = os.path.join(media_dir, "WhatsApp Image 2026-08-13 at 13.48.03 (1).jpeg")
counter_path = os.path.join(media_dir, "WhatsApp Image 2026-08-13 at 13.48.04 (2).jpeg")
logo_path = os.path.join(media_dir, "ChatGPT Image 14 de ago. de 2026, 22_22_15.png")

target_w = 1600
target_h = 900

def prepare_image(path, crop_y_ratio=0.5, zoom=1.0):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    
    # Calculate crop keeping 16:9 aspect ratio
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

def morph_frames(img1, img2, num_frames):
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
    
    # Calculate dense optical flow (Farneback or DIS)
    try:
        dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
        flow_fwd = dis.calc(gray1, gray2, None)
        flow_bwd = dis.calc(gray2, gray1, None)
    except Exception:
        flow_fwd = cv2.calcOpticalFlowFarneback(gray1, gray2, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        flow_bwd = cv2.calcOpticalFlowFarneback(gray2, gray1, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        
    h, w = img1.shape[:2]
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    
    frames = []
    for i in range(num_frames):
        t = i / float(num_frames - 1)
        # Smooth cubic easing
        t_smooth = t * t * (3 - 2 * t)
        
        # Warp img1 forward
        map1_x = (grid_x + t_smooth * flow_fwd[..., 0]).astype(np.float32)
        map1_y = (grid_y + t_smooth * flow_fwd[..., 1]).astype(np.float32)
        warp1 = cv2.remap(img1, map1_x, map1_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        
        # Warp img2 backward
        map2_x = (grid_x - (1 - t_smooth) * flow_bwd[..., 0]).astype(np.float32)
        map2_y = (grid_y - (1 - t_smooth) * flow_bwd[..., 1]).astype(np.float32)
        warp2 = cv2.remap(img2, map2_x, map2_y, interpolation=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        
        # Blend
        blended = cv2.addWeighted(warp1, 1.0 - t_smooth, warp2, t_smooth, 0)
        frames.append(blended)
        
    return frames

print("Script ready for optical flow testing")
