import { toResponse, ValidationError } from '@/lib/errors';
import { config } from '@/lib/config';

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const brief = body?.brief?.trim();

    if (!brief) {
      throw new ValidationError([{ field: 'brief', message: 'Brief campaign wajib diisi' }]);
    }

    const aiGatewayUrl = config.aiGatewayUrl || 'http://localhost:20128/v1';
    const aiGatewayKey = process.env.AI_GATEWAY_KEY || '';

    const systemPrompt = `Kamu adalah pakar copywriting media sosial untuk multi-brand SaaS.
Tugasmu adalah menghasilkan SATU template caption format SPINTAX berkualitas tinggi berdasarkan brief yang diberikan.
Spintax menggunakan kurung kurawal dan pipa: {pilihan1|pilihan2|pilihan3}.
Gunakan placeholder {produk} jika menyebut nama brand/produk.
Sertakan rotasi hook, variasi penawaran/fitur, call-to-action (CTA), dan hashtag yang relevan.
KEMBALIKAN HANYA TEMPLATE SPINTAX (tanpa pembuka/penutup/markdown code block).`;

    const userPrompt = `Brief Campaign:
${brief}

Buatkan template spintax siap pakai untuk postingan di Instagram, Threads, dan TikTok.`;

    const response = await fetch(`${aiGatewayUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiGatewayKey}`,
      },
      body: JSON.stringify({
        model: 'ag/gemini-3.8-flash',
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Gateway error (${response.status}): ${errText}`);
    }

    const aiData = await response.json();
    const generatedCaption = aiData.choices?.[0]?.message?.content?.trim() || '';

    return Response.json({
      data: {
        template: generatedCaption,
        model: 'ag/gemini-3.8-flash',
      },
      request_id: requestId,
    });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
