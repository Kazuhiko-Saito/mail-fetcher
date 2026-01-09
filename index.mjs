import POP3Client from "poplib";
import PostalMime from "postal-mime";
import { prisma } from "prisma";

const mailsetting = {
  username: process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD,
  server: {
    name: process.env.MAIL_SERVERNAME,
    port: process.env.MAIL_SERVERPORT,
  },
};

// 検索用キーワード
const keywords= [];

// 抽出用キーワード
const extractions = [
  { name: "サンプル", regex: /サンプル/g },
];

let currentMsgNum = 1;
let totalMsgCount = 0;

export const emailProcessor = () => {
  return new Promise((resolve, reject) => {
    const client = new POP3Client(
      mailsetting.server.port,
      mailsetting.server.name,
      {
        tlserrs: false,
        enabletls: false,
        debug: false,
      }
    );

    client.on("error", (err) => {
      console.error("POP3 client error:", err);
      client.quit();
      reject(err);
    });

    client.on("connect", () => {
      console.log("CONNECT success");
      client.login(mailsetting.username, mailsetting.password);
    });

    client.on("login", (status, rawdata) => {
      if (status) {
        console.log("LOGIN/PASS success");
        client.list();
      } else {
        console.log("LOGIN/PASS failed");
        client.quit();
        reject(new Error("LOGIN/PASS failed"));
      }
    });

    client.on("list", (status, msgcount, msgnumber, data, rawdata) => {
      if (!status) {
        console.log("LIST failed");
        client.quit();
        reject(new Error("LIST failed"));
      } else {
        console.log("LIST success with " + msgcount + " element(s)");
        totalMsgCount = msgcount;
        if (msgcount > 0) {
          currentMsgNum = msgcount;
          client.retr(currentMsgNum);
        } else {
          client.quit();
        }
      }
    });

    client.on("retr", async (status, msgnumber, data, rawdata) => {
      currentMsgNum = msgnumber;
      if (!status) {
        console.log("RETR failed for msgnumber " + msgnumber);
        client.quit();
        reject(new Error(`RETR failed for msgnumber ${msgnumber}`));
      } else {
        console.log("RETR success for msgnumber " + msgnumber);
        try {
          if (await storeMail(data)) {
            if (currentMsgNum > 1) {
              currentMsgNum--;
              client.retr(currentMsgNum);
            } else {
              client.quit();
            }
          } else {
            client.quit();
          }
        } catch (e) {
          console.error("Error during storeMail:", e);
          client.quit();
          reject(e);
        }
      }
    });

    client.on("quit", (status, rawdata) => {
      if (status) {
        console.log("QUIT success");
        resolve();
      } else {
        console.log("QUIT failed");
        reject(new Error("QUIT failed"));
      }
    });
  });
};

const storeMail = async (data) => {
  // メールパースと本文抽出
  const email = await PostalMime.parse(data);
  const body = email.text || email.html || "";

  // 必要項目チェック
  if (
    !email.messageId ||
    !email.subject ||
    !email.from?.address ||
    !email.date ||
    !body
  ) {
    console.log("必要情報がありません。");
    return true;
  }

  // 重複チェック
  const existingEmail = await prisma.email.findUnique({
    where: {
      message_id: email.messageId,
    },
  });
  
  if (existingEmail) {
    console.log("すでに登録されています。");
    return false;
  }

  // NULL文字除去
  const cleanMessageId = (email.messageId || "").replace(/\x00/g, "");
  const cleanSubject = (email.subject || "").replace(/\x00/g, "");
  const cleanSender = `${email.from?.name || ""} <${email.from?.address || ""}>`.replace(/\x00/g, "");
  const cleanBody = (body || "").replace(/\x00/g, "");

  // DB登録
  try {
    // emailテーブルに登録
    await prisma.email.create({
      data: {
        message_id: cleanMessageId,
        subject: cleanSubject,
        sender: cleanSender,
        received_at: email.date ? new Date(email.date) : new Date(),
        body: cleanBody,
      }
    });
  } catch (e) {
    console.error("[ERR] ", (e).message);
    throw e;
  }
  // キーワード検索
  const tag = searchKeyword(body);

  // 正規表現で抽出
  const text = extractionRegex(body);

  // 正常終了
  return true;
};

// キーワード検索
const searchKeyword = (body) => {
  // キーワードチェック
  if (keywords.length === 0) {
    return [];
  }

  // タグ配列
  const tag= [];

  // キーワード検索
  keywords.forEach((keyword) => {
    if (body.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())) {
      console.log("Tag: " + keyword);
      tag.push(keyword);
    }
  });

  // タグ返却
  return tag;
};

// 正規表現で抽出
const extractionRegex = (body) => {
  // 正規表現チェック
  if (extractions.length === 0) {
    return;
  }

  // 抽出配列
  const text = [];

  // 正規表現検索
  extractions.forEach((extraction) => {
    const matches = body.match(extraction.regex);
    if (matches) {
      matches.forEach((match) => {
        text.push(match);
      });
    }
  });

  // 抽出配列返却
  return text;
};

// メールリスト取得
export const getEmailList = async () => {
  // メールリスト取得
  const emails = await prisma.email.findMany({
    select: {
      message_id: true,
      subject: true,
      sender: true,
      received_at: true,
      body: true
    },
    orderBy: {
      received_at: "desc",
    },
  });

  // メールリスト返却
  return emails;
};
