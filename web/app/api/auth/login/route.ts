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

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      return Response.json(
        {
          title: 'CONFIG_REQUIRED',
          status: 503,
          detail: 'BUTUH_SUPABASE_ANON_KEY',
          request_id: requestId,
        },
        { status: 503 }
      );
    }

    // Autentikasi via Supabase Auth API
    const authUrl = `${config.supabaseUrl}/auth/v1/token?grant_type=password`;
    const res = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return Response.json(
        {
          title: 'UNAUTHORIZED',
          status: res.status,
          detail: data.error_description || data.msg || 'Autentikasi Supabase gagal.',
          request_id: requestId,
        },
        { status: res.status }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('sb-access-token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.expires_in || 3600,
    });

    return Response.json({
      data: {
        user: data.user,
        message: 'Login berhasil via Supabase',
      },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
