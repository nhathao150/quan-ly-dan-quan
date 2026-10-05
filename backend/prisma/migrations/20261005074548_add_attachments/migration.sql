-- AlterTable
ALTER TABLE "MilitiaRecord" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[];
