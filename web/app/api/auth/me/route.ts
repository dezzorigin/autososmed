import { cookies } from 'next/headers';
import { toResponse } from '@/lib/errors';

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('autososmed_session')?.value;

    if (!token) {
      return Response.json(
        {
          title: 'UNAUTHORIZED',
          status: 401,
          detail: 'Belum terautentikasi.',
          request_id: requestId,
        },
        { status: 401 }
      );
    }

    let user;
    try {
      user = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    } catch {
      return Response.json(
        {
          title: 'UNAUTHORIZED',
          status: 401,
          detail: 'Token sesi tidak valid.',
          request_id: requestId,
        },
        { status: 401 }
      );
    }

    return Response.json({
      data: {
        authenticated: true,
        user,
      },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
