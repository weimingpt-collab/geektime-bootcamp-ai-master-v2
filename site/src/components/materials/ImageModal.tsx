import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ImageModal({ isOpen, onClose, children }: ImageModalProps) {
  const [scale, setScale] = useState(2.5); // Default 250%
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isOpen) return;

      e.preventDefault();
      const delta = e.deltaY * -0.002;
      setScale((prev) => Math.min(Math.max(1, prev + delta), 8));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === contentRef.current || contentRef.current?.contains(e.target as Node)) {
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStartRef.current = {
          x: e.clientX - positionRef.current.x,
          y: e.clientY - positionRef.current.y,
        };
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const newPosition = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
      positionRef.current = newPosition;
      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'unset';

      // Reset on close
      if (!isOpen) {
        setScale(2.5);
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
        positionRef.current = { x: 0, y: 0 };
        isDraggingRef.current = false;
      }
    };
  }, [isOpen, onClose]); // Only depend on isOpen and onClose

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="modal-zoom-indicator">
          滚动缩放 {Math.round(scale * 100)}% | 拖动移动
        </div>
        <div
          className={`modal-body ${isDragging ? 'dragging' : ''}`}
          ref={contentRef}
        >
          <div
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
