import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface Props {
    beforeImg: string;
    afterImg: string;
}

const ComparisonSlider: React.FC<Props> = ({ beforeImg, afterImg }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false); // Dùng Ref thay vì State để tránh render lại liên tục khi kéo

    // Hàm tính toán vị trí (dùng chung)
    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(position, 0), 100));
    }, []);

    // --- LOGIC XỬ LÝ SỰ KIỆN (NATIVE EVENTS) ---
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Xử lý khi bắt đầu chạm/bấm
        const handleStart = (clientX: number) => {
            isDragging.current = true;
            updatePosition(clientX);
        };

        const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
        const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);

        // 2. Xử lý khi di chuyển (QUAN TRỌNG NHẤT)
        const handleMove = (clientX: number) => {
            if (!isDragging.current) return;
            updatePosition(clientX);
        };

        const onTouchMove = (e: TouchEvent) => {
            // Dòng lệnh "quyền lực" nhất: CHẶN ĐỨNG VIỆC CUỘN TRANG
            if (isDragging.current) {
                e.preventDefault(); 
                handleMove(e.touches[0].clientX);
            }
        };

        const onMouseMove = (e: MouseEvent) => {
            handleMove(e.clientX);
        };

        // 3. Xử lý khi thả tay
        const handleEnd = () => {
            isDragging.current = false;
        };

        // --- GẮN SỰ KIỆN TRỰC TIẾP (Non-passive) ---
        // React mặc định gán sự kiện là passive (không chặn được scroll), nên ta phải gán thủ công ở đây
        container.addEventListener('touchstart', onTouchStart, { passive: false });
        container.addEventListener('touchmove', onTouchMove, { passive: false }); // Key fix
        container.addEventListener('touchend', handleEnd);
        
        // Sự kiện chuột (Desktop)
        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove); // Gán vào window để kéo ra ngoài vẫn ăn
        window.addEventListener('mouseup', handleEnd);

        // Cleanup khi component bị hủy
        return () => {
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchmove', onTouchMove);
            container.removeEventListener('touchend', handleEnd);
            container.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', handleEnd);
        };
    }, [updatePosition]);

    return (
        <div 
            ref={containerRef}
            // Thêm style này để chắc chắn trình duyệt biết ý định của mình
            style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            className="relative w-full aspect-video select-none overflow-hidden cursor-ew-resize group shadow-lg"
        >
            {/* 1. Ảnh After (Gốc nằm dưới) */}
            <img 
                src={afterImg} 
                alt="After" 
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" 
            />

            {/* 2. Ảnh Before (Nằm đè lên trên) */}
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

            {/* 3. Thanh Divider */}
            <div 
                className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
            >
                {/* Nút tròn ở giữa để dễ nhìn vị trí */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-black border border-gray-200">
                    <MoveHorizontal size={16} />
                </div>
            </div>
            
            {/* Nhãn */}
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 text-[10px] font-bold uppercase backdrop-blur-md rounded-sm pointer-events-none border border-white/10">Before</div>
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 text-[10px] font-bold uppercase backdrop-blur-md rounded-sm pointer-events-none border border-white/10">After</div>
        </div>
    );
};

export default ComparisonSlider;