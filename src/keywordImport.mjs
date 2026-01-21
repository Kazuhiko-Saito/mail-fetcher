import { prisma } from "./lib/prisma.mjs";
import { keywords, extractions } from "./lib/constant.js";

/**
 * src/lib/constant.jsから検索用キーワードを読み込み、DBに登録する
 * @returns {Promise<void>}
 */
async function importKeywords() {
  console.log("検索用キーワードのインポートを開始します...");

  await prisma.$transaction(async (tx) => {
    await tx.mail_keyword.deleteMany({});
    console.log("既存の検索用キーワードをすべて削除しました。");

    const keywordData = keywords.map((keyword) => ({
      name: keyword.name,
      re: keyword.re.toString(),
    }));

    const result = await tx.mail_keyword.createMany({
      data: keywordData,
    });
    console.log(`${result.count}件の検索用キーワードをインポートしました。`);
  });

  console.log("検索用キーワードのインポートが完了しました。");
}

/**
 * src/lib/constant.jsから抽出用キーワードを読み込み、DBに登録する
 * @returns {Promise<void>}
 */
async function importExtractions() {
  console.log("抽出用キーワードのインポートを開始します...");

  await prisma.$transaction(async (tx) => {
    await tx.mail_extraction.deleteMany({});
    console.log("既存の抽出用キーワードをすべて削除しました。");

    const extractionData = extractions.map((extraction) => ({
      name: extraction.name,
      re: extraction.re.toString(),
      num: extraction.num,
      multi_line: extraction.multiLine,
    }));

    const result = await tx.mail_extraction.createMany({
      data: extractionData,
    });
    console.log(`${result.count}件の抽出用キーワードをインポートしました。`);
  });

  console.log("抽出用キーワードのインポートが完了しました。");
}

/**
 * メイン実行関数。検索用キーワードと抽出用キーワードのインポートを順に実行する
 * @returns {Promise<void>}
 */
async function keywordImport() {
  await importKeywords();
  console.log("\n");
  await importExtractions();
}

keywordImport()
  .catch((e) => {
    console.error("エラーが発生しました:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
