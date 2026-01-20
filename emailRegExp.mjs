import fs from "fs";
import path from "path";
import { searchKeyword, extractionRegex } from "./lib/util.mjs";

const constantFlag = true;
const mailPath = path.join(import.meta.dirname, "mail");

/**
 * 'mail'ディレクトリ内の各メールファイル（*.txt）を読み込み、
 * キーワード検索と情報抽出を実行してコンソールに出力する
 * @returns {void}
 */
export const emailRegExp = async () => {
  const files = fs.readdirSync(mailPath);

  let index = 0;
  for (const file of files) {
    const filePath = path.join(mailPath, file);

    if (!fs.statSync(filePath).isFile()) {
      index++;
      continue;
    }

    if (path.extname(file) !== ".txt") {
      index++;
      continue;
    }

    const mail = fs.readFileSync(filePath, "utf-8");

    console.log(`-----  Mail No.${index + 1}  -----`);

    // キーワード検索
    const tags = await searchKeyword(mail.trim(), constantFlag);
    tags.forEach((tag) => {
      console.log("Tag: ", tag);
    });

    // キーワード抽出
    const summary = await extractionRegex(mail.trim(), constantFlag);
    console.log(summary.join("\r\n"));

    index++;
  }
};

// 実行
emailRegExp();
