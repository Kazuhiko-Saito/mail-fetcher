import Pop3Command from "node-pop3";
import PostalMime from "postal-mime";
import { prisma } from "./lib/prisma.mjs";
import { getReceivedDate } from "./lib/util.mjs";

const FORCE_MODE = process.argv.includes("--force");

/**
 * POP3サーバーに接続し、新しいメールを取得してDBに保存する
 * @returns {Promise<void>} 処理が完了したときに解決されるPromise
 */
export const emailFetcher = async () => {
  const mailSetting = {
    user: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    host: process.env.MAIL_SERVERNAME,
    port: process.env.MAIL_SERVERPORT,
    stls: true,
    tlsOptions: {
      servername: process.env.MAIL_TLS_SERVERNAME,
    },
  };

  const client = new Pop3Command(mailSetting);

  try {
    await client.connect();
    console.log("CONNECT success");

    // モダンなSASL AUTH PLAIN認証を使用
    const authString = `\0${mailSetting.user}\0${mailSetting.password}`;
    const base64Auth = Buffer.from(authString).toString("base64");
    await client.command("AUTH", "PLAIN", base64Auth);
    console.log("Authentication (AUTH PLAIN) successful");

    const [statInfo] = await client.command("STAT");
    console.log(`STAT response: ${statInfo}`);

    const msglist = await client.UIDL();
    if (msglist.length === 0) {
      console.log("UIDL reports 0 messages.");
      return;
    }
    console.log(`UIDL success with ${msglist.length} element(s)`);

    for (let i = msglist.length; i > 0; i--) {
      console.log("RETR start for msgnumber " + i);
      const data = await client.RETR(i);
      try {
        const isStored = await storeMail(data);
        if (!isStored) {
          // 登録済みメールの場合
          if (FORCE_MODE) {
            console.log("重複していますが、全件処理モードのため続行します。");
          } else {
            console.log("重複のため処理を終了します。");
            break;
          }
        }
      } catch (e) {
        console.error("Error during storeMail:", e);
        throw e;
      }
    }
  } catch (err) {
    console.error("POP3 client error:", err);
    throw err;
  } finally {
    await client.QUIT();
    console.log("QUIT success");
  }
};

/**
 * メールデータを解析し、DBに保存する
 * 重複チェックを行い、必要な情報が揃っているか確認した上でDBに登録する
 * @param {string} data - メールの生データ
 * @returns {Promise<boolean>} メールが正常に保存された場合はtrue、重複している場合はfalseを返す
 */
const storeMail = async (data) => {
  // メールパースと本文抽出
  const email = await PostalMime.parse(data);
  const body = email.text || email.html || "";

  // 重複チェック
  const existingEmail = await prisma.mail_daily.findUnique({
    where: {
      message_id: email.messageId,
    },
  });

  if (existingEmail) {
    console.log("すでに登録されています。");
    return false;
  }

  // 受信日時抽出
  const received_at = await getReceivedDate(data);

  // 必要項目チェック
  if (
    !email.messageId ||
    !email.subject ||
    !email.from?.address ||
    !received_at ||
    !body
  ) {
    console.log("必要情報がありません。登録をスキップします。");
    return true;
  }

  // NULL文字除去
  const cleanMessageId = (email.messageId || "").replace(/\x00/g, "");
  const cleanSubject = (email.subject || "").replace(/\x00/g, "");
  const cleanSender = `${email.from?.name || ""} <${
    email.from?.address || ""
  }>`.replace(/\x00/g, "");
  const cleanBody = (body || "").replace(/\x00/g, "");

  // DB登録
  try {
    // emailテーブルに登録
    await prisma.mail_daily.create({
      data: {
        message_id: cleanMessageId,
        subject: cleanSubject,
        sender: cleanSender,
        received_at: received_at,
        body: cleanBody,
      },
    });
  } catch (e) {
    console.error(e.message);
    throw e;
  }

  // 正常終了
  return true;
};

/**
 * メール取得処理のメイン関数
 * emailFetcherを実行し、成功または失敗のメッセージを出力する
 */
async function main() {
  try {
    await emailFetcher();
    console.log("メール取得完了！");
  } catch (err) {
    console.error("致命的なエラー:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
