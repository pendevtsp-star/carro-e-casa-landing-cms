"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface HeroVideoSequenceProps {
  hero: {
    title: string;
    subtitle: string;
    badgeText: string;
    highlightText: string;
    primaryButtonLabel: string;
    primaryButtonUrl?: string | null;
    secondaryButtonLabel: string;
    secondaryButtonUrl?: string | null;
  };
  whatsappUrl: string;
}

const TOTAL_FRAMES = 240;

export function HeroVideoSequence({ hero, whatsappUrl }: HeroVideoSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate which frame to show
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, TOTAL_FRAMES]);

  // Transform text left and out of screen based on scroll
  // Text starts exiting very early so it feels like entering the store
  const textX = useTransform(scrollYProgress, [0, 0.2], ["0%", "-150%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Preload images on mount
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();
      // Pad to 3 digits (e.g. 001, 010, 100)
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `/video-frames/ezgif-frame-${paddedIndex}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };
      
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Draw initial frame if available
  useEffect(() => {
    if (images.length > 0 && images[0].complete && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(images[0], 0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [images]);

  // Draw current frame on scroll
  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (images.length === 0 || !canvasRef.current) return;
    
    const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(latest) - 1));
    const img = images[index];

    if (img && img.complete) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Clear before drawing just in case
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Calculate crop/cover to maintain aspect ratio similar to object-cover
        const canvas = canvasRef.current;
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    }
  });

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        // Redraw current frame
        const index = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(frameIndex.get()) - 1));
        const img = images[index];
        if (img && img.complete) {
           const context = canvasRef.current.getContext("2d");
           if (context) {
             const canvas = canvasRef.current;
             const canvasRatio = canvas.width / canvas.height;
             const imgRatio = img.width / img.height;
             
             let drawWidth = canvas.width;
             let drawHeight = canvas.height;
             let offsetX = 0;
             let offsetY = 0;
     
             if (imgRatio > canvasRatio) {
               drawWidth = canvas.height * imgRatio;
               offsetX = (canvas.width - drawWidth) / 2;
             } else {
               drawHeight = canvas.width / imgRatio;
               offsetY = (canvas.height - drawHeight) / 2;
             }
     
             context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
           }
        }
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [images, frameIndex]);

  const primaryHeroUrl = hero.primaryButtonUrl || whatsappUrl;
  const secondaryHeroUrl = hero.secondaryButtonUrl || "https://instagram.com/lojacarroecasa"; // Fallback as we removed settings

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-brand-dark">
      {/* Sticky container that stays on screen while scrolling */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        
        {/* Canvas for video frames */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 h-full w-full object-cover" 
        />
        
        {/* Soft gradient just to keep text readable on the left, but fades out when walking into store */}
        <motion.div 
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 z-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" 
        />
        <motion.div 
          style={{ opacity: overlayOpacity }}
          className="absolute -top-40 -left-40 z-0 size-96 rounded-full bg-brand/15 blur-[120px] pointer-events-none" 
        />
        <motion.div 
          style={{ opacity: overlayOpacity }}
          className="absolute bottom-0 right-0 z-0 size-96 rounded-full bg-brand/10 blur-[140px] pointer-events-none" 
        />

        {/* Hero Content moving out */}
        <motion.div 
          className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-20"
          style={{ x: textX, opacity: textOpacity }}
        >
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-brand/40 bg-brand/15 px-4 py-2 text-sm font-semibold text-brand shadow-[0_0_20px_rgba(246,196,0,0.25)] animate-shimmer">
                {hero.badgeText}
              </span>
              <span className="rounded-full border border-white/22 bg-white/12 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-md">
                {hero.highlightText}
              </span>
            </div>
            <h1 className="mt-8 text-balance text-5xl font-semibold tracking-normal sm:text-6xl lg:text-7xl text-white">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
              {hero.subtitle}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a 
                href={primaryHeroUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand px-8 text-sm font-medium text-brand-dark transition-colors hover:bg-brand/90"
              >
                {hero.primaryButtonLabel}
              </a>
              <a 
                href={secondaryHeroUrl} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-md bg-white/10 px-8 text-sm font-medium text-white transition-colors hover:bg-white/20 border border-white/20"
              >
                {hero.secondaryButtonLabel}
              </a>
            </div>
          </div>
        </motion.div>
        
        {/* Loading Indicator */}
        {imagesLoaded < TOTAL_FRAMES && (
          <div className="absolute bottom-4 left-4 z-20 text-white/50 text-xs flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand animate-pulse" />
            Carregando experiência premium... {Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}
