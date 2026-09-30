import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Square, Shrink } from 'lucide-react';
import { getImageUrl } from '../../utils/url';

export interface Slide {
  image: string;
  alt?: string;
  caption?: string;
}

interface PresentationCarouselProps {
  slides: Slide[];
  title?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

function resolveImageUrl(imagePath: string): string {
  // If it's already an absolute URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Use the shared getImageUrl utility
  return getImageUrl(imagePath);
}

export default function PresentationCarousel({
  slides,
  title,
  autoPlay = false,
  autoPlayInterval = 5000,
}: PresentationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMaximized = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen();
        } else if (isMaximized) {
          setIsMaximized(false);
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMaximized();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPrevious, goToNext, isFullscreen, isMaximized, toggleFullscreen, toggleMaximized]);

  // Auto play
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, autoPlayInterval, goToNext]);

  // Process slides to resolve image URLs
  const processedSlides = useMemo(() => {
    return slides.map(slide => ({
      ...slide,
      image: resolveImageUrl(slide.image),
    }));
  }, [slides]);

  const currentSlide = processedSlides[currentIndex];

  return (
    <div
      ref={containerRef}
      className={`presentation-carousel ${isFullscreen ? 'fullscreen' : ''} ${isMaximized ? 'maximized' : ''}`}
    >
      {/* Header */}
      <div className="carousel-header">
        <div className="carousel-title">
          {title && <h3>{title}</h3>}
          <span className="slide-counter">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>
        <div className="carousel-controls">
          <button
            className="control-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? '暂停自动播放' : '开始自动播放'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
          <button
            className="control-btn"
            onClick={toggleMaximized}
            title={isMaximized ? '退出最大化 (M)' : '最大化 (M)'}
          >
            {isMaximized ? <Shrink size={20} /> : <Square size={20} />}
          </button>
          <button
            className="control-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? '退出全屏 (F)' : '全屏播放 (F)'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          {(isFullscreen || isMaximized) && (
            <button
              className="control-btn close-btn"
              onClick={() => {
                if (isFullscreen) {
                  document.exitFullscreen();
                }
                if (isMaximized) {
                  setIsMaximized(false);
                }
              }}
              title="退出 (Esc)"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main slide area */}
      <div className="carousel-main">
        <button
          className="nav-btn nav-prev"
          onClick={goToPrevious}
          aria-label="上一张"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="slide-container">
          <img
            src={currentSlide.image}
            alt={currentSlide.alt || `Slide ${currentIndex + 1}`}
            className="slide-image"
          />
          {currentSlide.caption && (
            <div className="slide-caption">{currentSlide.caption}</div>
          )}
        </div>

        <button
          className="nav-btn nav-next"
          onClick={goToNext}
          aria-label="下一张"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Thumbnail navigation */}
      <div className="carousel-thumbnails">
        {processedSlides.map((slide, index) => (
          <button
            key={index}
            className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`跳转到第 ${index + 1} 张幻灯片`}
          >
            <img src={slide.image} alt={slide.alt || `Thumbnail ${index + 1}`} />
          </button>
        ))}
      </div>

      {/* Keyboard hints */}
      <div className="keyboard-hints">
        <span>← → 切换</span>
        <span>空格 播放/暂停</span>
        <span>M 最大化</span>
        <span>F 全屏</span>
      </div>
    </div>
  );
}
