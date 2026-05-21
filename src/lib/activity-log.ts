import { prisma } from "./db";

export async function logActivity(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  diff?: Record<string, unknown>;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        diff: params.diff as never,
      },
    });
  } catch (e) {
    console.error("activity log failed", e);
  }
}
