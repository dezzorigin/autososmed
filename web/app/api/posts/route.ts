import { prisma } from '@/lib/prisma';
import { toResponse, ValidationError } from '@/lib/errors';

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const posts = await prisma.post.findMany({
      where: status && status !== 'all' ? { status } : undefined,
      include: {
        account: {
          select: { id: true, platform: true, username: true, status: true },
        },
        media: true,
      },
      orderBy: { scheduledAt: 'desc' },
      take: 100,
    });

    return Response.json({
      data: posts,
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const caption = body?.caption?.trim();
    const campaign = body?.campaign?.trim() || 'Default Campaign';
    const accountId = body?.account_id || body?.accountId || null;
    const mediaId = body?.media_id || body?.mediaId || null;
    const scheduledAtRaw = body?.scheduled_at || body?.scheduledAt;

    if (!caption) {
      throw new ValidationError([{ field: 'caption', message: 'Caption wajib diisi' }]);
    }

    const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : new Date();

    const post = await prisma.post.create({
      data: {
        campaign,
        caption,
        scheduledAt,
        status: 'scheduled',
        accountId: accountId || null,
        mediaId: mediaId || null,
      },
      include: {
        account: true,
        media: true,
      },
    });

    return Response.json(
      {
        data: post,
        request_id: requestId,
      },
      { status: 201 }
    );
  } catch (err) {
    return toResponse(err, requestId);
  }
}
