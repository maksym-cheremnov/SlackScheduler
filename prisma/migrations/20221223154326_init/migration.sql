-- CreateTable
CREATE TABLE "Oauth" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "enterprise_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Oauth_pkey" PRIMARY KEY ("id")
);
