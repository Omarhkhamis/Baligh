import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureUploadDir() {
    await fs.mkdir(uploadDir, { recursive: true });
}

export async function GET() {
    try {
        await ensureUploadDir();
        const files = await fs.readdir(uploadDir);
        const entries = await Promise.all(
            files.map(async (name) => {
                const stat = await fs.stat(path.join(uploadDir, name));
                return {
                    name,
                    url: `/uploads/${name}`,
                    size: stat.size,
                    modified: stat.mtime,
                };
            })
        );
        return NextResponse.json(entries);
    } catch (error) {
        console.error('Failed to list uploads', error);
        return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await ensureUploadDir();

        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name || '');
        const safeExt = ext && ext.length <= 6 ? ext : '';
        const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`;
        const filepath = path.join(uploadDir, filename);

        await fs.writeFile(filepath, buffer);

        return NextResponse.json({ url: `/uploads/${filename}`, name: filename });
    } catch (error) {
        console.error('Upload failed', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const name = req.nextUrl.searchParams.get('name');
        if (!name) {
            return NextResponse.json({ error: 'Missing file name' }, { status: 400 });
        }

        const targetPath = path.join(uploadDir, name);
        await fs.unlink(targetPath);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Delete failed', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
