/**
 * Grading rules for the college, applied server-side so a grade can never be
 * set by whatever the browser happens to send.
 *
 * Course total = sessional (25) + mid-term (25) + final (50).
 * The scale matches the one published on the Academics page.
 */
export const GRADE_SCALE: { min: number; grade: string; point: number }[] = [
  { min: 85, grade: 'A', point: 4.0 },
  { min: 80, grade: 'A-', point: 3.7 },
  { min: 75, grade: 'B+', point: 3.3 },
  { min: 70, grade: 'B', point: 3.0 },
  { min: 65, grade: 'B-', point: 2.7 },
  { min: 60, grade: 'C+', point: 2.3 },
  { min: 55, grade: 'C', point: 2.0 },
  { min: 50, grade: 'D', point: 1.0 },
  { min: 0, grade: 'F', point: 0.0 },
];

export const ATTENDANCE_THRESHOLD = 75;

export function totalMarks(m: { sessional?: number | null; midterm?: number | null; finalExam?: number | null }) {
  const parts = [m.sessional, m.midterm, m.finalExam].filter(
    (v): v is number => typeof v === 'number',
  );
  if (!parts.length) return null;
  return parts.reduce((a, b) => a + b, 0);
}

export function gradeFor(total: number | null) {
  if (total === null) return null;
  return GRADE_SCALE.find((g) => total >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1];
}

/** Credit-weighted GPA across a set of graded courses. */
export function gpa(rows: { total: number | null; creditHours: number }[]) {
  const graded = rows.filter((r) => r.total !== null);
  if (!graded.length) return null;
  const credits = graded.reduce((sum, r) => sum + r.creditHours, 0);
  if (!credits) return null;
  const points = graded.reduce(
    (sum, r) => sum + (gradeFor(r.total)?.point ?? 0) * r.creditHours,
    0,
  );
  return Math.round((points / credits) * 100) / 100;
}

export function attendancePercent(present: number, total: number) {
  if (!total) return null;
  return Math.round((present / total) * 100);
}
