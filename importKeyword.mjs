import { prisma } from "./lib/prisma.mjs";
import { keywords, extractions } from "./lib/constant.js";

/**
 * lib/constant.jsから検索キーワードを読み込み、DBに登録/更新する
 * @returns {Promise<void>}
 */
async function importKeywords() {
  console.log("検索キーワードのインポートを開始します...");

  for (const keyword of keywords) {
    const upsertedKeyword = await prisma.mail_keyword.upsert({
      where: { name: keyword.name },
      update: {
        re: keyword.re.toString(),
      },
      create: {
        name: keyword.name,
        re: keyword.re.toString(),
      },
    });
    console.log(`キーワード「${upsertedKeyword.name}」をインポート/更新しました。`);
  }

  console.log("検索キーワードのインポートが完了しました。");
}

/**
 * lib/constant.jsから抽出キーワードを読み込み、DBに登録/更新する
 * @returns {Promise<void>}
 */
async function importExtractions() {
  console.log("抽出キーワードのインポートを開始します...");

  for (const extraction of extractions) {
    const upsertedExtraction = await prisma.mail_extraction.upsert({
      where: { name: extraction.name },
      update: {
        re: extraction.re.toString(),
        num: extraction.num,
        multi_line: extraction.multiLine,
      },
      create: {
        name: extraction.name,
        re: extraction.re.toString(),
        num: extraction.num,
        multi_line: extraction.multiLine,
      },
    });
    console.log(
      `抽出キーワード「${upsertedExtraction.name}」をインポート/更新しました。`
    );
  }

  console.log("抽出キーワードのインポートが完了しました。");
}

/**
 * メイン実行関数。キーワードと抽出設定のインポートを順に実行する
 * @returns {Promise<void>}
 */
async function main() {
  await importKeywords();
  console.log("\n");
  await importExtractions();
}

main()
  .catch((e) => {
    console.error("エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });