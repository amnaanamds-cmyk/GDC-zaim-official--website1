import 'server-only';
import { db } from './db';

/** Notices that are published and not expired, newest first. */
export function publishedNotices(take?: number, where: Record<string, unknown> = {}) {
  const now = new Date();
  return db.notice.findMany({
    where: {
      publishAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      ...where,
    },
    include: { department: true },
    orderBy: [{ pinned: 'desc' }, { publishAt: 'desc' }],
    ...(take ? { take } : {}),
  });
}

export function upcomingEvents(take?: number) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return db.event.findMany({
    where: { date: { gte: today } },
    orderBy: { date: 'asc' },
    include: { _count: { select: { media: true } } },
    ...(take ? { take } : {}),
  });
}

/** Headline figures for the home page, counted from the database. */
export async function siteStats() {
  const [students, faculty, departments] = await Promise.all([
    db.student.count(),
    db.faculty.count(),
    db.department.count(),
  ]);
  return [
    { value: students, suffix: '', label: 'Enrolled Students', labelUr: 'زیرِ تعلیم طلبہ' },
    { value: faculty, suffix: '', label: 'Faculty Members', labelUr: 'اساتذہ' },
    { value: departments, suffix: '', label: 'Academic Departments', labelUr: 'شعبہ جات' },
    { value: new Date().getFullYear() - 1998, suffix: '', label: 'Years of Service', labelUr: 'سالہ خدمات' },
  ];
}
