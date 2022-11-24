-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "user" TEXT NOT NULL,
    "users" TEXT[],
    "channels" TEXT[],
    "conversations" TEXT[],

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);
