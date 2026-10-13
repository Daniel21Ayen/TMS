import type { PrismaClient } from "@prisma/client";
// accepts either the prisma client or a transaction client
export const notify = (db: { notification: PrismaClient["notification"] }, userId: string, title: string, body: string) =>
  db.notification.create({ data: { userId, title, body } });
