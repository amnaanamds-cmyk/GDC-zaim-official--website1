import { cache } from 'react';
import type { Institution } from '@prisma/client';
import { db } from './db';
import type { Locale } from './i18n';

/**
 * The institution this deployment belongs to.
 *
 * Nothing here is hardcoded: a copy of this repository pointed at an empty
 * database knows nothing about any college until someone completes the wizard
 * at /setup. That is what makes the same code usable by any institution.
 *
 * Cached per request, so a page that shows the college's name in a dozen
 * places still makes one query.
 */
export const getInstitution = cache(
  async (): Promise<Institution | null> => db.institution.findUnique({ where: { id: 'institution' } }),
);

/** True once a college has been set up here. */
export async function isConfigured(): Promise<boolean> {
  return (await getInstitution()) !== null;
}

/**
 * Stand-in used only if a page somehow renders before setup has run. The
 * wizard redirect should make this unreachable; it exists so that a missing
 * row is a placeholder rather than a crash.
 */
const PLACEHOLDER = {
  id: 'institution',
  name: 'Your College',
  nameUr: 'آپ کا کالج',
  shortName: 'Your College',
  shortNameUr: 'آپ کا کالج',
  department: 'Higher Education Department',
  departmentUr: 'محکمہ اعلیٰ تعلیم',
  established: new Date().getFullYear(),
  affiliation: '',
  crestPath: null,
  address: '',
  addressUr: '',
  district: '',
  phone: '',
  admissionsPhone: '',
  email: '',
  admissionsEmail: '',
  officeHours: 'Monday – Friday, 08:00 – 14:00',
  principalName: '',
  principalDesignation: 'Principal',
  principalQualification: '',
  principalMessage: '',
  tagline: '',
  taglineUr: '',
  aboutLead: '',
  historyBody: '',
  setupCompletedAt: null,
  updatedAt: new Date(),
} satisfies Institution;

/** The institution, or the placeholder if setup has not run. Never null. */
export async function site(): Promise<Institution> {
  return (await getInstitution()) ?? PLACEHOLDER;
}

/* ------------------------------------------------------------------ *
 * Derived text
 *
 * The narrative fields are optional. A college that has not written its own
 * history or principal's message still gets a page that reads properly,
 * generated from the facts it did enter.
 * ------------------------------------------------------------------ */

/** Splits a stored block into paragraphs, ignoring stray blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Years since the college was founded. */
export function yearsSince(inst: Pick<Institution, 'established'>): number {
  return Math.max(0, new Date().getFullYear() - inst.established);
}

export function historyParagraphs(inst: Institution): string[] {
  const written = paragraphs(inst.historyBody);
  if (written.length) return written;

  const years = yearsSince(inst);
  return [
    `${inst.name} was established in ${inst.established}${
      inst.district ? ` to serve the students of ${inst.district} and the surrounding districts` : ''
    }. ${
      years > 0
        ? `In the ${years} year${years === 1 ? '' : 's'} since, it has grown into the institution described on these pages.`
        : ''
    }`.trim(),
  ];
}

export function principalParagraphs(inst: Institution): string[] {
  const written = paragraphs(inst.principalMessage);
  if (written.length) return written;
  if (!inst.principalName) return [];

  return [
    `Welcome to ${inst.name}. This website and management portal puts admissions, attendance, results, library services and official notices in one transparent place, open to students, parents and faculty alike.`,
  ];
}

export function aboutLeadOf(inst: Institution): string {
  return (
    inst.aboutLead ||
    `Established in ${inst.established}${inst.department ? ` under the ${inst.department}` : ''}, ${
      inst.name
    } provides affordable, high-quality higher education${
      inst.district ? ` to students across ${inst.district} and the surrounding districts` : ''
    }.`
  );
}

export function taglineOf(inst: Institution): string {
  return (
    inst.tagline ||
    `Knowledge, character and service since ${inst.established}. A campus built around the students of ${
      inst.district || 'this district'
    }.`
  );
}

/**
 * The institution's own words in the reader's language, falling back to
 * English whenever a college has not supplied the Urdu version.
 */
export function localised(inst: Institution, locale: Locale) {
  const ur = locale === 'ur';
  const pick = (urdu: string, english: string) => (ur && urdu ? urdu : english);

  return {
    name: pick(inst.nameUr, inst.name),
    shortName: pick(inst.shortNameUr, inst.shortName),
    department: pick(inst.departmentUr, inst.department),
    address: pick(inst.addressUr, inst.address),
    tagline: pick(inst.taglineUr, taglineOf(inst)),
  };
}

/**
 * A departmental address at this college — `scholarships`, `library`,
 * `exams` and so on.
 *
 * Only the college's main address is stored; the rest are derived from its
 * domain, so a new institution gets a consistent set of addresses the moment
 * it enters one, without filling in a dozen separate fields. If the main
 * address is missing or malformed, callers fall back to it rather than
 * printing something invalid.
 */
export function mailbox(inst: Institution, name: string): string {
  const domain = inst.email.split('@')[1];
  return domain ? `${name}@${domain}` : inst.email;
}

/**
 * A short code for this institution, used to prefix application and request
 * references — "GDC Zaim" becomes "GDCZ", "City College" becomes "CC".
 *
 * Words already written in capitals are kept whole, because an abbreviation
 * like GDC is the recognisable part of the name; ordinary words contribute
 * their initial.
 */
export function instCode(inst: Pick<Institution, 'shortName'>): string {
  const words = inst.shortName.replace(/[^A-Za-z ]/g, ' ').split(/\s+/).filter(Boolean);
  const code = words.map((w) => (w === w.toUpperCase() ? w : w[0])).join('');
  return (code || 'COL').toUpperCase().slice(0, 6);
}
