'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

type Theme = 'light' | 'dark';

function current(): Theme {
  try {
    const stored = localStorage.getItem('gdc-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* private mode — fall through to the system preference */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => setTheme(current()), []);

  function toggle() {
    const next: Theme = (theme ?? current()) === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('gdc-theme', next);
    } catch {
      /* preference simply is not remembered */
    }
    setTheme(next);
  }

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {/* Rendered only after mount so the icon matches the real theme. */}
      {theme ? <Icon name={theme === 'dark' ? 'sun' : 'moon'} /> : <span style={{ width: 18, height: 18 }} />}
    </button>
  );
}
