import type { Metadata, Viewport } from 'next';
import { getLocale } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${SITE.name}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    'Official website and management portal of Government Degree College Zaim — admissions, departments, notices, results, library and student services.',
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M32 3 57 12v22c0 14-11 24-25 27C18 58 7 48 7 34V12L32 3Z' fill='%230a3b2a' stroke='%23c8a24a' stroke-width='3'/%3E%3Cpath d='M20 40V27l12-7 12 7v13' fill='none' stroke='%23c8a24a' stroke-width='3'/%3E%3C/svg%3E",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a3b2a',
};

/** Applied before first paint so a dark-theme visitor never sees a white flash. */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('gdc-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={locale === 'ur' ? 'rtl' : 'ltr'}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
