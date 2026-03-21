import type { Prisma } from '@prisma/client';
import { sendInternalAlertEmail } from '@/lib/internal-email';
import { toDateOnlyTimestamp } from '@/lib/data-security';

const ESCALATION_NOTIFICATION_TITLE = 'High-priority report received';

export function buildEscalationNotificationMessage(reportNumber: string) {
    return `High-priority report received: ${reportNumber} — severity 5 — requires immediate review`;
}

export async function createEscalationDashboardAlerts(
    tx: Prisma.TransactionClient,
    reportNumber: string
) {
    const recipients = await tx.adminUser.findMany({
        where: {
            role: {
                in: ['SUPER_ADMIN', 'ANALYST'],
            },
        },
        select: {
            id: true,
        },
    });

    if (recipients.length === 0) {
        return;
    }

    const message = buildEscalationNotificationMessage(reportNumber);
    const createdAt = toDateOnlyTimestamp(new Date());

    await tx.adminNotification.createMany({
        data: recipients.map((recipient) => ({
            recipientId: recipient.id,
            title: ESCALATION_NOTIFICATION_TITLE,
            message,
            reportNumber,
            createdAt,
        })),
    });
}

export async function sendEscalationEmail(reportNumber: string) {
    return sendInternalAlertEmail(buildEscalationNotificationMessage(reportNumber));
}
