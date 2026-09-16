'use client';

import { useEffect, useRef, useState } from 'react';

/** Fades content in as it scrolls into view, and does nothing at all when the
 *  visitor has asked for reduced motion. */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  ...rest
}: {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = Tag as React.ElementType;
  return (
    <Component ref={ref} className={`reveal${shown ? ' visible' : ''} ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}
