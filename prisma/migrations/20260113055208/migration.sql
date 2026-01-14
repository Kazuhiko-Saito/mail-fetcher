-- CreateTable
CREATE TABLE "parsed_email" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parsed_email_pkey" PRIMARY KEY ("id")
);
