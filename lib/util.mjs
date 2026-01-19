import PostalMime from "postal-mime";
import { prisma } from "./prisma.mjs";

/**
 * 文字列を正規表現オブジェクトに変換する
 * DBに格納されている "/pattern/flags" 形式の文字列を想定
 * @param {string} str - 正規表現文字列
 * @returns {RegExp}
 */
const stringToRegExp = (str) => {
  const match = str.match(new RegExp("^/(.*?)/([gimy]*)$"));
  if (match) {
    const pattern = match[1];
    const flags = match[2];
    return new RegExp(pattern, flags);
  }
  // フォールバック
  return new RegExp(str, "gim");
};

/**
 * DBから検索キーワードを取得してRegExpオブジェクトに変換
 * @returns {Promise<Array<{name: string, re: RegExp}>>}
 */
export async function getKeywords() {
  const dbKeywords = await prisma.mail_keyword.findMany();
  return dbKeywords.map((k) => ({
    name: k.name,
    re: stringToRegExp(k.re),
  }));
}

/**
 * DBから抽出キーワードを取得してRegExpオブジェクトに変換
 * @returns {Promise<Array<{name: string, re: RegExp, num: number[], multiLine: boolean}>>}
 */
export async function getExtractions() {
  const dbExtractions = await prisma.mail_extraction.findMany();
  return dbExtractions.map((e) => ({
    name: e.name,
    re: stringToRegExp(e.re),
    num: e.num,
    multiLine: e.multi_line,
  }));
}

// キーワード検索
export const searchKeyword = async (body) => {
  const keywords = await getKeywords();
  // 検索キーワードが空ならから配列を返す
  if (keywords.length === 0) return [];
  // 検索キーワードチェック
  return keywords.flatMap((keyword) => {
    return keyword.re.test(body) ? [keyword.name] : [];
  });
};

/**
 * 複数行のテキストを整形・連結する
 * @param {string} rawText - 整形対象の複数行テキスト
 * @returns {string} - 整形後のテキスト
 */
function formatMultiLineText(rawText = "") {
  let breakFlag = false;

  // テキストを行に分割
  const lines = rawText.split(/\r\n|\n/);

  // 各行を処理
  const processedLines = lines.map((currentLine, index) => {
    if (breakFlag) {
      return null;
    }

    // 除外条件：1行目を除いて行頭と行中に連続空白がある場合はその行を無視する
    if (
      index !== 1 &&
      /^[ \u3000]{2,}/.test(currentLine) &&
      /[ \u3000]{2,}/.test(currentLine.trim())
    ) {
      return null;
    }

    // 除外条件：1行目を除いて行内に「：」がある場合は除外
    if (index !== 1 && /[:\uff1a]/.test(currentLine)) {
      breakFlag = true;
      return null;
    }

    // 1. 先頭と末尾の空白を削除し、2. 連続するスペースを削除
    return currentLine.trim().replace(/[ \u3000]+/g, "");
  });

  // 空でない行をフィルタリング
  const nonEmptyLines = processedLines.filter((l) => l);

  // リストの接頭辞（ビュレットや数字など）の正規表現
  const listPrefixRegex = /^(\s*[・■◆●*+-]\s*|\s*\d+\.\s*)/;

  // 行を結合
  return nonEmptyLines.reduce((result, currentLine, i) => {
    result += currentLine;

    // 次の行が存在し、リスト項目で始まる場合は改行を追加
    if (i < nonEmptyLines.length - 1) {
      const nextLine = nonEmptyLines[i + 1];
      if (listPrefixRegex.test(nextLine)) {
        result += "\n";
      }
    }
    return result;
  }, "");
}

// 正規表現で抽出
export const extractionRegex = async (body) => {
  const extractions = await getExtractions();

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
        line[index] = formatMultiLineText(value[0]);
      } else {
        line[index] = (value[0] || "").trim();
      }

      projects[index].push(extraction.name + " ： " + line[index]);
    });
  });
  // 案件ごとに文字列化して返却
  return projects.map((project) => project.join("\r\n"));
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
