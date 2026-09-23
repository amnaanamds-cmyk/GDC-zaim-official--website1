-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL DEFAULT 'institution',
    "name" TEXT NOT NULL,
    "nameUr" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "shortNameUr" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Higher Education Department',
    "departmentUr" TEXT NOT NULL DEFAULT 'محکمہ اعلیٰ تعلیم',
    "established" INTEGER NOT NULL,
    "affiliation" TEXT NOT NULL,
    "crestPath" TEXT,
    "address" TEXT NOT NULL,
    "addressUr" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "admissionsPhone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "admissionsEmail" TEXT NOT NULL,
    "officeHours" TEXT NOT NULL DEFAULT 'Monday – Friday, 08:00 – 14:00',
    "principalName" TEXT NOT NULL,
    "principalDesignation" TEXT NOT NULL DEFAULT 'Principal',
    "principalQualification" TEXT NOT NULL DEFAULT '',
    "principalMessage" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "taglineUr" TEXT NOT NULL DEFAULT '',
    "aboutLead" TEXT NOT NULL DEFAULT '',
    "historyBody" TEXT NOT NULL DEFAULT '',
    "setupCompletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- An existing deployment already has a college's content in it, and its pages
-- used to read the institution's name from the source code. Carry those values
-- into the new row so nothing goes blank on the next deploy. A fresh database
-- has no rows to migrate and stays empty, which is what sends a new college to
-- the /setup wizard.
INSERT INTO "Institution" (
  "id", "name", "nameUr", "shortName", "shortNameUr", "established", "affiliation",
  "address", "district", "phone", "admissionsPhone", "email", "admissionsEmail",
  "principalName", "principalQualification", "setupCompletedAt", "updatedAt"
)
SELECT
  'institution',
  'Government Degree College Zaim',
  'گورنمنٹ ڈگری کالج زیم',
  'GDC Zaim',
  'جی ڈی سی زیم',
  1998,
  'Affiliated with the University of Peshawar',
  'Main Campus Road, Zaim, Khyber Pakhtunkhwa, Pakistan',
  'Zaim',
  '+92 91 000 0000',
  '+92 91 000 0001',
  'info@gdczaim.edu.pk',
  'admissions@gdczaim.edu.pk',
  'Prof. Dr. Muhammad Ayub Khan',
  'Ph.D. Geography, M.Phil. Geography',
  now(),
  now()
WHERE EXISTS (SELECT 1 FROM "User");
