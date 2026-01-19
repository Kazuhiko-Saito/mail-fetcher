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
      if (!projects[index]) {
        projects[index] = [`--- 案件No. ${index + 1} ---`];
      }

      let value = extraction.num.map((i) => match[i]).join("  ");

      if (extraction.multiLine) {
        const colonIndex = value.indexOf(/[\s：]+/);
        if (colonIndex !== -1) {
          const lineStartIndex = value.lastIndexOf("\n", colonIndex);
          value = value.substring(
            0,
            lineStartIndex === -1 ? 0 : lineStartIndex
          );
        }

        const splitValue = value.split(/(?<=。)/);
        splitValue.forEach((v, i) => {
          if (i === splitValue.length - 1) {
            if (/^・/.test(v)) {
            }
          } else {
            splitValue[i] = v.replaceAll(/\s+/g, "");
          }
        });

        value = splitValue.join("\n").replace(/[\s]+/, "");
      }

      projects[index].push(extraction.name + " ： " + value);
    });
  });
  // 文字列化
  projects.forEach((project, index) => {
    projects[index] = project.join("\n");
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
