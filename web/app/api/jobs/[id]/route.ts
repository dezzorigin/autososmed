import { prisma } from '@/lib/prisma';
import { toResponse, ValidationError } from '@/lib/errors';

const STATUSES = ['queued', 'running', 'done', 'failed', 'skipped'];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = await params;
    const body = await req.json();
    if (!STATUSES.includes(body?.status)) {
      throw new ValidationError([
        { field: 'status', message: `harus salah satu: ${STATUSES.join(', ')}` },
      ]);
    }
    const job = await prisma.job.update({
      where: { id },
      data: { status: body.status },
    });
    return Response.json({ data: job, request_id: requestId });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
