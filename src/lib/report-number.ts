import { Prisma } from '@prisma/client';

export async function generateReportNumber(
    tx: Prisma.TransactionClient,
    createdAt: Date,
    offset = 0
) {
    const year = createdAt.getUTCFullYear();
    const prefix = `BLG-${year}-`;
    const existingCount = await tx.legalReport.count({
        where: {
            reportNumber: {
                startsWith: prefix,
            },
        },
    });

    return `${prefix}${String(existingCount + 1 + offset).padStart(4, '0')}`;
}

export function isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
