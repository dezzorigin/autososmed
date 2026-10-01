import { prisma } from '@/lib/prisma';
import { toResponse, ValidationError } from '@/lib/errors';

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const tenants = await prisma.tenant.findMany({ orderBy: { id: 'asc' } });
    return Response.json({ data: tenants, request_id: requestId });
  } catch (err) {
    return toResponse(err, requestId);
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    if (!body?.id || !body?.nama) {
      throw new ValidationError([
        { field: 'id', message: 'wajib diisi' },
        { field: 'nama', message: 'wajib diisi' },
      ]);
    }
    const t = await prisma.tenant.create({
      data: {
        id: body.id,
        nama: body.nama,
        ig: body.ig ?? null,
        threads: body.threads ?? null,
        tiktok: body.tiktok ?? null,
        slotHarian: body.slot_harian ?? 3,
      },
    });
    return Response.json({ data: t, request_id: requestId }, { status: 201 });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
