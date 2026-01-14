/*
  Warnings:

  - A unique constraint covering the columns `[message_id]` on the table `parsed_email` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "selected_email" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selected_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "selected_email_message_id_key" ON "selected_email"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "parsed_email_message_id_key" ON "parsed_email"("message_id");
