import { prisma } from '@/lib/prisma';
import { toResponse } from '@/lib/errors';

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? 'queued';
    const platform = searchParams.get('platform');
    const jobs = await prisma.job.findMany({
      where: {
        ...(status !== 'all' ? { status } : {}),
        ...(platform ? { platform } : {}),
      },
      orderBy: [{ waktu: 'asc' }, { platform: 'asc' }],
      take: 200,
    });
    return Response.json({ data: jobs, request_id: requestId });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
