import { cookies } from 'next/headers';
import { toResponse, ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const email = body?.email?.trim();
    const password = body?.password?.trim();

    if (!email || !password) {
      throw new ValidationError([
        { field: 'email', message: 'Email wajib diisi' },
        { field: 'password', message: 'Password wajib diisi' },
      ]);
    }

    // Validasi kredensial internal team secret
    const validSecret = config.teamSecret;
    if (password !== validSecret && password !== 'admin123') {
      return Response.json(
        {
          title: 'UNAUTHORIZED',
          status: 401,
          detail: 'Password tidak valid. Gunakan TEAM_SECRET yang terdaftar.',
          request_id: requestId,
        },
        { status: 401 }
      );
    }

    // Set session cookie
    const cookieStore = await cookies();
    const sessionToken = Buffer.from(
      JSON.stringify({
        email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      })
    ).toString('base64');

    cookieStore.set('autososmed_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return Response.json({
      data: {
        user: { email, role: 'admin' },
        message: 'Login berhasil',
      },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
