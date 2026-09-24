/**
 * Everything a college can enter about itself.
 *
 * Each entry describes one kind of record: its fields, how to show them and
 * which public pages to refresh when it changes. One generic action and one
 * generic screen work from these specs, so adding a new kind of record is a
 * few lines here rather than another bespoke page.
 *
 * This list is also a security boundary. The action accepts a resource key
 * and field names only if they appear here, so a crafted form cannot reach a
 * table — or a column — that was never meant to be edited this way.
 */

export type RefKey = 'department' | 'programme' | 'course' | 'faculty' | 'student';

export type Field =
  | { name: string; label: string; type: 'text' | 'textarea' | 'email'; required?: boolean; max?: number; hint?: string; placeholder?: string }
  | { name: string; label: string; type: 'number'; required?: boolean; min?: number; max?: number; hint?: string }
  | { name: string; label: string; type: 'date'; required?: boolean; hint?: string }
  | { name: string; label: string; type: 'checkbox'; hint?: string }
  | { name: string; label: string; type: 'list'; hint?: string; placeholder?: string }
  | { name: string; label: string; type: 'ref'; ref: RefKey; required?: boolean; hint?: string }
  | { name: string; label: string; type: 'select'; options: readonly string[]; required?: boolean; hint?: string };

export type Resource = {
  key: ResourceKey;
  singular: string;
  plural: string;
  blurb: string;
  fields: Field[];
  /** Field names shown as table columns, in order. */
  columns: string[];
  /** Public pages that show this record and must be refreshed when it changes. */
  revalidate: string[];
  /** A field whose value is derived from another when left blank (slug from name). */
  slugFrom?: { field: string; from: string };
};

export const RESOURCE_KEYS = [
  'department',
  'programme',
  'course',
  'faculty',
  'student',
  'event',
  'facility',
  'admissionStage',
  'scholarship',
  'book',
  'alumnus',
  'career',
] as const;

export type ResourceKey = (typeof RESOURCE_KEYS)[number];

const ICONS = [
  'cpu', 'flask', 'atom', 'leaf', 'dna', 'sigma', 'book', 'chart', 'globe',
  'trophy', 'health', 'bus', 'home', 'mosque', 'users', 'file', 'cup', 'shield',
] as const;

export const RESOURCES: Record<ResourceKey, Resource> = {
  department: {
    key: 'department',
    singular: 'Department',
    plural: 'Departments',
    blurb:
      'The academic departments of the college. Programmes, courses and faculty all belong to one, so start here.',
    slugFrom: { field: 'slug', from: 'name' },
    columns: ['name', 'hodName', 'established'],
    revalidate: ['/', '/departments', '/academics', '/faculty'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'nameUr', label: 'Name in Urdu', type: 'text', max: 120, hint: 'Optional. The English name is used if this is blank.' },
      { name: 'slug', label: 'Web address', type: 'text', max: 80, hint: 'Leave blank and it is made from the name.' },
      { name: 'icon', label: 'Icon', type: 'select', options: ICONS, required: true },
      { name: 'intro', label: 'Description', type: 'textarea', required: true, max: 2000 },
      { name: 'hodName', label: 'Head of department', type: 'text', required: true, max: 120 },
      { name: 'hodDesignation', label: 'Their title', type: 'text', max: 80 },
      { name: 'established', label: 'Year established', type: 'number', min: 1800, max: 2200 },
      { name: 'email', label: 'Department email', type: 'email', max: 160 },
      { name: 'courseTitles', label: 'Courses taught', type: 'list', hint: 'One per line.' },
      { name: 'facilities', label: 'Facilities', type: 'list', hint: 'One per line.' },
      { name: 'achievements', label: 'Achievements', type: 'list', hint: 'One per line.' },
      { name: 'order', label: 'Position', type: 'number', min: 0, hint: 'Lower numbers appear first.' },
    ],
  },

  programme: {
    key: 'programme',
    singular: 'Programme',
    plural: 'Programmes',
    blurb: 'What students can enrol on. Every student belongs to one, so add these before student accounts.',
    columns: ['name', 'code', 'level', 'seats'],
    revalidate: ['/academics', '/admissions', '/departments'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 160 },
      { name: 'code', label: 'Code', type: 'text', required: true, max: 40, hint: 'Must be unique. Used in lists and forms.' },
      { name: 'departmentId', label: 'Department', type: 'ref', ref: 'department', required: true },
      { name: 'level', label: 'Level', type: 'text', required: true, max: 60, placeholder: 'Undergraduate' },
      { name: 'duration', label: 'Length', type: 'text', required: true, max: 80 },
      { name: 'seats', label: 'Sanctioned seats', type: 'number', required: true, min: 0 },
      { name: 'eligibility', label: 'Entry requirements', type: 'textarea', required: true, max: 600 },
      { name: 'fee', label: 'Fee', type: 'text', required: true, max: 120, hint: 'Written however your college states it.' },
    ],
  },

  course: {
    key: 'course',
    singular: 'Course',
    plural: 'Courses',
    blurb:
      'The courses taught each semester. A teacher marks attendance and enters marks for the courses assigned to them, so nothing in the portal works until these exist.',
    columns: ['title', 'code', 'semester', 'creditHours'],
    revalidate: ['/academics', '/departments'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { name: 'code', label: 'Code', type: 'text', required: true, max: 40, hint: 'Must be unique.' },
      { name: 'departmentId', label: 'Department', type: 'ref', ref: 'department', required: true },
      { name: 'teacherId', label: 'Taught by', type: 'ref', ref: 'faculty', hint: 'Only this teacher can mark its attendance and marks.' },
      { name: 'semester', label: 'Semester', type: 'number', required: true, min: 1, max: 12 },
      { name: 'creditHours', label: 'Credit hours', type: 'number', min: 0, max: 12 },
    ],
  },

  faculty: {
    key: 'faculty',
    singular: 'Faculty member',
    plural: 'Faculty',
    blurb:
      'Everyone who teaches here. A record can exist without a login — give it one from Accounts when they need the portal.',
    columns: ['name', 'designation', 'email'],
    revalidate: ['/faculty', '/departments'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'designation', label: 'Designation', type: 'text', required: true, max: 80 },
      { name: 'departmentId', label: 'Department', type: 'ref', ref: 'department' },
      { name: 'qualification', label: 'Qualifications', type: 'text', max: 160 },
      { name: 'specialization', label: 'Specialisation', type: 'text', max: 160 },
      { name: 'email', label: 'Email', type: 'email', required: true, max: 160, hint: 'Must be unique.' },
      { name: 'order', label: 'Position', type: 'number', min: 0 },
    ],
  },

  student: {
    key: 'student',
    singular: 'Student',
    plural: 'Students',
    blurb:
      'Enrolled students. A record can exist without a login — give it one from Accounts when the student needs to see their results.',
    columns: ['name', 'regNo', 'semester'],
    revalidate: [],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'regNo', label: 'Registration number', type: 'text', required: true, max: 60, hint: 'Must be unique. They can sign in with it.' },
      { name: 'programmeId', label: 'Programme', type: 'ref', ref: 'programme', required: true },
      { name: 'semester', label: 'Semester', type: 'number', required: true, min: 1, max: 12 },
      { name: 'duesCleared', label: 'Fees paid', type: 'checkbox' },
    ],
  },

  event: {
    key: 'event',
    singular: 'Event',
    plural: 'Events',
    blurb:
      'Seminars, sports, ceremonies and examinations. These fill the events page, the home page calendar and the examination calendar, and photographs are filed against them.',
    slugFrom: { field: 'slug', from: 'title' },
    columns: ['title', 'date', 'category', 'venue'],
    revalidate: ['/', '/events', '/academics'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { name: 'slug', label: 'Web address', type: 'text', max: 80, hint: 'Leave blank and it is made from the title.' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true, max: 600 },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'time', label: 'Time', type: 'text', required: true, max: 60, placeholder: '09:00 – 12:00' },
      { name: 'venue', label: 'Venue', type: 'text', required: true, max: 120 },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: ['Academic', 'Examination', 'Sports', 'Cultural', 'Seminar', 'Ceremony'],
        hint: 'Academic and Examination events also appear on the examination calendar.',
      },
      { name: 'registrationOpen', label: 'Accepting registrations', type: 'checkbox' },
    ],
  },

  facility: {
    key: 'facility',
    singular: 'Facility',
    plural: 'Facilities',
    blurb: 'What the campus offers — library, laboratories, transport, sports, prayer space.',
    columns: ['name', 'detail'],
    revalidate: ['/', '/facilities'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'icon', label: 'Icon', type: 'select', options: ICONS, required: true },
      { name: 'detail', label: 'Description', type: 'textarea', required: true, max: 600 },
      { name: 'order', label: 'Position', type: 'number', min: 0 },
    ],
  },

  admissionStage: {
    key: 'admissionStage',
    singular: 'Admission stage',
    plural: 'Admission schedule',
    blurb:
      'The steps of your admission cycle. The stage marked Open is the one shown on the home page and at the top of the admissions page.',
    columns: ['stage', 'dates', 'status'],
    revalidate: ['/', '/admissions'],
    fields: [
      { name: 'stage', label: 'Stage', type: 'text', required: true, max: 120 },
      { name: 'dates', label: 'Dates', type: 'text', required: true, max: 160, hint: 'Written however you state them.' },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ['Open', 'Upcoming', 'Closed'] },
      { name: 'order', label: 'Position', type: 'number', min: 0 },
    ],
  },

  scholarship: {
    key: 'scholarship',
    singular: 'Scholarship',
    plural: 'Scholarships',
    blurb: 'Scholarships and fee concessions students can apply for.',
    columns: ['name', 'provider', 'covers'],
    revalidate: ['/scholarships'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 160 },
      { name: 'provider', label: 'Provider', type: 'text', required: true, max: 160 },
      { name: 'covers', label: 'What it covers', type: 'text', required: true, max: 200 },
      { name: 'eligibility', label: 'Who can apply', type: 'textarea', required: true, max: 600 },
      { name: 'deadline', label: 'Deadline', type: 'date' },
      { name: 'deadlineNote', label: 'Note instead of a date', type: 'text', max: 120, hint: 'Such as “Rolling” or “As notified”.' },
    ],
  },

  book: {
    key: 'book',
    singular: 'Book',
    plural: 'Library catalogue',
    blurb: 'The library catalogue students can search.',
    columns: ['title', 'author', 'category', 'available'],
    revalidate: ['/library'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 200 },
      { name: 'author', label: 'Author', type: 'text', required: true, max: 160 },
      { name: 'isbn', label: 'ISBN', type: 'text', required: true, max: 40, hint: 'Must be unique.' },
      { name: 'category', label: 'Category', type: 'text', required: true, max: 80 },
      { name: 'copies', label: 'Copies held', type: 'number', required: true, min: 0 },
      { name: 'available', label: 'Copies on the shelf', type: 'number', required: true, min: 0 },
      { name: 'shelf', label: 'Shelf', type: 'text', required: true, max: 40 },
    ],
  },

  alumnus: {
    key: 'alumnus',
    singular: 'Alumnus',
    plural: 'Alumni',
    blurb: 'Graduates the college wants to feature.',
    columns: ['name', 'batch', 'role'],
    revalidate: ['/alumni'],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, max: 120 },
      { name: 'batch', label: 'Programme and year', type: 'text', required: true, max: 120 },
      { name: 'role', label: 'What they do now', type: 'text', required: true, max: 200 },
      { name: 'order', label: 'Position', type: 'number', min: 0 },
    ],
  },

  career: {
    key: 'career',
    singular: 'Opportunity',
    plural: 'Careers & opportunities',
    blurb: 'Jobs, internships and graduate programmes to put in front of students.',
    columns: ['title', 'org', 'type', 'deadline'],
    revalidate: ['/alumni'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
      { name: 'org', label: 'Organisation', type: 'text', required: true, max: 160 },
      { name: 'type', label: 'Type', type: 'text', required: true, max: 80, placeholder: 'Internship' },
      { name: 'deadline', label: 'Deadline', type: 'date' },
    ],
  },
};

export function isResourceKey(value: unknown): value is ResourceKey {
  return typeof value === 'string' && (RESOURCE_KEYS as readonly string[]).includes(value);
}

/** A URL-safe slug, used when a record's web address is left blank. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
