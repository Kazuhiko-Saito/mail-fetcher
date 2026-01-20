import fs from "fs";
import path from "path";
import { searchKeyword, extractionRegex } from "./lib/util.mjs";

const CONSTANT_FLAG = process.argv.includes("--constant");
const MAIL_PATH = path.join(import.meta.dirname, "mail");

/**
 * 'mail'ディレクトリ内の各メールファイル（*.txt）を読み込み、
 * キーワード検索と情報抽出を実行してコンソールに出力する
 * @returns {void}
 */
export const emailRegExp = async () => {
  const files = fs.readdirSync(MAIL_PATH);

  let index = 0;
  for (const file of files) {
    const filePath = path.join(MAIL_PATH, file);

    if (!fs.statSync(filePath).isFile()) {
      continue;
    }

    if (path.extname(file) !== ".txt") {
      continue;
    }

    const mail = fs.readFileSync(filePath, "utf-8");

    console.log(`-----  Mail No.${index + 1}  -----`);

    // キーワード検索
    const tags = await searchKeyword(mail.trim(), CONSTANT_FLAG);
    tags.forEach((tag) => {
      console.log("Tag: ", tag);
    });

    // キーワード抽出
    const summary = await extractionRegex(mail.trim(), CONSTANT_FLAG);
    console.log(summary.join("\r\n"));

    index++;
  }
};

// 実行
emailRegExp();
