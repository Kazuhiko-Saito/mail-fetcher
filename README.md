# メールフェッチプログラム

## 概要

メールをPOP3サーバーから取得して、タグ付けとサマリー抽出を行い、DBに保存する。  

## 技術スタック

- JavaScript
  - Node.js
    - prisma
    - node-pop3
    - postal-mime
- PostgreSQL

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

   `.env` を作成し、`.env.sample` に設定例があるので参照して接続設定を記述する。

   ```
   MAIL_USERNAME=＜メールアカウント＞
   MAIL_PASSWORD=＜メールパスワード＞
   MAIL_SERVERNAME=＜POP3サーバーアドレス＞
   MAIL_SERVERPORT=＜POP3サーバーポート番号＞
   MAIL_TLS_SERVERNAME=＜TLSオプション用サーバーアドレス＞
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

### メールフェッチ処理

POP3サーバーよりメールを取得して、デイリーメールテーブルに保存する。  
サーバー上にて定期実行することにより、自動的にメールをデイリーメール情報テーブルに蓄積できる。  
メールの取得漏れが発生した際は、全件実行を手動で行うことで補完できる。

```bash
# 通常実行
npx tsx src/emailFetcher.mjs

# 全件実行
npx tsx src/emailFetcher.mjs --force
```

or

```bash
# 通常実行
npm run mail:fetch

# 全件実行
npm run mail:fetch_all
```

### メールストア処理

デイリーメールテーブルのメールを取得して、DBに保存されたキーワードでタグ付けとサマリー抽出を行い、マンスリーメール情報テーブルに保存する。  
サーバー上にて定期実行することにより、自動的にメールを分析してマンスリーメール情報テーブルに蓄積できる。

```bash
npx tsx src/emailStore.mjs
```

or

```bash
npm run mail:store
```

### キーワードテスト処理

タグ付けとサマリー抽出のテスト用プログラムで、[`src/lib/util.mjs`](./src/lib/util.mjs) の `searchKeyword` 関数と `extractionRegex` 関数を実行する。  
その際のテスト用メール本文は [`mail`](./mail/) ディレクトリに格納されたテキストファイル（\*.txt）を参照する。  
検索用キーワード定義と抽出用キーワード定義は、それぞれDB上あるいは [`src/lib/constant.js`](./src/lib/constant.js) に定数で定義している。

```bash
# DB上のキーワードテスト
npx tsx src/keywordTest.mjs

# 定数のキーワードテスト
npx tsx src/keywordTest.mjs --constant
```

or

```bash
# DB上のキーワードテスト
npm run keyword:test_db

# 定数のキーワードテスト
npm run keyword:test_constant
```

### キーワードインポート処理

[`src/lib/constant.js`](./src/lib/constant.js) に定義されている検索用キーワードと抽出用キーワードをテーブルにインポートする。

```bash
npx tsx src/keywordImport.mjs
```

or

```bash
npm run keyword:import
```

## テーブル定義

### デイリーメール情報テーブル

```SQL
-- CreateTable
CREATE TABLE "mail_daily" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "date_sent" TIMESTAMP(3) NOT NULL,
    "date_received" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_daily_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "mail_daily_message_id_key" ON "mail_daily"("message_id");
```

### マンスリーメール情報テーブル

```SQL
-- CreateTable
CREATE TABLE "mail_monthly" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "date_sent" TIMESTAMP(3) NOT NULL,
    "date_received" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "tag" TEXT[],
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mail_monthly_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "mail_monthly_message_id_key" ON "mail_monthly"("message_id");
```

### 保存済みメール情報テーブル

```SQL
-- CreateTable
CREATE TABLE "mail_selected" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "date_sent" TIMESTAMP(3) NOT NULL,
    "date_received" TIMESTAMP(3) NOT NULL,
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

## 使用例

### 自動実行

Linux系ならcron、Windowsならタスクスケジューラーによる定期実行で、POP3サーバーからメールを取得してタグ付けとサマリー抽出を行いDBに保存する手順を自動化する。

10分ごとに自動的に実行するcronの設定例。

```crontab
*/10 * * * * cd /home/user/mail-fetcher && npx tsx ./src/emailFetcher.mjs && npx tsx ./src/emailStore.mjs
```

### 手動実行

- コマンドラインから実行

   ```bash
   cd /home/user/mail-fetcher
   npx tsx src/emailFetcher.mjs
   npx tsx src/emailStore.mjs
   ```

- 画面等から実行

   - POP3サーバーからメール取得

      `src/emailFetcher.mjs` の `emailFetcher` 関数を呼び出す

   - デイリーメール情報からタグ付けとサマリー抽出

      `src/emailStore.mjs` の `emailStore` 関数を呼び出す

### メンテナンス

#### メール取得漏れ対応

POP3サーバーに残ってるメールで取得できないものがあるときは、コマンドラインから全件実行モード（--forceオプションを付加）で実行する。

```bash
npx tsx src/emailFetcher.mjs --force
```

#### キーワード登録

1. キーワードを登録・修正

   - `src/lib/constant.js` を編集

1. キーワードをテスト

   - コマンドラインから実行

      ```bash
      cd /home/user/mail-fetcher
      npx tsx src/keywordTest.mjs
      ```

   - 画面等から実行

      `src/keywordTest.mjs` の `keywordTest` 関数を呼び出す

1. キーワード登録処理を実行する

   **注意： 検索用キーワードテーブルと抽出用キーワードテーブルはクリアされる**

   - コマンドラインから実行
      ```bash
      cd /home/user/mail-fetcher
      npx tsx src/keywordImport.mjs
      ```
   - 画面等から実行

      `src/keywordImport.mjs` の `keywordImport` 関数を呼び出す
