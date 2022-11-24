-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "job_id" TEXT NOT NULL,
    "pattern_type" TEXT NOT NULL,
    "repeat_end_date" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "users" TEXT[],
    "channels" TEXT[],
    "conversations" TEXT[],
    "status" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
