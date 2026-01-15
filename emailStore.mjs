import { join } from "@prisma/client/runtime/client";
import { TransactionIsolationLevel } from "./generated/prisma/internal/prismaNamespace";
import { prisma } from "./lib/prisma.mjs";
import { searchKeyword, extractionRegex } from "./lib/util.mjs";

export const emailStore = async () => {
  try {
    // メール取得
    const mails = await prisma.mail_daily.findMany({
      select: {
        id: true,
        message_id: true,
        subject: true,
        sender: true,
        received_at: true,
        body: true,
      },
      orderBy: {
        received_at: "asc",
      },
    });

    // メール保存
    for (const mail of mails) {
      //
      console.log("Message ID: ", mail.message_id);

      // キーワード検索
      const tag = searchKeyword(mail.body);

      // キーワード抽出
      const summary = extractionRegex(mail.body);

      console.log(summary.join("\n"));

      // await prisma.$transaction(async (tx) => {
      //   // DB登録
      //   await tx.mail_monthly.create({
      //     data: {
      //       message_id: mail.message_id,
      //       subject: mail.subject,
      //       sender: mail.sender,
      //       received_at: mail.received_at,
      //       body: mail.body,
      //       tag: tag,
      //       summary: summary,
      //     },
      //   });

      //   // DB削除
      //   await tx.mail_daily.delete({
      //     where: {
      //       id: mail.id,
      //     },
      //   });
      // });
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
