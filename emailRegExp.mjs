import fs from "fs";
import path from "path";
import { searchKeyword, extractionRegex } from "./lib/util.mjs";

const mailPath = path.join(import.meta.dirname, "mail");

export const emailRegExp = () => {
  const files = fs.readdirSync(mailPath);

  files.forEach((file, index) => {
    const filePath = path.join(mailPath, file);

    if (!fs.statSync(filePath).isFile()) return;

    const mail = fs.readFileSync(filePath, "utf-8");

    console.log(`-----  Mail No.${index + 1}  -----`);

    // キーワード検索
    searchKeyword(mail.trim()).forEach((tag) => {
      console.log("Tag: ", tag);
    });

    // キーワード抽出
    const summary = extractionRegex(mail.trim());

    console.log(summary.join("\n"));
  });
};

// 実行
emailRegExp();
