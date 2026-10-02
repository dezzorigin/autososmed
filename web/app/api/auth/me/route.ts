import { getSupabaseServerClient } from '@/lib/supabase';
import { toResponse } from '@/lib/errors';

export async function GET(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const { supabase, token } = await getSupabaseServerClient(req);
    if (!token) {
      return Response.json(
        { title: 'UNAUTHORIZED', status: 401, detail: 'Not logged in' },
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return Response.json(
        { title: 'UNAUTHORIZED', status: 401, detail: 'Invalid session' },
        { status: 401 }
      );
    }

    return Response.json({
      data: { user: { id: user.id, email: user.email } },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}

