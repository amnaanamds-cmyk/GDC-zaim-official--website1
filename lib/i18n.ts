import { cookies } from 'next/headers';

export const LOCALES = ['en', 'ur'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = 'gdc_lang';

/**
 * The locale is a cookie read on the server, so pages render in the chosen
 * language on the first response — no flash, and it works with JavaScript off.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === 'ur' ? 'ur' : 'en';
}

type Dict = Record<string, string>;

const ur: Dict = {
  'nav.home': 'صفحۂ اول',
  'nav.about': 'کالج کا تعارف',
  'nav.about.college': 'کالج کے بارے میں',
  'nav.about.principal': 'پرنسپل کا پیغام',
  'nav.about.admin': 'انتظامیہ',
  'nav.about.facilities': 'سہولیات',
  'nav.academics': 'تعلیمی امور',
  'nav.academics.departments': 'شعبہ جات',
  'nav.academics.programs': 'پروگرامز و کورسز',
  'nav.academics.faculty': 'اساتذہ',
  'nav.academics.exams': 'امتحانات و نتائج',
  'nav.admissions': 'داخلے',
  'nav.admissions.main': 'داخلہ معلومات',
  'nav.admissions.scholarships': 'وظائف',
  'nav.admissions.downloads': 'ڈاؤن لوڈز',
  'nav.campus': 'کیمپس لائف',
  'nav.campus.notices': 'اعلانات',
  'nav.campus.events': 'تقریبات',
  'nav.campus.gallery': 'گیلری',
  'nav.campus.library': 'لائبریری',
  'nav.campus.services': 'طلبہ سہولیات',
  'nav.campus.alumni': 'سابق طلبہ و روزگار',
  'nav.contact': 'رابطہ',
  'nav.portal': 'پورٹل لاگ ان',
  'nav.search': 'تلاش',
  'site.name': 'گورنمنٹ ڈگری کالج زعیم',
  'site.short': 'جی ڈی سی زعیم',
  'site.dept': 'محکمہ اعلیٰ تعلیم',
  'common.readMore': 'مزید پڑھیں',
  'common.viewAll': 'تمام دیکھیں',
  'common.download': 'ڈاؤن لوڈ',
  'common.quickLinks': 'فوری روابط',
  'home.hero.title': 'گورنمنٹ ڈگری کالج زعیم',
  'home.hero.lead':
    'علم، کردار اور خدمت کی روایت — نو شعبہ جات، گیارہ ڈگری پروگرامز اور ایک ایسا کیمپس جو ہر طالب علم کے لیے کھلا ہے۔',
  'home.noticesTitle': 'تازہ ترین اعلانات',
  'home.eventsTitle': 'آنے والی تقریبات',
  'home.deptTitle': 'شعبہ جات',
  'home.principalTitle': 'پرنسپل کا پیغام',
  'home.admissionsTitle': 'داخلے جاری ہیں',
  'footer.quickLinks': 'فوری روابط',
  'footer.academics': 'تعلیمی امور',
  'footer.contact': 'رابطہ',
  'footer.rights': 'جملہ حقوق محفوظ ہیں',
};

/**
 * Returns a translator. Urdu covers navigation, headings and labels; anything
 * without a translation falls back to the English text passed in, so a missing
 * key degrades to English rather than to a blank or a key name.
 */
export function translator(locale: Locale) {
  return (key: string, fallback: string) => (locale === 'ur' ? ur[key] ?? fallback : fallback);
}

export type T = ReturnType<typeof translator>;
