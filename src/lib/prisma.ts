import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
    var prisma: PrismaClient | undefined;
    var prismaSchemaSignature: string | undefined;
}

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
});

const adapter = new PrismaPg(pool);

const prismaSchemaSignature = JSON.stringify(
    Prisma.dmmf.datamodel.models.map((model) => ({
        name: model.name,
        fields: model.fields.map((field) => field.name),
    }))
);

function createPrismaClient() {
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
}

function getPrismaClient() {
    if (process.env.NODE_ENV === 'production') {
        return createPrismaClient();
    }

    const globalForPrisma = globalThis as typeof globalThis & {
        prisma?: PrismaClient;
        prismaSchemaSignature?: string;
    };

    if (!globalForPrisma.prisma || globalForPrisma.prismaSchemaSignature !== prismaSchemaSignature) {
        void globalForPrisma.prisma?.$disconnect().catch(() => undefined);
        globalForPrisma.prisma = createPrismaClient();
        globalForPrisma.prismaSchemaSignature = prismaSchemaSignature;
    }

    return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
