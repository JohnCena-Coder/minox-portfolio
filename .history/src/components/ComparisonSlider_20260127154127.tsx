import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface Props {
    beforeImg: string;
    afterImg: string;
}

const ComparisonSlider: React.FC<Props> = ({ beforeImg, afterImg }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Hàm tính toán vị trí chung cho cả Chuột và Cảm ứng
    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(position, 0), 100));
    }, []);

    // Xử lý sự kiện CHUỘT (Desktop)
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        updatePosition(e.clientX);
    };

    // Xử lý sự kiện CẢM ỨNG (Mobile)
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        updatePosition(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // Quan trọng: Ngăn màn hình bị cuộn khi đang kéo slider
        // e.preventDefault() có thể gây lỗi trong một số browser nếu event không cancelable, 
        // nhưng class 'touch-none' ở dưới đã lo việc này rồi.
        if (isDragging) {
            updatePosition(e.touches[0].clientX);
        }
    };

    // Global listeners để kéo mượt hơn khi chuột/ngón tay ra khỏi khung
    useEffect(() => {
        const handleUp = () => setIsDragging(false);
        const handleMoveGlobal = (e: MouseEvent | TouchEvent) => {
            if (!isDragging) return;
            
            let clientX;
            if ('touches' in e) {
                clientX = e.touches[0].clientX;
            } else {
                clientX = (e as MouseEvent).clientX;
            }
            updatePosition(clientX);
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
    }, [isDragging, updatePosition]);

    return (
        <div 
            ref={containerRef}
            // THÊM CLASS 'touch-none': Cực kỳ quan trọng để fix lỗi mobile
            className="relative w-full aspect-video select-none overflow-hidden cursor-ew-resize group touch-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            {/* 1. Ảnh After (Gốc nằm dưới) */}
            <img 
                src={afterImg} 
                alt="After" 
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" 
            />

            {/* 2. Ảnh Before (Nằm đè lên trên, bị cắt bởi clip-path) */}
            <div 
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <img 
                    src={beforeImg} 
                    alt="Before" 
                    className="absolute top-0 left-0 w-full h-full object-cover max-w-none" 
                    style={{ width: containerRef.current?.offsetWidth || '100%' }}
                />
            </div>

            {/* 3. Thanh trượt (Slider Handle) */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                    <MoveHorizontal size={16} />
                </div>
            </div>
            
            {/* Nhãn Before/After */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 text-[10px] font-bold uppercase backdrop-blur-sm pointer-events-none">Before</div>
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 text-[10px] font-bold uppercase backdrop-blur-sm pointer-events-none">After</div>
        </div>
    );
};

export default ComparisonSlider;