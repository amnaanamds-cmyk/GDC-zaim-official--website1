-- Rename rather than drop-and-add: an existing deployment already holds real
-- admission applications, and Prisma's generated DROP COLUMN / ADD COLUMN would
-- have discarded every applicant's name and identity number.
ALTER TABLE "Application" RENAME COLUMN "cnic" TO "idNumber";
ALTER TABLE "Application" RENAME COLUMN "fatherName" TO "guardianName";

-- Qualifying examinations are not marked out of the same total everywhere, so
-- the default stops being one country's intermediate total. Applications
-- already recorded keep the total they were submitted against.
ALTER TABLE "Application" ALTER COLUMN "totalMarks" SET DEFAULT 100;
