import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { toResponse, ValidationError } from '@/lib/errors';

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return Response.json(
        {
          title: 'UNAUTHORIZED',
          status: 401,
          detail: error?.message || 'Email atau password salah.',
          request_id: requestId,
        },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.session.expires_in || 3600,
    });

    return Response.json({
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        access_token: data.session.access_token,
        message: 'Login berhasil via Supabase Auth',
      },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}

