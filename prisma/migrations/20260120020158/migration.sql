-- CreateTable
CREATE TABLE "mail_daily" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_monthly" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT[],
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_monthly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_selected" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT[],
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_selected_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_keyword" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "re" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mail_extraction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "re" TEXT NOT NULL,
    "num" INTEGER[],
    "multi_line" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_extraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mail_daily_message_id_key" ON "mail_daily"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "mail_monthly_message_id_key" ON "mail_monthly"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "mail_selected_message_id_key" ON "mail_selected"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "mail_keyword_name_key" ON "mail_keyword"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mail_extraction_name_key" ON "mail_extraction"("name");
