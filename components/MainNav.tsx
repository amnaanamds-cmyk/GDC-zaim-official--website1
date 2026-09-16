'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { NAV } from '@/lib/nav';

/**
 * Primary navigation. Dropdowns open on click (not hover) so they work on
 * touch, close on Escape or an outside click, and collapse into a full-screen
 * panel below 1080px.
 */
export default function MainNav({ t }: { t: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenu(null);
        setOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open && window.innerWidth <= 1080 ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isCurrent = (href: string) => {
    const path = href.split('#')[0];
    return path === '/' ? pathname === '/' : pathname.startsWith(path);
  };

  return (
    <>
      <nav
        className={`main-nav${open ? ' open' : ''}`}
        id="primary-nav"
        aria-label="Primary navigation"
        ref={navRef}
      >
        <ul className="nav-list">
          {NAV.map((item) => {
            const label = t[item.key] ?? item.label;
            if (!item.children) {
              return (
                <li className="nav-item" key={item.key}>
                  <Link
                    className="nav-link"
                    href={item.href!}
                    aria-current={isCurrent(item.href!) ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            }
            const isOpen = menu === item.key;
            const active = item.children.some((c) => isCurrent(c.href));
            return (
              <li className={`nav-item has-menu${isOpen ? ' open' : ''}`} key={item.key}>
                <button
                  type="button"
                  className="nav-link"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMenu(isOpen ? null : item.key)}
                >
                  <span>{label}</span>
                  <Icon name="caret" className="caret" />
                </button>
                <ul className="nav-menu">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href}>{t[child.key] ?? child.label}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-nav"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? 'close' : 'menu'} />
      </button>
    </>
  );
}
