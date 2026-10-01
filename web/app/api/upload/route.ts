import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { toResponse, ValidationError } from '@/lib/errors';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      throw new ValidationError([{ field: 'file', message: 'File media wajib disertakan' }]);
    }

    const uploadsDir = path.resolve(process.cwd(), '../data/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}_${sanitizedOriginalName}`;
    const destinationPath = path.resolve(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destinationPath, buffer);

    const media = await prisma.media.create({
      data: {
        filename,
        path: destinationPath,
        mime: file.type || 'application/octet-stream',
      },
    });

    return Response.json(
      {
        data: media,
        request_id: requestId,
      },
      { status: 201 }
    );
  } catch (err) {
    return toResponse(err, requestId);
  }
}
