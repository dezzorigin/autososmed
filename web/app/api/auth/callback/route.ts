import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      const cookieStore = await cookies();
      cookieStore.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: data.session.expires_in || 3600,
      });
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Jika gagal atau tidak ada code, kembali ke login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
