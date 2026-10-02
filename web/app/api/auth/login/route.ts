import { supabase } from '@/lib/supabase';
import { toResponse, ValidationError } from '@/lib/errors';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const email = body?.email?.trim();

    if (!email) {
      throw new ValidationError([
        { field: 'email', message: 'Email wajib diisi' },
      ]);
    }

    const url = new URL(req.url);
    const redirectUrl = `${url.origin}/api/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return Response.json(
        {
          title: 'UNAUTHORIZED',
          status: 401,
          detail: error?.message || 'Gagal mengirim link OTP.',
          request_id: requestId,
        },
        { status: 401 }
      );
    }

    return Response.json({
      data: {
        message: 'Tautan login ajaib (Magic Link) telah dikirim ke email Anda.',
      },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
