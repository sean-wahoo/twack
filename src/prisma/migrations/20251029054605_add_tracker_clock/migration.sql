-- CreateTable
CREATE TABLE "TrackerClock" (
    "id" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackerClock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrackerClock" ADD CONSTRAINT "TrackerClock_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "Tracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
