import PostalMime from "postal-mime";
import { keywords, extractions } from "./constant.js";

// キーワード検索
export const searchKeyword = (body) => {
  // 検索キーワードが空ならから配列を返す
  if (keywords.length === 0) return [];
  // 検索キーワードチェック
  return keywords.flatMap((keyword) => {
    return keyword.re.test(body) ? [keyword.name] : [];
  });
};

// 正規表現で抽出
export const extractionRegex = (body) => {
  // 抽出キーワードが空ならから配列を返す
  if (extractions.length === 0) return [];

  // 抽出キーワード配列
  const projects = [];

  // 抽出処理
  extractions.forEach((extraction) => {
    // 正規表現で抽出
    const matches = Array.from(body.matchAll(extraction.re));

    // 案件ごとに抽出
    matches.forEach((match, index) => {
      //
      let line = [];

      if (!projects[index]) {
        projects[index] = [`--- 案件No. ${index + 1} ---`];
      }

      // 抽出結果取得
      let value = extraction.num.map((v) => match[v]);

      if (extraction.multiLine) {
        let breakFlag = false;

        // value[0]に複数行のテキストが含まれていると想定
        const rawText = value[0] || "";

        // テキストを行に分割
        const lines = rawText.split(/\r\n|\n/);

        // 各行を処理
        const processedLines = lines.map((currentLine, index) => {
          // 除外条件：ブレークフラグがTrueの場合は無視する
          if (breakFlag) {
            return null;
          }

          // 除外条件：1行目を除いて行頭と行中に連続空白がある場合はその行を無視する
          if (
            index !== 1 &&
            /^[ 　]{2,}/.test(currentLine) &&
            /[ 　]{2,}/.test(currentLine.trim())
          ) {
            return null;
          }

          // 除外条件：1行目を除いて行内に「：」がある場合は除外
          if (index !== 1 && /[:：]/.test(currentLine)) {
            breakFlag = true;
            return null;
          }

          // 1. 先頭と末尾の空白を削除
          let processed = currentLine.trim();

          // 2. 連続する半角・全角スペースを単一の半角スペースに置換
          processed = processed.replace(/[ 　]+/g, "");

          return processed;
        });

        // 処理済みの行を結合
        const nonEmptyLines = processedLines.filter((l) => l);

        // リストの接頭辞（ビュレットや数字など）の正規表現
        const listPrefixRegex = /^(\s*[・■◆●*+-]\s*|\s*\d+\.\s*)/;

        let result = "";

        for (let i = 0; i < nonEmptyLines.length; i++) {
          result += nonEmptyLines[i];

          // 次の行が存在する場合にのみ、連結文字を決定する
          if (i < nonEmptyLines.length - 1) {
            const nextLine = nonEmptyLines[i + 1];

            // 次の行がリスト接頭辞で始まる場合、改行を追加。それ以外はそのまま連結。
            if (listPrefixRegex.test(nextLine)) {
              result += "\n";
            } else {
              result += "";
            }
          }
        }
        line[index] = result;
      } else {
        line[index] = value[0].trim();
      }

      projects[index].push(extraction.name + " ： " + line[index]);
    });
  });
  // 文字列化
  projects.forEach((project, index) => {
    projects[index] = project.join("\r\n");
  });

  // 案件ごとの配列を返却
  return projects;
};

export const getReceivedDate = async (data) => {
  const email = await PostalMime.parse(data);

  const receivedHeader = email.headers.find(
    (h) => h.key.toLowerCase() === "received"
  );

  if (receivedHeader) {
    const headerValue = receivedHeader.value;
    const datePart = headerValue.split(";").pop().trim();
    const dateObj = new Date(datePart);
    return dateObj;
  }

  return null;
};
