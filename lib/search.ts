import 'server-only';
import { db } from './db';

export type SearchHit = {
  type: string;
  title: string;
  snippet: string;
  href: string;
  meta?: string;
};

/**
 * Site-wide search (SRS §22). Runs one case-insensitive query per content type
 * against Postgres — nothing is indexed in the browser, so results always
 * reflect what is actually published.
 */
export async function searchSite(rawQuery: string): Promise<SearchHit[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const like = { contains: q, mode: 'insensitive' as const };

  const [departments, faculty, notices, events, programmes, books, downloads, scholarships, facilities] =
    await Promise.all([
      db.department.findMany({
        where: { OR: [{ name: like }, { intro: like }, { hodName: like }] },
        take: 8,
      }),
      db.faculty.findMany({
        where: { OR: [{ name: like }, { specialization: like }, { designation: like }, { qualification: like }] },
        take: 8,
      }),
      db.notice.findMany({
        where: { OR: [{ title: like }, { body: like }] },
        orderBy: { publishAt: 'desc' },
        take: 10,
      }),
      db.event.findMany({ where: { OR: [{ title: like }, { summary: like }, { venue: like }] }, take: 8 }),
      db.programme.findMany({ where: { OR: [{ name: like }, { eligibility: like }] }, take: 8 }),
      db.book.findMany({ where: { OR: [{ title: like }, { author: like }, { isbn: like }, { category: like }] }, take: 8 }),
      db.download.findMany({ where: { OR: [{ title: like }, { category: like }] }, take: 8 }),
      db.scholarship.findMany({ where: { OR: [{ name: like }, { provider: like }, { eligibility: like }] }, take: 6 }),
      db.facility.findMany({ where: { OR: [{ name: like }, { detail: like }] }, take: 6 }),
    ]);

  const hits: SearchHit[] = [
    ...departments.map((d) => ({
      type: 'Department', title: d.name, snippet: d.intro, href: `/departments/${d.slug}`, meta: `HOD: ${d.hodName}`,
    })),
    ...faculty.map((f) => ({
      type: 'Faculty', title: f.name, snippet: `${f.qualification} · ${f.specialization}`,
      href: `/faculty?q=${encodeURIComponent(f.name)}`, meta: f.designation,
    })),
    ...notices.map((n) => ({
      type: 'Notice', title: n.title, snippet: n.body, href: `/notices/${n.id}`, meta: n.category,
    })),
    ...events.map((e) => ({
      type: 'Event', title: e.title, snippet: e.summary, href: `/events#${e.slug}`, meta: e.venue,
    })),
    ...programmes.map((p) => ({
      type: 'Programme', title: p.name, snippet: p.eligibility, href: '/academics#programs', meta: p.level,
    })),
    ...books.map((b) => ({
      type: 'Library Book', title: b.title, snippet: `${b.author} · ${b.category}`,
      href: `/library?q=${encodeURIComponent(b.title)}`, meta: `Shelf ${b.shelf}`,
    })),
    ...downloads.map((d) => ({
      type: 'Document', title: d.title, snippet: `${d.category} · ${d.fileType}`, href: '/downloads', meta: d.category,
    })),
    ...scholarships.map((s) => ({
      type: 'Scholarship', title: s.name, snippet: s.eligibility, href: '/scholarships', meta: s.provider,
    })),
    ...facilities.map((f) => ({
      type: 'Facility', title: f.name, snippet: f.detail, href: '/facilities', meta: 'Campus facility',
    })),
  ];

  // Title matches first, then everything else.
  const lower = q.toLowerCase();
  return hits.sort((a, b) => {
    const aScore = a.title.toLowerCase().includes(lower) ? 0 : 1;
    const bScore = b.title.toLowerCase().includes(lower) ? 0 : 1;
    return aScore - bScore;
  });
}
