import { useRef, useState, useEffect, Children, cloneElement, isValidElement } from 'react';
import { motion } from 'motion/react';

const MagnifyItem = ({ children, containerRef, cursorY, isHovering }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isHovering || cursorY == null) {
      setScale(1); setOpacity(1); return;
    }
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const dist = Math.abs(center - cursorY);
    let s: number;
    if (dist < 28) s = 1.20;
    else if (dist < 60) s = 1.11 + (60 - dist) / 32 * 0.09;
    else if (dist < 110) s = 1.04 + (110 - dist) / 50 * 0.07;
    else s = 1 + 0.20 * Math.exp(-dist / 70);
    s = Math.min(1.20, Math.max(1, s));
    const t = Math.min(dist / 160, 1);
    setScale(s);
    setOpacity(Math.max(0.88, 1 - t * 0.14));
  }, [cursorY, isHovering]);

  useEffect(() => {
    const c = containerRef?.current;
    if (!c || !isHovering) return;
    const onScroll = () => {
      const el = ref.current;
      if (!el || cursorY == null) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - cursorY);
      let s: number;
      if (dist < 28) s = 1.20;
      else if (dist < 60) s = 1.11 + (60 - dist) / 32 * 0.09;
      else if (dist < 110) s = 1.04 + (110 - dist) / 50 * 0.07;
      else s = 1 + 0.20 * Math.exp(-dist / 70);
      s = Math.min(1.20, Math.max(1, s));
      const t = Math.min(dist / 160, 1);
      setScale(s);
      setOpacity(Math.max(0.88, 1 - t * 0.14));
    };
    c.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { c.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [containerRef, cursorY, isHovering]);

  return (
    <motion.div
      ref={ref}
      animate={{ scale: isHovering ? scale : 1, opacity: isHovering ? opacity : 1 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'center center', willChange: 'transform, opacity' }}
    >
      <div style={{ borderRadius: 12, boxShadow: scale > 1.12 ? '0 0 0 1px rgba(255,255,255,0.07), 0 6px 20px rgba(0,0,0,0.30)' : 'none' }}>
        {children}
      </div>
    </motion.div>
  );
};

export const MagnifyList = ({ children, className = '', style }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [cursorY, setCursorY] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const items = Children.toArray(children);
  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setCursorY(null); }}
      onMouseMove={(e) => { if (!isHovering) setIsHovering(true); setCursorY(e.clientY); }}
    >
      {items.map((child: any, i) =>
        isValidElement(child) ? (
          <MagnifyItem key={child.key ?? i} containerRef={ref} cursorY={cursorY} isHovering={isHovering}>
            {child}
          </MagnifyItem>
        ) : (
          <MagnifyItem key={i} containerRef={ref} cursorY={cursorY} isHovering={isHovering}>{child}</MagnifyItem>
        )
      )}
    </div>
  );
};
export default MagnifyList;
