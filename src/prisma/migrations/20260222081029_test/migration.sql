/*
  Warnings:

  - You are about to drop the `Authenticator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackerClock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_userId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tracker" DROP CONSTRAINT "Tracker_userId_fkey";

-- DropForeignKey
ALTER TABLE "TrackerClock" DROP CONSTRAINT "TrackerClock_trackerId_fkey";

-- DropTable
DROP TABLE "Authenticator";

-- DropTable
DROP TABLE "Collection";

-- DropTable
DROP TABLE "Like";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "Tracker";

-- DropTable
DROP TABLE "TrackerClock";

-- DropEnum
DROP TYPE "TrackerStatus";
