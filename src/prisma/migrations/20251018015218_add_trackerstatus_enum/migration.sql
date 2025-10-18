/*
  Warnings:

  - The `status` column on the `Tracker` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TrackerStatus" AS ENUM ('BACKLOG', 'IN_PROGRESS', 'COMPLETE');

-- AlterTable
ALTER TABLE "Tracker" DROP COLUMN "status",
ADD COLUMN     "status" "TrackerStatus" NOT NULL DEFAULT 'IN_PROGRESS';
