import React, { useState, useRef, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface Props {
    beforeImg: string;
    afterImg: string;
}

const ComparisonSlider: React.FC<Props> = ({ beforeImg, afterImg }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Hàm tính toán vị trí (Dùng chung cho cả chuột và cảm ứng)
    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Tính phần trăm vị trí con trỏ so với chiều rộng ảnh
        const position = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(position, 0), 100));
    }, []);

    // 1. KHI NHẤN XUỐNG (Bắt đầu kéo)
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        // CỰC KỲ QUAN TRỌNG: "Khóa" con trỏ vào thẻ div này. 
        // Giúp trình duyệt hiểu rằng mọi cử động tiếp theo đều thuộc về cái Slider này,
        // kể cả khi ngón tay bạn trượt ra ngoài mép ảnh.
        e.currentTarget.setPointerCapture(e.pointerId);
        updatePosition(e.clientX);
    };

    // 2. KHI DI CHUYỂN
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        // PointerEvent luôn có clientX, không cần e.touches[0] phức tạp nữa
        updatePosition(e.clientX);
    };

    // 3. KHI THẢ TAY RA
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div 
            ref={containerRef}
            // touch-none: Cấm trình duyệt cuộn trang khi chạm vào vùng này
            className="relative w-full aspect-video select-none overflow-hidden cursor-ew-resize group touch-none"
            // Dùng bộ sự kiện Pointer thay vì Mouse/Touch cũ
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            // Thêm onPointerLeave để đề phòng trường hợp mất focus
            onPointerLeave={handlePointerUp} 
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