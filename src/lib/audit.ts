import "server-only";

import { Prisma } from "@/generated/prisma/client";

type AuditEventInput = {
  entityType: string;
  entityId: string;
  eventType: string;
  actorUserId: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditEvent(
  client: Prisma.TransactionClient,
  input: AuditEventInput,
): Promise<void> {
  await client.auditEvent.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      eventType: input.eventType,
      actorUserId: input.actorUserId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}