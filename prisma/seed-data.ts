/*
 * Demonstration content
 * ---------------------------------------------------------
 * The dataset behind `npm run db:seed`: one college, its departments, staff,
 * notices and library, used for development and for demonstrating the system.
 *
 * A NEW COLLEGE SHOULD NOT LOAD THIS. Setting up a copy of this project is
 * done through the wizard at /setup, which records that college's own details
 * and offers neutral starter content from lib/example-content.ts. The people
 * named below belong to this deployment's college, and presenting them as
 * another institution's staff would be wrong.
 *
 * Names, dates and figures here are realistic placeholders to be replaced
 * with official records before going live.
 */

const siteConfig = {
  name: 'Government Degree College Zaim',
  nameUr: 'گورنمنٹ ڈگری کالج زیم',
  shortName: 'GDC Zaim',
  tagline: 'Knowledge · Character · Service',
  taglineUr: 'علم · کردار · خدمت',
  established: 1998,
  affiliation: 'Affiliated with the University of Peshawar · Recognised by the Higher Education Department',
  address: 'Main Campus Road, Zaim, Khyber Pakhtunkhwa, Pakistan',
  phone: '+92 91 000 0000',
  admissionsPhone: '+92 91 000 0001',
  email: 'info@gdczaim.edu.pk',
  admissionsEmail: 'admissions@gdczaim.edu.pk',
  officeHours: 'Monday – Friday, 08:00 – 14:00 (Office) · Saturday, 09:00 – 12:00 (Helpdesk)',
  socials: [
    { label: 'Facebook', url: '#', icon: 'facebook' },
    { label: 'X (Twitter)', url: '#', icon: 'twitter' },
    { label: 'YouTube', url: '#', icon: 'youtube' },
    { label: 'LinkedIn', url: '#', icon: 'linkedin' }
  ],
  principal: {
    name: 'Prof. Dr. Muhammad Ayub Khan',
    designation: 'Principal',
    qualification: 'Ph.D. Geography, M.Phil. Geography',
    message:
      'Government Degree College Zaim has served this region for more than two decades, opening the doors of higher education to students who might otherwise have been left behind. Our purpose is simple: to combine academic rigour with character, so that every graduate leaves here able to think independently and serve honourably. This portal is part of that commitment — it puts admissions, attendance, results, library services and official notices in one transparent place, accessible to students, parents and faculty alike. I welcome you to our campus and invite you to make full use of what it offers.',
    messageShort:
      'Our purpose is to combine academic rigour with character, so that every graduate leaves here able to think independently and serve honourably.'
  },
  stats: [
    { value: 680, suffix: '+', label: 'Enrolled Students', labelUr: 'زیرِ تعلیم طلبہ' },
    { value: 18, suffix: '', label: 'Faculty Members', labelUr: 'اساتذہ' },
    { value: 2, suffix: '', label: 'Academic Departments', labelUr: 'شعبہ جات' },
    { value: 27, suffix: '', label: 'Years of Service', labelUr: 'سالہ خدمات' }
  ]
};

/* ------------------------------------------------------------------ *
 * Departments
 * ------------------------------------------------------------------ */
const departments = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    nameUr: 'کمپیوٹر سائنس',
    icon: 'cpu',
    hod: 'Prof. Shah Nawaz',
    hodDesignation: 'Professor & Head of Department',
    established: 2006,
    students: 420,
    faculty: 9,
    intro:
      'The Department of Computer Science offers a four-year BS programme built around programming fundamentals, data structures, databases, networks and software engineering, together with ICS at intermediate level. Teaching is supported by dedicated computer laboratories and an active final-year project culture.',
    programs: ['BS Computer Science (4 Years)', 'ICS — Intermediate in Computer Science (2 Years)'],
    courses: [
      'Programming Fundamentals', 'Object Oriented Programming', 'Data Structures & Algorithms',
      'Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering',
      'Web Technologies', 'Artificial Intelligence', 'Information Security'
    ],
    facilities: ['Computer Laboratories', 'Project & Research Lab', 'Campus Wi-Fi'],
    achievements: [
      'Runner-up, Inter-Collegiate Programming Contest 2025',
      'Departmental final-year project archive for reference by juniors'
    ],
    email: 'cs@gdczaim.edu.pk'
  },
  {
    id: 'zoology',
    name: 'Zoology',
    nameUr: 'حیوانیات',
    icon: 'dna',
    hod: 'Prof. Masoom Shah',
    hodDesignation: 'Professor & Head of Department',
    established: 2002,
    students: 260,
    faculty: 7,
    intro:
      'The Department of Zoology covers animal diversity, physiology, genetics, wildlife and entomology through a four-year BS programme, and teaches Biology to FSc Pre-Medical students. The department maintains a museum collection and a dedicated zoology laboratory used across practical courses.',
    programs: ['BS Zoology (4 Years)', 'Biology for FSc Pre-Medical'],
    courses: [
      'Animal Diversity', 'Cell & Molecular Biology', 'Physiology', 'Genetics',
      'Wildlife & Fisheries', 'Entomology', 'Developmental Biology', 'Ecology'
    ],
    facilities: ['Zoology Laboratory', 'Zoology Museum', 'Dissection & Physiology Room'],
    achievements: [
      'Wildlife awareness campaign with the provincial Wildlife Department',
      'Campus biodiversity survey conducted by final-year students'
    ],
    email: 'zoology@gdczaim.edu.pk'
  }
];

/* ------------------------------------------------------------------ *
 * Faculty directory
 * ------------------------------------------------------------------ */
const faculty = [
  { id: 'f01', name: 'Prof. Dr. Muhammad Ayub Khan', designation: 'Principal', dept: 'administration', qualification: 'Ph.D. Geography, M.Phil. Geography', specialization: 'Geography & Educational Administration', email: 'principal@gdczaim.edu.pk' },
  { id: 'f02', name: 'Prof. Arshad Iqbal', designation: 'Vice Principal', dept: 'administration', qualification: 'M.Phil.', specialization: 'Academic Coordination & Discipline', email: 'viceprincipal@gdczaim.edu.pk' },

  { id: 'f03', name: 'Prof. Shah Nawaz', designation: 'Professor / HOD', dept: 'computer-science', qualification: 'M.Phil. Computer Science', specialization: 'Database Systems', email: 'shah.nawaz@gdczaim.edu.pk' },
  { id: 'f04', name: 'Mr. Bilal Ahmad', designation: 'Assistant Professor', dept: 'computer-science', qualification: 'MS Software Engineering', specialization: 'Web & Mobile Engineering', email: 'bilal.ahmad@gdczaim.edu.pk' },
  { id: 'f05', name: 'Ms. Kiran Shah', designation: 'Lecturer', dept: 'computer-science', qualification: 'MS Computer Science', specialization: 'Artificial Intelligence', email: 'kiran.shah@gdczaim.edu.pk' },
  { id: 'f06', name: 'Mr. Usman Ghani', designation: 'Lecturer', dept: 'computer-science', qualification: 'MSCS', specialization: 'Computer Networks', email: 'usman.ghani@gdczaim.edu.pk' },
  { id: 'f07', name: 'Mr. Adnan Malik', designation: 'Lecturer', dept: 'computer-science', qualification: 'MSCS', specialization: 'Programming & Data Structures', email: 'adnan.malik@gdczaim.edu.pk' },

  { id: 'f08', name: 'Prof. Masoom Shah', designation: 'Professor / HOD', dept: 'zoology', qualification: 'M.Phil. Zoology', specialization: 'Entomology', email: 'masoom.shah@gdczaim.edu.pk' },
  { id: 'f09', name: 'Dr. Farhan Ali', designation: 'Associate Professor', dept: 'zoology', qualification: 'Ph.D. Zoology', specialization: 'Wildlife & Fisheries', email: 'farhan.ali@gdczaim.edu.pk' },
  { id: 'f10', name: 'Ms. Hina Gul', designation: 'Lecturer', dept: 'zoology', qualification: 'M.Phil. Zoology', specialization: 'Physiology', email: 'hina.gul@gdczaim.edu.pk' },
  { id: 'f11', name: 'Mr. Hamza Saeed', designation: 'Lecturer', dept: 'zoology', qualification: 'M.Sc. Zoology', specialization: 'Animal Diversity', email: 'hamza.saeed@gdczaim.edu.pk' },

  { id: 'f12', name: 'Prof. Nadia Bashir', designation: 'Professor', dept: 'administration', qualification: 'M.Phil. English', specialization: 'Compulsory English (FSc / FA / ICS)', email: 'nadia.bashir@gdczaim.edu.pk' },
  { id: 'f13', name: 'Mr. Shafiq ur Rehman', designation: 'Lecturer', dept: 'administration', qualification: 'M.A. Urdu', specialization: 'Urdu & Islamiyat (Intermediate)', email: 'shafiq.rehman@gdczaim.edu.pk' },
  { id: 'f14', name: 'Dr. Ayesha Noor', designation: 'Assistant Professor', dept: 'administration', qualification: 'Ph.D. Chemistry', specialization: 'Chemistry (FSc Pre-Medical & Pre-Engineering)', email: 'ayesha.noor@gdczaim.edu.pk' },
  { id: 'f15', name: 'Dr. Tariq Mehmood', designation: 'Associate Professor', dept: 'administration', qualification: 'Ph.D. Physics', specialization: 'Physics (FSc Pre-Engineering)', email: 'tariq.mehmood@gdczaim.edu.pk' },
  { id: 'f16', name: 'Dr. Imran Ullah', designation: 'Assistant Professor', dept: 'administration', qualification: 'M.Phil. Mathematics', specialization: 'Mathematics (FSc / ICS)', email: 'imran.ullah@gdczaim.edu.pk' },
  { id: 'f17', name: 'Prof. Zahid Iqbal', designation: 'Professor', dept: 'administration', qualification: 'M.Phil. Economics', specialization: 'Economics & Civics (FA)', email: 'zahid.iqbal@gdczaim.edu.pk' },
  { id: 'f18', name: 'Mr. Naveed Anjum', designation: 'Librarian', dept: 'administration', qualification: 'MLIS', specialization: 'Library & Information Science', email: 'library@gdczaim.edu.pk' }
];

/* ------------------------------------------------------------------ *
 * Notices  (categories drive the filter chips on notices.html)
 * ------------------------------------------------------------------ */
const noticeCategories = ['Admission', 'Examination', 'Academic', 'Scholarship', 'Holiday', 'Emergency', 'General'];

const notices = [
  { id: 'n-2026-041', title: 'BS Admissions 2026 — Second Merit List Displayed', titleUr: 'بی ایس داخلے 2026 — دوسری میرٹ لسٹ آویزاں', category: 'Admission', date: '2026-09-14', dept: 'all', pinned: true, urgent: false, file: 'merit-list-2-2026.pdf', body: 'The second merit list for all BS four-year programmes has been displayed on the college notice board and published in the Downloads section. Selected candidates must deposit dues and complete enrolment at the Admission Office by 22 September 2026. Seats not confirmed by the deadline will be offered to candidates on the next merit list.' },
  { id: 'n-2026-040', title: 'Mid-Term Examination Schedule — Fall 2026', titleUr: 'وسط مدتی امتحانات شیڈول — خزاں 2026', category: 'Examination', date: '2026-09-11', dept: 'all', pinned: true, urgent: false, file: 'midterm-schedule-fall-2026.pdf', body: 'Mid-term examinations for all departments will be held from 6 to 17 October 2026. The detailed datesheet is available in Downloads and on each department page. Students must carry their college identity card to the examination hall; candidates with attendance below 75% will not be issued a roll number slip.' },
  { id: 'n-2026-039', title: 'Prime Minister’s Need-Based Scholarship — Applications Open', titleUr: 'وزیراعظم ضرورت پر مبنی وظائف — درخواستیں', category: 'Scholarship', date: '2026-09-08', dept: 'all', pinned: false, urgent: false, file: 'pm-scholarship-2026.pdf', body: 'Applications are invited from students of all BS programmes for the need-based scholarship scheme. Applicants must submit the prescribed form together with the guardian income certificate, the previous semester result card and a copy of the B-Form/CNIC to the Scholarship Cell by 30 September 2026.' },
  { id: 'n-2026-038', title: 'Annual Sports Week — Registration for Teams', titleUr: 'سالانہ اسپورٹس ویک — ٹیم رجسٹریشن', category: 'General', date: '2026-09-05', dept: 'all', pinned: false, urgent: false, file: '', body: 'Registration is open for cricket, football, volleyball, badminton and athletics teams for the Annual Sports Week starting 20 October 2026. Department sports representatives must submit team lists to the Sports Office before 1 October 2026.' },
  { id: 'n-2026-037', title: 'Computer Science — Final Year Project Proposal Defence', titleUr: 'کمپیوٹر سائنس — فائنل ایئر پروجیکٹ دفاع', category: 'Academic', date: '2026-09-03', dept: 'computer-science', pinned: false, urgent: false, file: 'fyp-defence-schedule.pdf', body: 'Final-year students of BS Computer Science will present their project proposals before the departmental evaluation committee on 24 and 25 September 2026 in the Project Lab. Each group is allotted 15 minutes for presentation and 10 minutes for questions.' },
  { id: 'n-2026-036', title: 'Library Timings Extended During Examination Period', titleUr: 'امتحانات کے دوران لائبریری کے اوقات میں توسیع', category: 'General', date: '2026-08-30', dept: 'all', pinned: false, urgent: false, file: '', body: 'The central library will remain open until 18:00 from 1 October to 20 October 2026 to facilitate students during the examination period. Borrowing counters will close 30 minutes before closing time.' },
  { id: 'n-2026-035', title: 'Fee Submission Deadline — Fall Semester 2026', titleUr: 'فیس جمع کرانے کی آخری تاریخ — خزاں 2026', category: 'General', date: '2026-08-27', dept: 'all', pinned: false, urgent: false, file: 'fee-challan-fall-2026.pdf', body: 'All continuing students must deposit the semester fee at the designated bank branch using the challan available in Downloads by 15 September 2026. A late fee of PKR 500 will apply after the deadline.' },
  { id: 'n-2026-034', title: 'Seminar on Career Opportunities in Public Service', titleUr: 'سرکاری ملازمتوں میں مواقع پر سیمینار', category: 'Academic', date: '2026-08-22', dept: 'zoology', pinned: false, urgent: false, file: '', body: 'The Career Counselling Cell is organising a seminar on competitive examinations and public-service careers on 12 September 2026 at 11:00 in the college auditorium. Alumni serving in the provincial civil service will address the students.' },
  { id: 'n-2026-033', title: 'Closure of College on Account of Public Holiday', titleUr: 'عام تعطیل کے باعث کالج بند', category: 'Holiday', date: '2026-08-12', dept: 'all', pinned: false, urgent: false, file: '', body: 'The college will remain closed on 14 August 2026 in observance of Independence Day. The flag-hoisting ceremony will be held at 08:30 on 13 August 2026 and attendance of all staff and student representatives is required.' },
  { id: 'n-2026-032', title: 'Revised Class Timetable Effective From September', titleUr: 'نظرثانی شدہ ٹائم ٹیبل', category: 'Academic', date: '2026-08-08', dept: 'all', pinned: false, urgent: false, file: 'class-timetable-fall-2026.pdf', body: 'A revised class timetable for the Fall 2026 semester takes effect from 1 September 2026. Students and faculty should download the updated version; room allocations for laboratory sessions have changed for several departments.' }
];

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */
const events = [
  { id: 'e01', title: 'Annual Science Exhibition 2026', date: '2026-10-02', time: '09:00 – 15:00', venue: 'Main Auditorium & Science Block', category: 'Academic', registration: true, summary: 'Departmental project displays from Physics, Chemistry, Botany, Zoology and Computer Science, judged by a panel from the affiliated university.' },
  { id: 'e02', title: 'Inter-Departmental Programming Contest', date: '2026-10-09', time: '10:00 – 16:00', venue: 'Computer Lab I & II', category: 'Competition', registration: true, summary: 'Teams of three compete over five algorithmic problems. Open to all BS Computer Science and ICS students.' },
  { id: 'e03', title: 'Annual Sports Week', date: '2026-10-20', time: 'Full day', venue: 'College Sports Ground', category: 'Sports', registration: true, summary: 'Cricket, football, volleyball, badminton and athletics fixtures across one week, closing with the prize distribution ceremony.' },
  { id: 'e04', title: 'Workshop: Academic Writing & Research Skills', date: '2026-11-04', time: '11:00 – 13:00', venue: 'Seminar Hall', category: 'Workshop', registration: true, summary: 'Practical session on literature review, citation and plagiarism policy for final-year students of all departments.' },
  { id: 'e05', title: 'Blood Donation Camp', date: '2026-11-18', time: '09:00 – 14:00', venue: 'College Medical Room', category: 'Community', registration: false, summary: 'Organised by the Student Volunteer Society in collaboration with the district blood bank.' },
  { id: 'e06', title: 'Annual Prize Distribution & Alumni Meet', date: '2026-12-12', time: '10:00 – 14:00', venue: 'Main Auditorium', category: 'Cultural', registration: true, summary: 'Recognition of academic and co-curricular achievers of the year, followed by the annual gathering of the alumni association.' }
];

/* ------------------------------------------------------------------ *
 * Programs & admissions
 * ------------------------------------------------------------------ */
const programmes = [
  { id: 'bscs', name: 'BS Computer Science', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 120, dept: 'computer-science', eligibility: 'FSc Pre-Engineering / ICS / FA with Mathematics, minimum 45% marks', fee: 'PKR 9,500 per semester' },
  { id: 'bszo', name: 'BS Zoology', level: 'Undergraduate', duration: '4 Years (8 Semesters)', seats: 80, dept: 'zoology', eligibility: 'FSc Pre-Medical, minimum 45% marks', fee: 'PKR 8,000 per semester' },
  { id: 'fsc-pre-med', name: 'FSc Pre-Medical', level: 'Intermediate', duration: '2 Years', seats: 150, dept: 'zoology', eligibility: 'Matriculation (Science), minimum 50% marks', fee: 'PKR 4,500 per semester' },
  { id: 'fsc-pre-eng', name: 'FSc Pre-Engineering', level: 'Intermediate', duration: '2 Years', seats: 120, dept: 'computer-science', eligibility: 'Matriculation (Science), minimum 50% marks', fee: 'PKR 4,500 per semester' },
  { id: 'ics', name: 'ICS — Intermediate in Computer Science', level: 'Intermediate', duration: '2 Years', seats: 150, dept: 'computer-science', eligibility: 'Matriculation (Science), minimum 50% marks', fee: 'PKR 4,500 per semester' },
  { id: 'fa', name: 'FA — Intermediate in Arts', level: 'Intermediate', duration: '2 Years', seats: 150, dept: 'zoology', eligibility: 'Matriculation in any group, minimum 45% marks', fee: 'PKR 4,000 per semester' }
];

const admissionSchedule = [
  { stage: 'Issue of prospectus & online form', date: '01 Aug 2026 – 20 Aug 2026', status: 'done' },
  { stage: 'Last date for submission of applications', date: '25 Aug 2026', status: 'done' },
  { stage: 'Display of first merit list', date: '02 Sep 2026', status: 'done' },
  { stage: 'Display of second merit list', date: '14 Sep 2026', status: 'current' },
  { stage: 'Deposit of dues & enrolment', date: 'Up to 22 Sep 2026', status: 'current' },
  { stage: 'Commencement of classes', date: '01 Oct 2026', status: 'upcoming' }
];

const admissionDocuments = [
  'Matriculation & Intermediate detailed marks certificates (attested)',
  'Character certificate from the last institution attended',
  'Two attested copies of CNIC / B-Form and the guardian’s CNIC',
  'Four recent passport-size photographs',
  'Domicile certificate',
  'Migration certificate, where applicable'
];

/* ------------------------------------------------------------------ *
 * Library catalogue (sample of the digital-library module)
 * ------------------------------------------------------------------ */
const books = [
  { id: 'b001', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest & Stein', isbn: '978-0262046305', category: 'Computer Science', copies: 6, available: 2, shelf: 'CS-04' },
  { id: 'b002', title: 'Database System Concepts', author: 'Silberschatz, Korth & Sudarshan', isbn: '978-0078022159', category: 'Computer Science', copies: 5, available: 3, shelf: 'CS-05' },
  { id: 'b003', title: 'Operating System Concepts', author: 'Silberschatz & Galvin', isbn: '978-1118063330', category: 'Computer Science', copies: 4, available: 0, shelf: 'CS-06' },
  { id: 'b004', title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1285741550', category: 'Mathematics', copies: 8, available: 5, shelf: 'MT-02' },
  { id: 'b005', title: 'Linear Algebra and Its Applications', author: 'David C. Lay', isbn: '978-0321982384', category: 'Mathematics', copies: 5, available: 4, shelf: 'MT-03' },
  { id: 'b006', title: 'Fundamentals of Physics', author: 'Halliday, Resnick & Walker', isbn: '978-1118230718', category: 'Physics', copies: 7, available: 3, shelf: 'PH-01' },
  { id: 'b007', title: 'Organic Chemistry', author: 'Paula Yurkanis Bruice', isbn: '978-0134042282', category: 'Chemistry', copies: 6, available: 1, shelf: 'CH-02' },
  { id: 'b008', title: 'Plant Physiology and Development', author: 'Taiz & Zeiger', isbn: '978-1605353890', category: 'Botany', copies: 4, available: 4, shelf: 'BT-01' },
  { id: 'b009', title: 'Principles of Economics', author: 'N. Gregory Mankiw', isbn: '978-1305585126', category: 'Economics', copies: 6, available: 2, shelf: 'EC-01' },
  { id: 'b010', title: 'A Study of History', author: 'Arnold J. Toynbee', isbn: '978-0195001983', category: 'History', copies: 3, available: 3, shelf: 'HS-01' },
  { id: 'b011', title: 'Bang-e-Dra', author: 'Allama Muhammad Iqbal', isbn: '978-9693500000', category: 'Urdu Literature', copies: 10, available: 7, shelf: 'UR-01' },
  { id: 'b012', title: 'Sahih Al-Bukhari (Urdu Translation)', author: 'Imam Muhammad al-Bukhari', isbn: '978-9694070000', category: 'Islamic Studies', copies: 5, available: 5, shelf: 'IS-01' },
  { id: 'b013', title: 'Software Engineering: A Practitioner’s Approach', author: 'Roger S. Pressman', isbn: '978-0078022128', category: 'Computer Science', copies: 5, available: 2, shelf: 'CS-07' },
  { id: 'b014', title: 'Molecular Biology of the Cell', author: 'Alberts et al.', isbn: '978-0815344322', category: 'Zoology', copies: 3, available: 1, shelf: 'ZO-02' },
  { id: 'b015', title: 'The Norton Anthology of English Literature', author: 'Stephen Greenblatt (Ed.)', isbn: '978-0393603125', category: 'English', copies: 4, available: 2, shelf: 'EN-01' }
];

/* ------------------------------------------------------------------ *
 * Downloads / document centre
 * ------------------------------------------------------------------ */
const downloads = [
  { id: 'd01', title: 'Admission Prospectus 2026', category: 'Admission', size: '3.2 MB', type: 'PDF', date: '2026-08-01' },
  { id: 'd02', title: 'BS Admission Application Form', category: 'Admission', size: '420 KB', type: 'PDF', date: '2026-08-01' },
  { id: 'd03', title: 'Second Merit List — All Programmes', category: 'Admission', size: '890 KB', type: 'PDF', date: '2026-09-14' },
  { id: 'd04', title: 'Class Timetable — Fall 2026', category: 'Academic', size: '650 KB', type: 'PDF', date: '2026-08-08' },
  { id: 'd05', title: 'Mid-Term Datesheet — Fall 2026', category: 'Examination', size: '380 KB', type: 'PDF', date: '2026-09-11' },
  { id: 'd06', title: 'Fee Challan Form — Fall 2026', category: 'Finance', size: '210 KB', type: 'PDF', date: '2026-08-27' },
  { id: 'd07', title: 'Need-Based Scholarship Form', category: 'Scholarship', size: '340 KB', type: 'PDF', date: '2026-09-08' },
  { id: 'd08', title: 'Bonafide / Character Certificate Request Form', category: 'Student Services', size: '190 KB', type: 'PDF', date: '2026-07-15' },
  { id: 'd09', title: 'Student Code of Conduct & Discipline Policy', category: 'Policy', size: '540 KB', type: 'PDF', date: '2026-06-20' },
  { id: 'd10', title: 'Hostel Application Form', category: 'Student Services', size: '260 KB', type: 'PDF', date: '2026-07-30' },
  { id: 'd11', title: 'Anti-Harassment Policy', category: 'Policy', size: '300 KB', type: 'PDF', date: '2026-05-10' },
  { id: 'd12', title: 'Library Membership & Borrowing Rules', category: 'Policy', size: '180 KB', type: 'PDF', date: '2026-05-10' }
];

/* ------------------------------------------------------------------ *
 * Scholarships, services, facilities, gallery
 * ------------------------------------------------------------------ */
const scholarships = [
  { name: 'Prime Minister’s Need-Based Scholarship', provider: 'HEC / Government of Pakistan', covers: 'Full tuition + monthly stipend', eligibility: 'Enrolled BS students with verified family income below the prescribed threshold', deadline: '2026-09-30' },
  { name: 'Ehsaas Undergraduate Scholarship', provider: 'HEC', covers: 'Tuition fee + living allowance', eligibility: 'First-year BS students from low-income households', deadline: '2026-10-15' },
  { name: 'Chief Minister’s Merit Scholarship', provider: 'Provincial Government', covers: 'Tuition fee waiver', eligibility: 'Top three positions in each department by CGPA', deadline: '2026-11-01' },
  { name: 'Zakat Fund Assistance', provider: 'District Zakat Committee', covers: 'Tuition fee & examination dues', eligibility: 'Deserving students on recommendation of the Zakat Committee', deadline: 'Open throughout the year' },
  { name: 'College Sports Talent Award', provider: 'GDC Zaim', covers: '50% fee concession', eligibility: 'Students representing the college at provincial or national level', deadline: 'Before the start of each semester' }
];

const studentServices = [
  { name: 'Bonafide Certificate', turnaround: '2 working days', requires: 'Registration number, purpose of request' },
  { name: 'Character Certificate', turnaround: '3 working days', requires: 'Clearance from department and library' },
  { name: 'Migration Certificate', turnaround: '5 working days', requires: 'No-dues clearance, original fee receipts' },
  { name: 'Academic Transcript', turnaround: '5 working days', requires: 'Completed semesters, transcript fee receipt' },
  { name: 'Duplicate Student ID Card', turnaround: '3 working days', requires: 'Application, affidavit for a lost card' },
  { name: 'Fee / Dues Certificate', turnaround: '2 working days', requires: 'Registration number, relevant session' }
];

const serviceStages = ['Submitted', 'Under Review', 'Approved', 'Ready', 'Delivered'];

const facilities = [
  { name: 'Central Library', icon: 'book', detail: 'Reference and lending collection for BS and intermediate students, with a reading hall and a digital catalogue.' },
  { name: 'Computer Laboratory', icon: 'cpu', detail: 'Workstations for programming, database and networking practicals, a project room for final-year work, and campus Wi-Fi.' },
  { name: 'Chemistry Laboratory', icon: 'flask', detail: 'Practical work for FSc Pre-Medical and Pre-Engineering students, maintained to departmental safety standards.' },
  { name: 'Zoology Laboratory', icon: 'dna', detail: 'Microscopy, dissection and specimen study for BS Zoology and FSc Pre-Medical students, with a museum collection.' },
  { name: 'Sports Ground', icon: 'trophy', detail: 'Cricket and football ground, volleyball and badminton courts, and an indoor table-tennis room.' },
  { name: 'Auditorium', icon: 'mic', detail: 'Hall with audio-visual facilities for seminars, ceremonies and cultural events.' },
  { name: 'Cafeteria', icon: 'cup', detail: 'Subsidised cafeteria serving hygienic meals and refreshments through the academic day.' },
  { name: 'Medical Room', icon: 'health', detail: 'First-aid facility with a visiting medical officer and referral arrangement with the district hospital.' },
  { name: 'Hostel', icon: 'home', detail: 'On-campus accommodation for out-of-district students, with a warden and common study room.' },
  { name: 'Transport', icon: 'bus', detail: 'College buses covering the town and adjoining union councils.' },
  { name: 'Masjid & Prayer Area', icon: 'mosque', detail: 'Campus masjid with separate prayer space for female students.' }
];

const galleryItems = [
  { id: 'g01', title: 'Main Academic Block', category: 'Campus', tone: 'a' },
  { id: 'g02', title: 'Central Library', category: 'Campus', tone: 'b' },
  { id: 'g03', title: 'Computer Laboratory', category: 'Academic', tone: 'c' },
  { id: 'g04', title: 'Chemistry Laboratory', category: 'Academic', tone: 'd' },
  { id: 'g05', title: 'Zoology Laboratory', category: 'Academic', tone: 'e' },
  { id: 'g06', title: 'College Sports Ground', category: 'Sports', tone: 'f' },
  { id: 'g07', title: 'Annual Science Exhibition', category: 'Events', tone: 'd' },
  { id: 'g08', title: 'Independence Day Assembly', category: 'Events', tone: 'a' }
];

/**
 * College leadership shown on the About page. The administrator can change
 * any of these — and upload a portrait for each, the principal included —
 * from Admin -> Website content, so this is only the starting point.
 */
const leaders = [
  { role: 'Principal', name: 'Prof. Dr. Muhammad Ayub Khan', icon: 'user', detail: 'Overall academic and administrative head of the institution. Ph.D. and M.Phil. in Geography.' },
  { role: 'Vice Principal', name: 'Prof. Arshad Iqbal', icon: 'users', detail: 'Academic coordination, discipline and timetabling.' },
  { role: 'Registrar / Admissions', name: 'Mr. Naeem Akhtar', icon: 'clipboard', detail: 'Admissions, enrolment, student records and certificates.' },
  { role: 'Controller of Examinations', name: 'Dr. Salman Yousaf', icon: 'chart', detail: 'Examination conduct, marks verification and result publication.' },
  { role: 'Head, Computer Science', name: 'Prof. Shah Nawaz', icon: 'cpu', detail: 'BS Computer Science and ICS: curriculum, laboratories and final-year projects.' },
  { role: 'Head, Zoology', name: 'Prof. Masoom Shah', icon: 'dna', detail: 'BS Zoology and FSc Biology: curriculum, laboratory and museum.' },
  { role: 'Librarian', name: 'Mr. Naveed Anjum', icon: 'book', detail: 'Library services, catalogue and digital resources.' },
  { role: 'Hostel Warden', name: 'Mr. Ejaz Ahmad', icon: 'home', detail: 'Hostel allocation, residence discipline and welfare.' },
];

/**
 * Photographs that fill fixed slots in the design. Each one is replaceable
 * from the admin panel; the slot name is what the pages look up, so a new
 * upload takes effect everywhere that slot is used.
 */
const siteImages = [
  {
    slot: 'hero',
    label: 'Home page banner',
    where: 'The photograph behind the welcome message on the home page.',
    imagePath: '/images/campus-hero.jpg',
    alt: 'The campus of Government Degree College Zaim at golden hour.',
  },
  {
    slot: 'about-campus',
    label: 'About page photograph',
    where: 'The photograph beside the college history on the About page.',
    imagePath: '/images/campus-main-block.jpg',
    alt: 'The main academic block of Government Degree College Zaim: a two-storey brick building with arched windows and a central tower, fronted by a wide lawn and flowering shrubs.',
  },
];

const alumni = [
  { name: 'Dr. Waqar Ahmed', batch: 'BS Physics, 2012', role: 'Assistant Professor, University of Peshawar' },
  { name: 'Ms. Samina Khalid', batch: 'BS English, 2014', role: 'Section Officer, Provincial Civil Service' },
  { name: 'Mr. Junaid Iqbal', batch: 'BS Computer Science, 2016', role: 'Senior Software Engineer, Islamabad' },
  { name: 'Dr. Nasreen Akhtar', batch: 'BS Zoology, 2013', role: 'Medical Officer, District Headquarters Hospital' },
  { name: 'Mr. Kamran Shah', batch: 'BS Economics, 2015', role: 'Branch Manager, National Bank of Pakistan' },
  { name: 'Mr. Asad Rauf', batch: 'ICS, 2017', role: 'Founder, local IT services startup' }
];

const careers = [
  { title: 'Lecturer (Visiting) — Computer Science', org: 'GDC Zaim', type: 'Visiting Faculty', deadline: '2026-09-28' },
  { title: 'Internship Programme — District IT Office', org: 'Government of KP', type: 'Internship', deadline: '2026-10-05' },
  { title: 'Junior Data Entry Operator', org: 'District Education Office', type: 'Government Job', deadline: '2026-10-10' },
  { title: 'Trainee Officer Programme', org: 'National Bank of Pakistan', type: 'Graduate Programme', deadline: '2026-10-20' }
];

export {
  siteConfig, departments, faculty, notices, noticeCategories, events, programmes,
  admissionSchedule, admissionDocuments, books, downloads, scholarships,
  studentServices, serviceStages, facilities, galleryItems, alumni, careers,
  leaders, siteImages,
};
