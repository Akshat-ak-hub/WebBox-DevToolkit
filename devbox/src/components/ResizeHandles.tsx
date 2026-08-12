import React, { useState, useEffect, useCallback, useRef } from 'react';

export function ResizeHandles() {
  const [isPopupMode, setIsPopupMode] = useState(false);
  const [isDragging, setIsDragging] = useState<false | 'both' | 'horizontal' | 'vertical'>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, w: 700, h: 540 });
  const [size, setSize] = useState({ width: 700, height: 540 });
  const sizeRef = useRef(size);
  sizeRef.current = size;

  useEffect(() => {
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    if (window.location.search.includes('popup=true')) {
      setIsPopupMode(true);
    }
  }, []);

  const applySize = useCallback((w: number, h: number) => {
    const clampedW = Math.max(w, 400);
    const clampedH = Math.max(h, 350);

    document.documentElement.style.width = `${clampedW}px`;
    document.documentElement.style.height = `${clampedH}px`;
    document.body.style.width = `${clampedW}px`;
    document.body.style.height = `${clampedH}px`;

    setSize({ width: clampedW, height: clampedH });
  }, []);

  const startDrag = (type: 'both' | 'horizontal' | 'vertical', e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      w: window.innerWidth,
      h: window.innerHeight,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newW = dragStart.w;
      let newH = dragStart.h;

      if (isDragging === 'both' || isDragging === 'horizontal') {
        newW = dragStart.w + deltaX;
      }
      if (isDragging === 'both' || isDragging === 'vertical') {
        newH = dragStart.h + deltaY;
      }

      applySize(newW, newH);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, applySize]);

  if (!isPopupMode) {
    return null;
  }

  return (
    <>
      <div
        className="resize-handle resize-handle-right"
        onMouseDown={(e) => startDrag('horizontal', e)}
        title="Drag to resize width"
      />
      <div
        className="resize-handle resize-handle-bottom"
        onMouseDown={(e) => startDrag('vertical', e)}
        title="Drag to resize height"
      />
      <div
        className="resize-handle resize-handle-corner"
        onMouseDown={(e) => startDrag('both', e)}
        title="Drag to resize window"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <circle cx="8.5" cy="8.5" r="1" />
          <circle cx="5.5" cy="8.5" r="1" />
          <circle cx="8.5" cy="5.5" r="1" />
          <circle cx="2.5" cy="8.5" r="1" />
          <circle cx="5.5" cy="5.5" r="1" />
          <circle cx="8.5" cy="2.5" r="1" />
        </svg>
      </div>

      {isDragging && (
        <div className="resize-tooltip">
          {size.width} × {size.height} px
        </div>
      )}
    </>
  );
}
