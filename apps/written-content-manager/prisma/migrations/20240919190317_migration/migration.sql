-- AlterTable
ALTER TABLE "Exercise" ALTER COLUMN "order" DROP DEFAULT;
DROP SEQUENCE "Exercise_order_seq";

-- AlterTable
ALTER TABLE "Section" ALTER COLUMN "order" DROP DEFAULT;
DROP SEQUENCE "section_order_seq";
