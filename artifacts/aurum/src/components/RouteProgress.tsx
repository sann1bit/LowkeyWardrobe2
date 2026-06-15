import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

export function RouteProgress() {
  const [location] = useLocation();
  const prevLocation = useRef(location);
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => timers.current.forEach(clearTimeout);

  useEffect(() => {
    if (location === prevLocation.current) return;
    prevLocation.current = location;

    clearTimers();
    setVisible(true);
    setWidth(0);

    const t1 = setTimeout(() => setWidth(82), 20);
    const t2 = setTimeout(() => setWidth(100), 550);
    const t3 = setTimeout(() => { setVisible(false); setWidth(0); }, 850);
    timers.current = [t1, t2, t3];

    return clearTimers;
  }, [location]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] h-[2px] pointer-events-none"
      style={{
        width: `${width}%`,
        background: 'var(--loader-line)',
        opacity: visible ? 1 : 0,
        transition: width === 0
          ? 'none'
          : 'width 0.55s ease-out, opacity 0.3s ease',
      }}
    />
  );
}
