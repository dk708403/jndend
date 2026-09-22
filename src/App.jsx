import { useRef, useState, useEffect, useMemo } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';
import './App.css';

/* ═══════════════════════════════════════════════════
   ANIMATION HELPERS & CONSTANTS
   ═══════════════════════════════════════════════════ */
const EASE_LUXURY = [0.19, 1, 0.22, 1];
const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94];

/* ═══════════════════════════════════════════════════
   HOOK: useMouseParallax
   ═══════════════════════════════════════════════════ */
function useMouseParallax(strength = 20) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 30 });
  const springY = useSpring(y, { stiffness: 50, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * strength;
      const cy = (e.clientY / window.innerHeight - 0.5) * strength;
      x.set(cx);
      y.set(cy);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength, x, y]);

  return { x: springX, y: springY };
}

/* ═══════════════════════════════════════════════════
   HOOK: useCounter (animated number counting)
   ═══════════════════════════════════════════════════ */
function useCounter(end, isActive, duration = 2000) {
  const [count, setCount] = useState(0);
  const numericEnd = parseInt(end, 10) || 0;

  useEffect(() => {
    if (!isActive) return;
    let start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numericEnd));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isActive, numericEnd, duration]);

  return count;
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Custom Cursor
   ═══════════════════════════════════════════════════ */
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 300, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 300, damping: 28 });
  const [hovered, setHovered] = useState(false);
  const [viewText, setViewText] = useState('');

  useEffect(() => {
    const move = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', move);

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, .work-item, .material-card, .collection-panel').forEach((el) => {
        el.addEventListener('mouseenter', () => {
          setHovered(true);
          if (el.classList.contains('work-item')) setViewText('View');
          else if (el.classList.contains('material-card')) setViewText('Explore');
          else if (el.classList.contains('collection-panel')) setViewText('Open');
          else setViewText('');
        });
        el.addEventListener('mouseleave', () => {
          setHovered(false);
          setViewText('');
        });
      });
    };

    // Wait for DOM
    const timer = setTimeout(addHoverListeners, 1000);
    return () => {
      window.removeEventListener('mousemove', move);
      clearTimeout(timer);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="custom-cursor"
        style={{ x: springX, y: springY }}
        animate={{
          width: hovered ? 80 : 12,
          height: hovered ? 80 : 12,
          backgroundColor: hovered ? 'rgba(196, 162, 101, 0.15)' : 'rgba(44, 40, 37, 0.4)',
          border: hovered ? '1px solid rgba(196, 162, 101, 0.3)' : '1px solid transparent',
        }}
        transition={{ duration: 0.3, ease: EASE_SMOOTH }}
      >
        <AnimatePresence>
          {viewText && (
            <motion.span
              className="cursor-text"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {viewText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="custom-cursor-dot"
        style={{ x: cursorX, y: cursorY }}
        animate={{
          opacity: hovered ? 0 : 1,
          scale: hovered ? 0 : 1,
        }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Page Preloader
   ═══════════════════════════════════════════════════ */
function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 80);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="preloader"
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 1, ease: EASE_LUXURY }}
    >
      <motion.div
        className="preloader-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="preloader-brand">A. Moreau</div>
        <div className="preloader-line">
          <motion.div
            className="preloader-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="preloader-percent">{Math.min(Math.round(progress), 100)}</div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Text Reveal (word-by-word)
   ═══════════════════════════════════════════════════ */
function TextReveal({ children, className = '', delay = 0, as = 'div' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const words = children.split(' ');
  const Tag = motion[as] || motion.div;

  return (
    <Tag ref={ref} className={`text-reveal ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="text-reveal-word-wrap">
          <motion.span
            className="text-reveal-word"
            initial={{ y: '110%', rotate: 3 }}
            animate={isInView ? { y: '0%', rotate: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.04,
              ease: EASE_LUXURY,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Line Reveal (animated horizontal line)
   ═══════════════════════════════════════════════════ */
function LineReveal({ delay = 0, width = '60px', color = 'var(--gold)' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className="line-reveal"
      style={{ height: '1px', background: color, opacity: 0.5 }}
      initial={{ width: 0 }}
      animate={isInView ? { width } : {}}
      transition={{ duration: 1.2, delay, ease: EASE_LUXURY }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Image Reveal (clip-path wipe)
   ═══════════════════════════════════════════════════ */
function ImageReveal({ src, alt, className = '', style = {}, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={`image-reveal ${className}`}
      style={style}
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={isInView ? { clipPath: 'inset(0% 0 0 0)' } : {}}
      transition={{ duration: 1.2, delay, ease: EASE_LUXURY }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        initial={{ scale: 1.3 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 1.6, delay, ease: EASE_LUXURY }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Floating Particles
   ═══════════════════════════════════════════════════ */
function FloatingParticles({ count = 6 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 5,
      })),
    [count]
  );

  return (
    <div className="floating-particles">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.15, 0.4, 0.2, 0.35, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Magnetic Button
   ═══════════════════════════════════════════════════ */
function MagneticButton({ children, className = '', href = '#', onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    x.set(cx * 0.3);
    y.set(cy * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      ref={ref}
      href={href}
      className={`magnetic-btn ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT: Scroll Progress Bar
   ═══════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

/* ═══════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════ */
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className={`nav ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 2.2, ease: EASE_LUXURY }}
      >
        <a href="#" className="nav-brand">A. Moreau</a>
        <ul className="nav-links">
          {['Work', 'Sketchbook', 'Collections', 'About', 'Contact'].map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.4 + i * 0.1 }}
            >
              <a href={`#${item.toLowerCase()}`}>{item}</a>
            </motion.li>
          ))}
        </ul>
        <button
          className={`nav-mobile-toggle ${mobileOpen ? 'open' : ''}`}
          aria-label="Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span></span>
          <span></span>
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.6, ease: EASE_LUXURY }}
          >
            {['Work', 'Sketchbook', 'Collections', 'About', 'Contact'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="mobile-menu-link"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="section-number">0{i + 1}</span>
                {item}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const yImg = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, -3]);
  const mouse = useMouseParallax(25);
  const mouseWeak = useMouseParallax(12);
  const mouseBg = useMouseParallax(6);

  return (
    <section className="hero" ref={ref}>
      {/* Background atmospheric shapes — mouse-tracked */}
      <div className="hero-bg-elements">
        <motion.div
          className="hero-bg-shape hero-bg-shape-1"
          style={{ x: mouseBg.x, y: mouseBg.y }}
        />
        <motion.div
          className="hero-bg-shape hero-bg-shape-2"
          style={{ x: mouseBg.x, y: mouseBg.y }}
        />
      </div>

      <FloatingParticles count={8} />

      <motion.div className="hero-inner" style={{ opacity, scale }}>
        {/* Text */}
        <motion.div className="hero-text" style={{ y: yText }}>
          <motion.div
            className="label hero-label"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
          >
            <LineReveal delay={2} width="30px" />
            <span style={{ marginLeft: '0.8rem' }}>Fashion Designer / Illustrator</span>
          </motion.div>

          <div className="hero-title">
            <TextReveal className="hero-title-line" delay={2.2} as="span">Fashion</TextReveal>
            <TextReveal className="hero-title-line italic" delay={2.4} as="span">Beyond</TextReveal>
            <TextReveal className="hero-title-line" delay={2.6} as="span">Form.</TextReveal>
          </div>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.8, ease: EASE_LUXURY }}
          >
            Fashion design, illustration and visual storytelling — exploring the space where art meets garment construction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3 }}
          >
            <MagneticButton href="#work" className="hero-cta">
              <span>Explore the work</span>
              <ArrowRight size={16} />
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* Artwork with 3D depth */}
        <motion.div className="hero-artwork" style={{ y: yImg, rotate }}>
          <motion.div
            className="hero-artwork-main"
            style={{ x: mouse.x, y: mouse.y }}
            initial={{ opacity: 0, scale: 0.85, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.4, delay: 2.2, ease: EASE_LUXURY }}
          >
            <img
              src="/hero.jpg"
              alt="Haute Couture Fashion Illustration — Champagne Evening Gown"
              loading="eager"
            />
            {/* Floating paper shadow */}
            <div className="hero-artwork-shadow" />
          </motion.div>

          <motion.img
            src="/sketch-couture.jpg"
            alt="Architectural Couture Sketch"
            className="hero-artwork-float hero-artwork-float-1"
            style={{ x: mouseWeak.x, y: mouseWeak.y }}
            initial={{ opacity: 0, y: 40, rotate: 8 }}
            animate={{ opacity: 0.4, y: 0, rotate: 4 }}
            transition={{ duration: 1.2, delay: 2.6, ease: EASE_LUXURY }}
            loading="lazy"
          />
          <motion.img
            src="/sketch-editorial.jpg"
            alt="Editorial Figure Drawing"
            className="hero-artwork-float hero-artwork-float-2"
            style={{ x: mouseWeak.x, y: mouseWeak.y }}
            initial={{ opacity: 0, y: 30, rotate: -10 }}
            animate={{ opacity: 0.35, y: 0, rotate: -6 }}
            transition={{ duration: 1.2, delay: 2.8, ease: EASE_LUXURY }}
            loading="lazy"
          />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="hero-scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 1 }}
      >
        <span className="label" style={{ fontSize: '0.6rem' }}>Scroll</span>
        <div className="hero-scroll-line" />
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   WORK / SELECTED ARTWORK SECTION
   ═══════════════════════════════════════════════════ */
const WORKS = [
  { id: 1, title: 'Silhouette Study', year: '2024', category: 'Couture Illustration', img: '/sketch-silhouette.jpg', height: '65vh', desc: 'Charcoal & graphite exploration of evening gown forms' },
  { id: 2, title: 'Couture / Form', year: '2024', category: 'Architectural Design', img: '/sketch-couture.jpg', height: '45vh', desc: 'Structured jacket & skirt ensemble studies' },
  { id: 3, title: 'Textile Experiment', year: '2023', category: 'Material Study', img: '/sketch-textile.jpg', height: '55vh', desc: 'Mixed media fabric exploration & draping' },
  { id: 4, title: 'Editorial Figure Study', year: '2024', category: 'Fashion Art', img: '/sketch-editorial.jpg', height: '60vh', desc: 'Avant-garde charcoal & champagne ink drawings' },
  { id: 5, title: 'Evening Collection', year: '2023', category: 'Ready-to-Wear', img: '/hero.jpg', height: '50vh', desc: 'Watercolor evening wear design series' },
  { id: 6, title: 'Material & Movement', year: '2024', category: 'Concept', img: '/texture.jpg', height: '40vh', desc: 'Kinetic fabric study in silk & organza' },
];

function WorkItem({ work, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const itemMouse = useMouseParallax(8);

  return (
    <motion.div
      ref={ref}
      className="work-item"
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: index * 0.12, ease: EASE_LUXURY }}
    >
      <ImageReveal
        src={work.img}
        alt={work.title}
        className="work-img-wrap"
        style={{ height: work.height }}
        delay={index * 0.12}
      />
      <motion.div
        className="work-meta"
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 + index * 0.12 }}
      >
        <div className="work-meta-left">
          <span className="work-number">0{index + 1}</span>
          <h3>{work.title}</h3>
          <span className="label">{work.category} — {work.year}</span>
          <p className="work-desc">{work.desc}</p>
        </div>
        <div className="work-view-indicator">
          <ArrowUpRight size={16} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function Work() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="work" id="work" ref={ref}>
      <div className="container">
        <div className="work-header">
          <div className="work-header-left">
            <motion.div
              className="label"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              01 / Portfolio
            </motion.div>
            <TextReveal className="work-title" delay={0.1}>Selected Work</TextReveal>
          </div>
          <motion.div
            className="section-number"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            06 Projects
          </motion.div>
        </div>

        <motion.div
          className="divider-full"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, ease: EASE_LUXURY }}
          style={{ transformOrigin: 'left', marginBottom: '4rem' }}
        />

        <div className="work-grid">
          {WORKS.map((work, i) => (
            <WorkItem key={work.id} work={work} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   SKETCHBOOK SECTION
   ═══════════════════════════════════════════════════ */
// All unique sketches for the marquee
const SKETCHES_ROW1 = [
  { img: '/sketch-silhouette.jpg', label: 'Croquis No. 42 — Evening Gown', num: '01' },
  { img: '/sketch-couture.jpg',    label: 'Construction Study — Architectural Jacket', num: '02' },
  { img: '/sketch-textile.jpg',    label: 'Draping Experiment — Silk & Organza', num: '03' },
  { img: '/sketch-editorial.jpg',  label: 'Figure Study — Charcoal & Ink', num: '04' },
];
const SKETCHES_ROW2 = [
  { img: '/hero.jpg',       label: 'Champagne Couture — Final Rendering', num: '05' },
  { img: '/texture.jpg',    label: 'Material Swatch — Silk Weave', num: '06' },
  { img: '/sketch-silhouette.jpg', label: 'Evening Volume — FW24', num: '07' },
  { img: '/sketch-couture.jpg',    label: 'Brocade Detail — SS24', num: '08' },
];

/* A single marquee row — duplicates items for seamless loop */
function MarqueeRow({ items, speed = 60, direction = 1 }) {
  // Duplicate items so we can loop seamlessly
  const doubled = [...items, ...items];
  // Calculate total width: cardWidth + gap, doubled
  // We animate from 0 to -50% (one full set width)
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="sketch-marquee-viewport"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="sketch-marquee-inner"
        animate={{
          x: direction === 1 ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        style={{
          display: 'flex',
          gap: '2.5rem',
          animationPlayState: paused ? 'paused' : 'running',
        }}
        // Framer Motion pause via whileHover doesn't affect animate loop directly,
        // so we use CSS animationPlayState via style above
      >
        {doubled.map((sketch, i) => (
          <motion.div
            key={i}
            className="sketch-card"
            style={{
              rotate: i % 3 === 0 ? 1.5 : i % 3 === 1 ? -1 : 0.5,
            }}
            whileHover={{
              y: -18,
              rotate: 0,
              scale: 1.04,
              zIndex: 10,
              transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
            }}
          >
            <div className="sketch-tape" style={{ right: i % 2 === 0 ? '20%' : '60%', transform: `rotate(${i % 2 === 0 ? -2 : 3}deg)` }} />
            <div className="sketch-card-inner">
              <img src={sketch.img} alt={sketch.label} loading="lazy" draggable="false" />
              <div className="sketch-card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {sketch.label}
                </span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.75rem', color: 'var(--taupe-light)' }}>
                  {sketch.num}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Sketchbook() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section className="sketchbook" id="sketchbook" ref={containerRef}>
      <FloatingParticles count={4} />

      <div className="container">
        <motion.div
          className="sketchbook-header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_LUXURY }}
        >
          <motion.div
            className="label"
            style={{ marginBottom: '1rem' }}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            02 / Sketchbook
          </motion.div>

          <div className="sketchbook-title">
            <TextReveal delay={0.1}>From Sketch</TextReveal>
            <TextReveal className="italic" delay={0.25}>To Silhouette.</TextReveal>
          </div>

          <motion.p
            style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '1.2rem', maxWidth: '380px', lineHeight: '1.6' }}
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            An intimate look inside the studio — raw sketches, material experiments, and the moments before a collection takes form.
          </motion.p>
          <div style={{ marginTop: '1.5rem' }}>
            <LineReveal delay={0.6} width="80px" />
          </div>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left, standard speed */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.3, ease: EASE_LUXURY }}
      >
        <MarqueeRow items={SKETCHES_ROW1} speed={55} direction={1} />
      </motion.div>

      {/* Row 2 — scrolls right (reverse), slightly faster for parallax depth */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.5, ease: EASE_LUXURY }}
        style={{ marginTop: '2rem' }}
      >
        <MarqueeRow items={SKETCHES_ROW2} speed={70} direction={-1} />
      </motion.div>

      {/* Drag-hint label */}
      <motion.div
        className="container"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '0.8rem',
          color: 'var(--taupe)',
          textAlign: 'center',
          marginTop: '3rem',
          letterSpacing: '0.05em',
        }}>
          Hover to pause
        </p>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   COLLECTIONS SECTION
   ═══════════════════════════════════════════════════ */
const COLLECTIONS = [
  {
    number: '01',
    name: 'Form / 01',
    concept: 'The Architecture of Movement',
    desc: 'An exploration of structural garment design — where geometric precision meets the fluidity of human movement.',
    img: '/sketch-couture.jpg',
    season: 'FW 2024',
  },
  {
    number: '02',
    name: 'Texture / 02',
    concept: 'Between Fabric & Light',
    desc: 'A textile-driven collection investigating how light transforms material. Raw silk organza and hand-woven jacquard are layered to create depth.',
    img: '/sketch-textile.jpg',
    season: 'SS 2024',
  },
  {
    number: '03',
    name: 'Noir / 03',
    concept: 'Structure in Silence',
    desc: 'An exercise in restraint — monochromatic charcoal and ink studies that strip fashion to its essential form.',
    img: '/sketch-editorial.jpg',
    season: 'FW 2023',
  },
];

function CollectionPanel({ collection, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <motion.div
      ref={ref}
      className="collection-panel"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1 }}
    >
      <div className="collection-visual">
        <motion.img
          src={collection.img}
          alt={collection.name}
          loading="lazy"
          style={{ y: imgY }}
        />
        <div className="collection-overlay" />
      </div>
      <div className="collection-info">
        <motion.div
          className="collection-number"
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {collection.number}
        </motion.div>
        <TextReveal className="collection-name" delay={0.3}>{collection.name}</TextReveal>
        <motion.div
          className="collection-concept"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {collection.concept}
        </motion.div>
        <motion.p
          className="collection-desc"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {collection.desc}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <MagneticButton href="#" className="collection-cta">
            <span>Explore Collection</span>
            <ArrowRight size={14} />
          </MagneticButton>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Collections() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="collections" id="collections" ref={ref}>
      <div className="container">
        <motion.div className="collections-header">
          <motion.div
            className="label"
            style={{ marginBottom: '1rem' }}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            03 / Collections
          </motion.div>
          <TextReveal className="collections-title" delay={0.1}>Collections</TextReveal>
          <LineReveal delay={0.3} width="100%" color="var(--border)" />
        </motion.div>
      </div>

      {COLLECTIONS.map((c, i) => (
        <CollectionPanel key={i} collection={c} index={i} />
      ))}
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   ABOUT SECTION
   ═══════════════════════════════════════════════════ */
function AnimatedStat({ number, label, isInView, index }) {
  const numericPart = number.replace(/[^0-9]/g, '');
  const suffix = number.replace(/[0-9]/g, '');
  const count = useCounter(numericPart, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.5 + index * 0.15 }}
    >
      <div className="about-stat-number">
        {count < 10 ? `0${count}` : count}{suffix}
      </div>
      <div className="about-stat-label">{label}</div>
    </motion.div>
  );
}

function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { number: '08+', label: 'Collections' },
    { number: '120+', label: 'Original Works' },
    { number: '06', label: 'Design Disciplines' },
  ];

  return (
    <section className="about" id="about" ref={ref}>
      <div className="container">
        <div className="about-grid">
          <motion.div
            className="about-visual"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1.2, ease: EASE_LUXURY }}
          >
            <ImageReveal src="/sketch-textile.jpg" alt="Fashion Design Workspace" />
            <motion.div
              className="about-visual-accent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.4, ease: EASE_LUXURY }}
            />
          </motion.div>

          <motion.div className="about-content">
            <motion.div
              className="label"
              style={{ marginBottom: '1.5rem' }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              04 / About
            </motion.div>

            <TextReveal className="about-title" delay={0.3}>The Designer Behind the Work.</TextReveal>

            <motion.p
              className="about-bio"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              A. Moreau is a fashion designer and illustrator based between Paris and New York,
              specializing in couture illustration, textile design, and creative direction.
              With over a decade of experience working at the intersection of art and fashion,
              each piece explores the tension between architectural structure and organic movement.
            </motion.p>

            <motion.p
              className="about-bio"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              The studio practice spans original artwork, editorial illustration, garment design,
              material exploration, and visual storytelling for luxury fashion houses and independent publications.
            </motion.p>

            <motion.blockquote
              className="about-philosophy"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.7 }}
            >
              "Fashion is not decoration — it is the architecture of the body. Every fold, every seam,
              every silhouette tells a story about who we are and who we aspire to be."
            </motion.blockquote>

            <motion.div
              className="divider-full"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.5, ease: EASE_LUXURY }}
              style={{ transformOrigin: 'left', marginBottom: '2rem' }}
            />

            <div className="about-stats">
              {stats.map((stat, i) => (
                <AnimatedStat
                  key={i}
                  number={stat.number}
                  label={stat.label}
                  isInView={isInView}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   PROCESS SECTION
   ═══════════════════════════════════════════════════ */
const STEPS = [
  { num: '01', name: 'Research', desc: 'Cultural references, historical study, and conceptual exploration' },
  { num: '02', name: 'Moodboard', desc: 'Visual narrative construction and palette development' },
  { num: '03', name: 'Sketch', desc: 'Croquis development and silhouette exploration' },
  { num: '04', name: 'Material', desc: 'Textile selection, draping experiments, and fabric testing' },
  { num: '05', name: 'Silhouette', desc: 'Three-dimensional form development and fitting' },
  { num: '06', name: 'Final Artwork', desc: 'Refined illustration and presentation-ready rendering' },
];

function Process() {
  const scrollRef = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="process" ref={ref}>
      <FloatingParticles count={3} />
      <div className="container">
        <motion.div className="process-header">
          <motion.div
            className="label"
            style={{ marginBottom: '1rem' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            05 / Process
          </motion.div>
          <TextReveal className="process-title" delay={0.1}>Creative Process</TextReveal>
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '2rem' }}
      >
        <div className="process-track" style={{ paddingLeft: 'var(--gutter)', paddingRight: 'var(--gutter)' }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              className="process-step"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.12 * i, ease: EASE_LUXURY }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <motion.div
                className="process-step-dot"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * i, type: 'spring', stiffness: 200 }}
              />
              <div className="process-step-number">{step.num}</div>
              <div className="process-step-name">{step.name}</div>
              <div className="process-step-desc">{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   MATERIALS SECTION
   ═══════════════════════════════════════════════════ */
const MATERIALS = [
  { name: 'Silk', img: '/texture.jpg' },
  { name: 'Organza', img: '/sketch-textile.jpg' },
  { name: 'Satin', img: '/texture.jpg' },
  { name: 'Lace', img: '/sketch-textile.jpg' },
];

function Materials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="materials" ref={ref}>
      <div className="container">
        <motion.div className="materials-header">
          <motion.div
            className="label"
            style={{ marginBottom: '1rem' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            06 / Materials
          </motion.div>
          <TextReveal className="materials-title" delay={0.1}>Textile & Material</TextReveal>
        </motion.div>

        <div className="materials-grid">
          {MATERIALS.map((mat, i) => (
            <motion.div
              key={i}
              className="material-card"
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.12 * i, ease: EASE_LUXURY }}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.4 },
              }}
            >
              <img src={mat.img} alt={mat.name} loading="lazy" />
              <div className="material-card-overlay">
                <span>{mat.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   STATEMENT SECTION
   ═══════════════════════════════════════════════════ */
function Statement() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.8]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <section className="statement" ref={ref}>
      <motion.div
        className="statement-bg"
        style={{ scale: bgScale, opacity: bgOpacity }}
      />
      <div className="container">
        <div className="statement-text">
          <TextReveal delay={0}>Every Garment</TextReveal>
          <TextReveal className="italic" delay={0.15}>Begins With</TextReveal>
          <TextReveal delay={0.3}>An Idea.</TextReveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   CONTACT SECTION
   ═══════════════════════════════════════════════════ */
function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="container">
        <div className="contact-inner">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: EASE_LUXURY }}
          >
            <motion.div
              className="label"
              style={{ marginBottom: '1.5rem' }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              07 / Contact
            </motion.div>
            <TextReveal className="contact-title" delay={0.2}>Let's Create Something Distinct.</TextReveal>
            <motion.p
              className="contact-description"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Available for fashion collaborations, editorial projects,
              creative direction, illustration commissions, and design consulting.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <MagneticButton href="mailto:studio@amoreau.com" className="contact-cta-btn">
                <span>Start a Project</span>
                <ArrowRight size={14} />
              </MagneticButton>
            </motion.div>
          </motion.div>

          <motion.div
            className="contact-details"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: EASE_LUXURY }}
          >
            {[
              { label: 'Email', value: 'studio@amoreau.com', href: 'mailto:studio@amoreau.com' },
              { label: 'Location', value: 'Paris — New York' },
              { label: 'Availability', value: 'Open for Q1 2025 projects' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="contact-detail-item"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              >
                <div className="label">{item.label}</div>
                {item.href
                  ? <a href={item.href}>{item.value}</a>
                  : <p>{item.value}</p>
                }
              </motion.div>
            ))}

            <motion.div
              className="contact-socials"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {['Instagram', 'Behance', 'LinkedIn'].map((s, i) => (
                <motion.a
                  key={s}
                  href="#"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  {s}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════ */
function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.footer
      className="footer"
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
    >
      <div className="footer-inner">
        <div className="footer-brand">A. Moreau</div>
        <div className="footer-links">
          {['Work', 'Sketchbook', 'Collections', 'About', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>
          ))}
        </div>
        <div className="footer-tagline">Designed with intention. © 2024</div>
      </div>
    </motion.footer>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN APPLICATION
   ═══════════════════════════════════════════════════ */
function App() {
  const [loading, setLoading] = useState(true);

  // Safety: always dismiss preloader after 4s max,
  // so a timer/animation failure never leaves a white screen.
  useEffect(() => {
    const safety = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(safety);
  }, []);

  return (
    <>
      {/* Preloader is an OVERLAY — content always renders beneath it.
          This guarantees no white screen even if onComplete never fires. */}
      <AnimatePresence>
        {loading && (
          <Preloader key="preloader" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <CustomCursor />
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Work />
        <Sketchbook />
        <Collections />
        <About />
        <Process />
        <Materials />
        <Statement />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
