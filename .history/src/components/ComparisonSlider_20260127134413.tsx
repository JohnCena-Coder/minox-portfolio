import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface Props {
    beforeImg: string;
    afterImg: string;
}

const ComparisonSlider: React.FC<Props> = ({ beforeImg, afterImg }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
        
        // Tính toán vị trí tương đối (0% - 100%)
        const position = ((x - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(position, 0), 100));
    };

    // Global event listeners để kéo mượt hơn (kể cả khi chuột ra ngoài div)
    useEffect(() => {
        const handleUp = () => setIsDragging(false);
        const handleMoveGlobal = (e: MouseEvent | TouchEvent) => {
             if (!isDragging || !containerRef.current) return;
             const rect = containerRef.current.getBoundingClientRect();
             const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
             const position = ((clientX - rect.left) / rect.width) * 100;
             setSliderPosition(Math.min(Math.max(position, 0), 100));
        };

        if (isDragging) {
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchend', handleUp);
            window.addEventListener('mousemove', handleMoveGlobal);
            window.addEventListener('touchmove', handleMoveGlobal);
        }

        return () => {
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchend', handleUp);
            window.removeEventListener('mousemove', handleMoveGlobal);
            window.removeEventListener('touchmove', handleMoveGlobal);
        };
    }, [isDragging]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-video select-none overflow-hidden cursor-ew-resize group"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
        >
            {/* 1. Ảnh After (Gốc nằm dưới) */}
            <img 
                src={afterImg} 
                alt="After" 
                className="absolute top-0 left-0 w-full h-full object-cover" 
            />

            {/* 2. Ảnh Before (Nằm đè lên trên, bị cắt bởi clip-path) */}
            <div 
                className="absolute top-0 left-0 w-full h-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <img 
                    src={beforeImg} 
                    alt="Before" 
                    className="absolute top-0 left-0 w-full h-full object-cover max-w-none" 
                    // Quan trọng: max-w-none để ảnh không bị co lại khi div cha nhỏ đi
                    style={{ width: containerRef.current?.offsetWidth || '100%' }}
                />
            </div>

            {/* 3. Thanh trượt (Slider Handle) */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                    <MoveHorizontal size={16} />
                </div>
            </div>
            
            {/* Nhãn Before/After */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 text-[10px] font-bold uppercase backdrop-blur-sm">Before</div>
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 text-[10px] font-bold uppercase backdrop-blur-sm">After</div>
        </div>
    );
};

export default ComparisonSlider;