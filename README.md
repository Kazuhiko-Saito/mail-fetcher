# メールフェッチプログラム

## 準備

1. リポジトリをクローン

    ```bash
    git clone https://github.com/Kazuhiko-Saito/mail-fetcher.git
    ```

1. クローンしたディレクトリに移動

    ```bash
    cd mail-fetcher
    ```

1. 接続設定定義

    `.env` を作成し、接続設定を記述する。

    ```
    MAIL_USERNAME=＜メールアカウント＞
    MAIL_PASSWORD=＜メールパスワード＞
    MAIL_SERVERNAME=＜POP3サーバーアドレス＞
    MAIL_SERVERPORT=＜POP3サーバーポート番号＞
    DATABASE_URL=＜Prisma DB接続先URL＞
    ```

1. Nodeモジュールインストール

    ```bash
    npm install
    ```

1. Prisma Client生成

    ```bash
    npx prisma generate
    ```

1. DBマイグレーション実行

    ```bash
    npx prisma migrate dev
    ```

## 実行

### emailFetcher.mjs

POP3サーバーよりメールを取得して、デイリーメールテーブルに保存する。

```bash
npx tsx emailFetcher.mjs
```

### emailStore.mjs

デイリーメールテーブルのメールを取得して、タグ付けとサマリー抽出を行い、マンスリーメールテーブルに保存する。

```bash
npx tsx emailStore.mjs
```

### emailRegExp.mjs

タグ付けとサマリー抽出のテスト用プログラムで、`lib/util.mjs` の `searchKeyword` 関数と `extractionRegex` 関数を実行する。

その際の検証用メール本文は `mail` ディレクトリに格納されたファイルを参照する。

タグ付け用キーワード定義とサマリー抽出用キーワード定義はそれぞれテーブルに格納している。

```bash
npx tsx emailRegExp.mjs
```

### importKeyword.mjs

`lib/constant.js` に定義されている検索用キーワードと抽出用キーワードをテーブルにインポートする。

```bash
npx tsx importKeyword.mjs
```

## テーブル定義

### デイリーメールテーブル

```SQL
-- CreateTable
CREATE TABLE "mail_daily" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_daily_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "mail_daily_message_id_key" ON "mail_daily"("message_id");
```

### マンスリーメールテーブル

```SQL
-- CreateTable
CREATE TABLE "mail_monthly" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT[],
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_monthly_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "mail_monthly_message_id_key" ON "mail_monthly"("message_id");
```

### 保存済みメールテーブル

```SQL
-- CreateTable
CREATE TABLE "mail_selected" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT[],
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_selected_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "mail_selected_message_id_key" ON "mail_selected"("message_id");
```

### タグ付けキーワードテーブル

```SQL  
-- CreateTable
CREATE TABLE "mail_keyword" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "re" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_keyword_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "mail_keyword_name_key" ON "mail_keyword"("name");
```

### サマリー抽出キーワードテーブル

```SQL
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
CREATE UNIQUE INDEX "mail_extraction_name_key" ON "mail_extraction"("name");
```
