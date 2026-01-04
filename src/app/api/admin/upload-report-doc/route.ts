import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureUploadDir() {
    await fs.mkdir(uploadDir, { recursive: true });
}

export async function POST(req: NextRequest) {
    const session = await requireAuth(req);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await ensureUploadDir();

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const fileName = file.name || 'document.pdf';
        const lowerName = fileName.toLowerCase();
        const contentType = (file as File).type || '';

        // Validate type
        const isPdf = lowerName.endsWith('.pdf') || contentType === 'application/pdf';
        if (!isPdf) {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
        }

        // Validate size (server-side)
        const buffer = Buffer.from(await (file as File).arrayBuffer());
        if (buffer.length > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });
        }

        const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`;
        const filepath = path.join(uploadDir, filename);

        await fs.writeFile(filepath, buffer);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            name: filename,
            size: buffer.length,
        });
    } catch (error) {
        console.error('PDF upload failed', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
