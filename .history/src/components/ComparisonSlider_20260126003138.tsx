import React, { useState } from 'react';

interface Props {
  beforeImg: string;
  afterImg: string;
}

export default function ComparisonSlider({ beforeImg, afterImg }: Props) {
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <div className="relative w-full max-w-[800px] h-[300px] md:h-[450px] mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm select-none group">
      {/* ẢNH AFTER (Nền dưới) */}
      <img 
        src={afterImg} 
        alt="After" 
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* ẢNH BEFORE (Lớp trên, bị cắt clip-path) */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden border-r-2 border-white"
        style={{ width: `${sliderValue}%` }}
      >
        <img 
          src={beforeImg} 
          alt="Before" 
          className="absolute top-0 left-0 w-full max-w-none h-full object-cover"
          // Mẹo: set width theo container cha để ảnh không bị co lại khi div cha nhỏ đi
          style={{ width: '100vw', maxWidth: '800px' }} 
        />
      </div>

      {/* LABELS */}
      <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Before</div>
      <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">After</div>

      {/* INPUT RANGE (Điều khiển vô hình) */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={(e) => setSliderValue(Number(e.target.value))}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />
      
      {/* HANDLER ICON (Nút tròn ở giữa thanh cắt) */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-lg text-gray-800"
        style={{ left: `calc(${sliderValue}% - 16px)` }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </div>
    </div>
  );
}