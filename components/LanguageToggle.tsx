'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/app/actions/preferences';
import Icon from './Icon';
import type { Locale } from '@/lib/i18n';

export default function LanguageToggle({ locale }: { locale: Locale }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const next: Locale = locale === 'ur' ? 'en' : 'ur';

  return (
    <button
      type="button"
      className="icon-btn lang-btn"
      aria-label={locale === 'ur' ? 'Switch to English' : 'اردو میں دیکھیں'}
      title={locale === 'ur' ? 'Switch to English' : 'اردو میں دیکھیں'}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
    >
      <Icon name="globe" />
      <span>{locale === 'ur' ? 'English' : 'اردو'}</span>
    </button>
  );
}
