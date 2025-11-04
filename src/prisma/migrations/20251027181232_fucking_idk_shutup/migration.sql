/*
  Warnings:

  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `collectionId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `reviewId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the `LikesOnCollections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikesOnReviews` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `objectId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objectType` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LikesOnCollections" DROP CONSTRAINT "LikesOnCollections_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LikesOnCollections" DROP CONSTRAINT "LikesOnCollections_likeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LikesOnCollections" DROP CONSTRAINT "LikesOnCollections_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LikesOnReviews" DROP CONSTRAINT "LikesOnReviews_likeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LikesOnReviews" DROP CONSTRAINT "LikesOnReviews_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LikesOnReviews" DROP CONSTRAINT "LikesOnReviews_userId_fkey";

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
DROP COLUMN "collectionId",
DROP COLUMN "id",
DROP COLUMN "reviewId",
ADD COLUMN     "objectId" TEXT NOT NULL,
ADD COLUMN     "objectType" TEXT NOT NULL,
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("userId", "objectId");

-- DropTable
DROP TABLE "public"."LikesOnCollections";

-- DropTable
DROP TABLE "public"."LikesOnReviews";
