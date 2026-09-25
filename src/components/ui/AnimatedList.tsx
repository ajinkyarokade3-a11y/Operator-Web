import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import './AnimatedList.css';

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick, containerRef, cursorY, isHovering }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [styleState, setStyleState] = useState({ scale: 1, opacity: 1 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isHovering || cursorY == null) {
      // Avoid a state update (and re-render) when already at rest values.
      setStyleState((prev) => (prev.scale === 1 && prev.opacity === 1 ? prev : { scale: 1, opacity: 1 }));
      return;
    }
    const rect = el.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(itemCenter - cursorY);
    const t = Math.min(distance / 160, 1);
    const intensity = Math.exp(-distance / 70);
    const scale = 1 + 0.20 * intensity;
    let clampedScale: number;
    if (distance < 28) clampedScale = 1.20;
    else if (distance < 60) clampedScale = 1.11 + (60 - distance) / 32 * 0.09;
    else if (distance < 110) clampedScale = 1.04 + (110 - distance) / 50 * 0.07;
    else clampedScale = scale;
    clampedScale = Math.min(1.20, Math.max(1, clampedScale));
    const opacity = 1 - t * 0.14;
    const next = { scale: clampedScale, opacity: Math.max(0.88, opacity) };
    // Same values → keep previous object identity so we don't re-render in a
    // hover/scroll-driven update cycle.
    setStyleState((prev) => (Math.abs(prev.scale - next.scale) < 1e-4 && Math.abs(prev.opacity - next.opacity) < 1e-4 ? prev : next));
  }, [cursorY, isHovering]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !isHovering) return;
    const onScroll = () => {
      const el = ref.current;
      if (!el || cursorY == null) return;
      const rect = el.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenter - cursorY);
      const t = Math.min(distance / 160, 1);
      const intensity = Math.exp(-distance / 70);
      const scale = 1 + 0.20 * intensity;
      let clampedScale: number;
      if (distance < 28) clampedScale = 1.20;
      else if (distance < 60) clampedScale = 1.11 + (60 - distance) / 32 * 0.09;
      else if (distance < 110) clampedScale = 1.04 + (110 - distance) / 50 * 0.07;
      else clampedScale = scale;
      clampedScale = Math.min(1.20, Math.max(1, clampedScale));
      const opacity = 1 - t * 0.14;
      const next = { scale: clampedScale, opacity: Math.max(0.88, opacity) };
      setStyleState((prev) => (Math.abs(prev.scale - next.scale) < 1e-4 && Math.abs(prev.opacity - next.opacity) < 1e-4 ? prev : next));
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [containerRef, cursorY, isHovering]);

  const displayScale = isHovering ? styleState.scale : 1;
  const displayOpacity = isHovering ? styleState.opacity : 1;

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      animate={{ scale: displayScale, opacity: displayOpacity }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1], delay: delay * 0.2 }}
      style={{ marginBottom: '0.5rem', cursor: 'pointer', transformOrigin: 'center center', willChange: 'transform, opacity' }}
    >
      <div style={{ transition: 'box-shadow 0.24s ease', boxShadow: displayScale > 1.12 ? '0 0 0 1px var(--color-border), var(--shadow-subtle)' : 'none', borderRadius: 12 }}>
        {children}
      </div>
    </motion.div>
  );
};

const AnimatedList = ({
  items = ['Item 1','Item 2','Item 3','Item 4','Item 5','Item 6','Item 7','Item 8','Item 9','Item 10','Item 11','Item 12','Item 13','Item 14','Item 15'],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  renderItem,
}: any) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const [cursorY, setCursorY] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleItemMouseEnter = useCallback((index: number) => setSelectedIndex(index), []);
  const handleItemClick = useCallback((item: any, index: number) => {
    setSelectedIndex(index);
    onItemSelect?.(item, index);
  }, [onItemSelect]);

  const handleScroll = useCallback((e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  }, []);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault(); setKeyboardNav(true); setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault(); setKeyboardNav(true); setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault(); onItemSelect?.(items[selectedIndex], selectedIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const containerHeight = container.clientHeight;
      const itemTop = (selectedItem as HTMLElement).offsetTop;
      const itemHeight = (selectedItem as HTMLElement).offsetHeight;
      const targetTop = itemTop - containerHeight / 2 + itemHeight / 2;
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div
      className={`scroll-list-container ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setCursorY(null); }}
      onMouseMove={(e) => {
        if (!isHovering) setIsHovering(true);
        setCursorY(e.clientY);
      }}
    >
      <div ref={listRef} className={`scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`} onScroll={handleScroll} style={{ maxHeight: '100%' }}>
        {items.map((item: any, index: number) => (
          <AnimatedItem key={index} delay={0.03} index={index} containerRef={listRef} cursorY={cursorY} isHovering={isHovering} onMouseEnter={() => handleItemMouseEnter(index)} onClick={() => handleItemClick(item, index)}>
            <div className={`item ${selectedIndex === index ? 'selected' : ''} ${itemClassName}`}>
              {renderItem ? renderItem(item, index, selectedIndex === index) : <p className="item-text">{item}</p>}
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }}></div>
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }}></div>
        </>
      )}
    </div>
  );
};
export default AnimatedList;
