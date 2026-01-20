import { prisma } from "./lib/prisma.mjs";
import { searchKeyword, extractionRegex } from "./lib/util.mjs";

/**
 * mail_dailyテーブルからメールを取得し、キーワード検索と情報抽出を行った後、
 * 結果をmail_monthlyテーブルに保存し、元のレコードを削除する
 * @returns {Promise<boolean>} 処理が正常に完了した場合はtrueを返す
 */
export const emailStore = async () => {
  try {
    // メール取得
    const mails = await prisma.mail_daily.findMany({
      select: {
        id: true,
        message_id: true,
        subject: true,
        sender: true,
        date_sent: true,
        date_received: true,
        body: true,
      },
      orderBy: {
        received_at: "asc",
      },
    });

    // メール保存
    for (const mail of mails) {
      //
      console.log("Message-ID: ", mail.message_id);

      // キーワード検索
      const tag = await searchKeyword(mail.body);

      // キーワード抽出
      const summary = await extractionRegex(mail.body);

      console.log(summary.join("\n"));

      await prisma.$transaction(async (tx) => {
        // DBへ登録
        await tx.mail_monthly.create({
          data: {
            message_id: mail.message_id,
            subject: mail.subject,
            sender: mail.sender,
            date_sent: mail.date_sent,
            date_received: mail.date_received,
            body: mail.body,
            tag: tag,
            summary: summary.join("\r\n"),
          },
        });

        // DBから削除
        await tx.mail_daily.delete({
          where: {
            id: mail.id,
          },
        });
      });
    }
  } catch (e) {
    console.error(e.message);
    throw e;
  }
  // 正常終了
  return true;
};

// メール保存実行
emailStore()
  .then(() => {
    console.log("メール保存完了！");
    process.exit(0);
  })
  .catch((err) => {
    console.error("致命的なエラー:", err);
    process.exit(1);
  });
