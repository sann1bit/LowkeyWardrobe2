import { useEffect, useState } from 'react';

export function PageLoader() {
  const [fadeOut, setFadeOut] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 800);
    const t2 = setTimeout(() => setGone(true), 1250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center pointer-events-none"
      style={{
        background: 'var(--loader-bg)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 400ms ease-out',
      }}
    >
      <p
        className="font-serif italic text-black mb-8 select-none"
        style={{ fontSize: '15px', letterSpacing: '0.35em', textTransform: 'uppercase' }}
      >
        Lowkey Wardrobe
      </p>
      <div className="relative overflow-hidden" style={{ width: '180px', height: '1px', background: '#E0E0E0' }}>
        <div
          className="absolute inset-y-0 left-0 loader-line-animate"
          style={{ background: 'var(--loader-line)' }}
        />
      </div>
    </div>
  );
}
