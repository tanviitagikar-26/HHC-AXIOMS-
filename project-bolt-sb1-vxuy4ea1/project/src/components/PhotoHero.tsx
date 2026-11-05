import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type HeroSlide = { src: string; alt: string };

const slideDurationMs = 6000;
const swipeThresholdPx = 40;

type PhotoHeroProps = {
  eyebrow: string;
  title: string;
  text: string;
  slides: HeroSlide[];
  label: string;
  variant?: 'page' | 'home' | 'quality';
  children?: ReactNode;
};

export function PhotoHero({ eyebrow, title, text, slides, label, variant = 'page', children }: PhotoHeroProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const swipeStartX = useRef<number | null>(null);
  const currentIndex = slides.length ? Math.min(active, slides.length - 1) : 0;
  const isHome = variant === 'home';
  const isQuality = variant === 'quality';

  useEffect(() => {
    if (paused || reduceMotion || slides.length < 2) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), slideDurationMs);
    return () => window.clearInterval(timer);
  }, [currentIndex, paused, reduceMotion, slides.length]);

  function goTo(index: number) {
    if (!slides.length) return;
    setActive((index + slides.length) % slides.length);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    swipeStartX.current = event.clientX;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (swipeStartX.current === null) return;
    const distance = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(distance) > swipeThresholdPx) goTo(currentIndex + (distance < 0 ? 1 : -1));
  }

  return (
    <section
      className={`${isHome ? 'hero home-photo-hero' : 'page-intro'} photo-hero${isQuality ? ' quality-photo-hero' : ''}`}
      aria-roledescription="carousel"
      aria-label={`${label} photo slideshow`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="photo-hero-slider"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { swipeStartX.current = null; }}
      >
        <div className="photo-hero-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {slides.map((slide, index) => (
            <div className="photo-hero-slide" key={`${slide.src}-${index}`} aria-hidden={index !== currentIndex}>
              <img src={slide.src} alt={slide.alt} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
            </div>
          ))}
        </div>
      </div>
      <div className={isHome ? 'photo-hero-overlay home-photo-overlay' : 'photo-hero-overlay'} aria-hidden="true" />
      <div className={`container ${isHome ? 'hero-content' : 'page-intro-inner'} photo-hero-content`}>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className={isHome ? 'hero-copy' : 'intro-copy'}>{text}</p>
        {children}
        {slides.length > 1 && <div className="photo-hero-controls">
          <div className="photo-hero-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                className={index === currentIndex ? 'photo-hero-dot is-active' : 'photo-hero-dot'}
                onClick={() => goTo(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>
          <div className="photo-hero-nav">
            <button className="photo-hero-arrow" onClick={() => goTo(currentIndex - 1)} aria-label="Previous photo"><ChevronLeft size={20} /></button>
            <button className="photo-hero-arrow" onClick={() => goTo(currentIndex + 1)} aria-label="Next photo"><ChevronRight size={20} /></button>
          </div>
        </div>}
      </div>
      {isHome && <div className="hero-stamp"><span>01</span><span>Built for<br />better briefs</span></div>}
    </section>
  );
}
