import { prisma } from '@/lib/prisma';
import { toResponse } from '@/lib/errors';

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        platform: true,
        username: true,
        status: true,
        lastCheck: true,
        createdAt: true,
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({
      data: accounts,
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
