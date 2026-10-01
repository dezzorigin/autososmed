import { runJob } from '@autososmed/worker';
import { toResponse, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dry_run !== false; // default true for safe execution unless explicitly false

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new NotFoundError('Job', id);
    }

    const result = await runJob(id, { dryRun });
    const updatedJob = await prisma.job.findUnique({
      where: { id },
      include: { evidence: true },
    });

    return Response.json({
      data: {
        job: updatedJob,
        execution: result,
      },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
