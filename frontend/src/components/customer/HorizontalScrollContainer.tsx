import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollProps> = ({
  children,
  className = '',
  showArrows = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();

    // Wheel event to translate vertical scroll to horizontal scroll
    const handleWheel = (e: WheelEvent) => {
      // If user has horizontal delta, let browser handle it natively
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      if (el.scrollWidth <= el.clientWidth) return;

      const isScrollingLeft = e.deltaY < 0;
      const isScrollingRight = e.deltaY > 0;

      const atLeft = el.scrollLeft <= 0;
      const atRight = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;

      if ((isScrollingLeft && !atLeft) || (isScrollingRight && !atRight)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.1;
        checkScroll();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', checkScroll);

    // Initial check after contents load
    const timeout = setTimeout(checkScroll, 200);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    checkScroll();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  const scrollByAmount = (amount: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="relative group/scroll">
      {/* Left Navigation Arrow (desktop) */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-260)}
          className="hidden md:flex absolute -left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-[#E9DDE3] text-[#1F2937] hover:text-[#FF4F8B] hover:border-[#FF4F8B] items-center justify-center cursor-pointer transition-all active:scale-95"
          title="Cuộn sang trái"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Horizontal Scroll Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        className={`overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth select-none cursor-grab active:cursor-grabbing ${className}`}
      >
        {children}
      </div>

      {/* Right Navigation Arrow (desktop) */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(260)}
          className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-[#E9DDE3] text-[#1F2937] hover:text-[#FF4F8B] hover:border-[#FF4F8B] items-center justify-center cursor-pointer transition-all active:scale-95"
          title="Cuộn sang phải"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
