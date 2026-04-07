import crypto from 'crypto';
import { Prisma } from '@prisma/client';

export async function generateReportNumber(
    _tx: Prisma.TransactionClient,
    createdAt: Date,
    offset = 0
) {
    const year = createdAt.getUTCFullYear();
    const month = String(createdAt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(createdAt.getUTCDate()).padStart(2, '0');
    const entropy = crypto.randomBytes(4).toString('hex').toUpperCase();
    const retrySuffix = offset > 0 ? `-${offset}` : '';

    return `BLG-${year}-${month}${day}-${entropy}${retrySuffix}`;
}

export function isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
