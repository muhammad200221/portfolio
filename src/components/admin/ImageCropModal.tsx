import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  Move,
  Sparkles,
  Scissors,
  RefreshCw,
} from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => Promise<void> | void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [naturalDim, setNaturalDim] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Reset state when a new image is loaded
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Handle image load to calculate natural dimensions
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDim({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  // Dragging handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4));
  };

  const rotate = (angle: number) => {
    setRotation((prev) => (prev + angle + 360) % 360);
  };

  const resetAll = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Generate cropped output canvas
  const handleCropAndSave = async () => {
    if (!imageRef.current || !containerRef.current) return;
    try {
      setIsProcessing(true);

      const targetSize = 400; // standard high-res square avatar
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Container viewport size
      const containerRect = containerRef.current.getBoundingClientRect();
      const cropBoxSize = Math.min(containerRect.width, containerRect.height) * 0.78;

      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, targetSize, targetSize);

      // Center point on canvas
      ctx.translate(targetSize / 2, targetSize / 2);

      // Scale ratio between canvas target and DOM crop circle
      const scaleRatio = targetSize / cropBoxSize;

      // Apply Pan (adjusted for scale)
      ctx.translate(pan.x * scaleRatio, pan.y * scaleRatio);

      // Apply Rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Calculate rendered size of image
      const img = imageRef.current;
      const baseRenderWidth = img.width * zoom * scaleRatio;
      const baseRenderHeight = img.height * zoom * scaleRatio;

      ctx.drawImage(
        img,
        -baseRenderWidth / 2,
        -baseRenderHeight / 2,
        baseRenderWidth,
        baseRenderHeight
      );

      // Convert to ultra-crisp JPEG with optimized size (<35KB)
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      await onCropComplete(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Failed to crop image:', err);
      alert('نەتوانرا وێنەکە ببڕدرێت، تکایە دووبارە هەوڵبدەرەوە');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0b1120] border border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                بڕین و ڕێکخستنی وێنەی پرۆفایل
              </h2>
              <p className="text-xs text-slate-400">
                وێنەکە ڕابکێشە یان قەبارەکەی بگۆڕە بۆ بەدەستهێنانی باشترین شێوە
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Crop Viewport */}
        <div className="p-4 sm:p-6 flex flex-col items-center">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`relative w-full max-w-[380px] h-[320px] sm:h-[360px] bg-slate-950 rounded-2xl overflow-hidden select-none touch-none border border-slate-800 flex items-center justify-center ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* The Image being transformed */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.08s ease-out',
              }}
              className="flex items-center justify-center origin-center pointer-events-none"
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                crossOrigin="anonymous"
                onLoad={onImageLoad}
                className="max-w-[280px] max-h-[280px] object-contain select-none"
                draggable={false}
              />
            </div>

            {/* Circular Crop Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer shadow to darken the non-cropped area */}
              <div className="w-[230px] h-[230px] sm:w-[250px] sm:h-[250px] rounded-full border-2 border-indigo-400/90 shadow-[0_0_0_9999px_rgba(11,17,32,0.85)] relative">
                {/* Rule-of-thirds alignment grid (subtle) */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                  <div className="border-r border-b border-indigo-200"></div>
                  <div className="border-r border-b border-indigo-200"></div>
                  <div className="border-b border-indigo-200"></div>
                  <div className="border-r border-b border-indigo-200"></div>
                  <div className="border-r border-b border-indigo-200"></div>
                  <div className="border-b border-indigo-200"></div>
                  <div className="border-r border-indigo-200"></div>
                  <div className="border-r border-indigo-200"></div>
                  <div></div>
                </div>

                {/* Subtle center marker */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                </div>
              </div>
            </div>

            {/* Drag instruction overlay */}
            <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[11px] text-slate-300 pointer-events-none flex items-center gap-1.5 border border-slate-700/50">
              <Move className="w-3 h-3 text-indigo-400" />
              <span>ڕابکێشە بۆ جووڵاندن</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="w-full max-w-[460px] mt-5 space-y-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.15))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="بچووککردنەوە"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
              />
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.15))}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="گەورەکردنەوە"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 w-12 text-left dir-ltr">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Tools (Rotate & Reset) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => rotate(-90)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>سوڕاندن ٩٠°</span>
                </button>
                <button
                  type="button"
                  onClick={() => rotate(90)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>سوڕاندن بە پێچەوانە</span>
                </button>
              </div>

              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-800/80 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ڕێکخستنەوە</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/40">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            پاشگەزبوونەوە
          </button>

          <button
            type="button"
            onClick={handleCropAndSave}
            disabled={isProcessing || !imageLoaded}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>بڕین و پاشەکەوت دەکرێت...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>جێگیرکردن و پاشەکەوتکردن</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
