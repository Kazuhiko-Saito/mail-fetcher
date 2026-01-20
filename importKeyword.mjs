import { prisma } from "./lib/prisma.mjs";
import { keywords, extractions } from "./lib/constant.js";

/**
 * lib/constant.jsから検索キーワードを読み込み、DBに登録する
 * @returns {Promise<void>}
 */
async function importKeywords() {
  console.log("検索キーワードのインポートを開始します...");

  await prisma.$transaction(async (tx) => {
    await tx.mail_keyword.deleteMany({});
    console.log("既存の検索キーワードをすべて削除しました。");

    const keywordData = keywords.map((keyword) => ({
      name: keyword.name,
      re: keyword.re.toString(),
    }));

    const result = await tx.mail_keyword.createMany({
      data: keywordData,
    });
    console.log(`${result.count}件の検索キーワードをインポートしました。`);
  });

  console.log("検索キーワードのインポートが完了しました。");
}

/**
 * lib/constant.jsから抽出キーワードを読み込み、DBに登録する
 * @returns {Promise<void>}
 */
async function importExtractions() {
  console.log("抽出キーワードのインポートを開始します...");

  await prisma.$transaction(async (tx) => {
    await tx.mail_extraction.deleteMany({});
    console.log("既存の抽出キーワードをすべて削除しました。");

    const extractionData = extractions.map((extraction) => ({
      name: extraction.name,
      re: extraction.re.toString(),
      num: extraction.num,
      multi_line: extraction.multiLine,
    }));

    const result = await tx.mail_extraction.createMany({
      data: extractionData,
    });
    console.log(`${result.count}件の抽出キーワードをインポートしました。`);
  });

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
