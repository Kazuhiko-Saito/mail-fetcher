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

    searchKeyword(mail.trim()).forEach((tag) => {
      console.log("Tag: ", tag);
    });

    // 抽出結果の取得
    const allProjects = extractionRegex(mail.trim());

    // 案件単位
    allProjects.forEach((project, pIndex) => {
      let memo = `  --- Project ${pIndex + 1} ---\n`;
      // 項目単位
      project.forEach((item) => {
        memo += `  ${item.name}: ${item.value}\n`;
      });
      console.log(memo);
    });
  });
};

// 実行
emailRegExp();
