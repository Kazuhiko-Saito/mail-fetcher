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
      if (!projects[index]) {
        projects[index] = [];
      }

      let value = extraction.num.map((i) => match[i]).join(" ");

      if (extraction.multiLine) {
        const colonIndex = value.indexOf("：");
        if (colonIndex !== -1) {
          const lineStartIndex = value.lastIndexOf("\n", colonIndex);
          value = value.substring(
            0,
            lineStartIndex === -1 ? 0 : lineStartIndex
          );
        }

        const lastPeriodIndex = value.lastIndexOf("。");
        if (lastPeriodIndex !== -1) {
          value = value.substring(0, lastPeriodIndex + 1);
        }
      }

      const cleanedValue = value.replace(/[\s\n]+/gm, "").trim();

      projects[index].push({
        name: extraction.name,
        value: cleanedValue,
      });
    });
  });
  // 案件ごとの配列を返却
  return projects;
};
