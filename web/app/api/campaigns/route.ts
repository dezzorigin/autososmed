import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { toResponse, ValidationError } from '@/lib/errors';
import { fanout, dedupe, stagger } from '@autososmed/scheduler';

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { jobs: true } } },
    });
    return Response.json({ data: campaigns, request_id: requestId });
  } catch (err) {
    return toResponse(err, requestId);
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const errs: { field: string; message: string }[] = [];
    if (!body?.nama) errs.push({ field: 'nama', message: 'wajib diisi' });
    if (!body?.caption_template)
      errs.push({ field: 'caption_template', message: 'wajib diisi' });
    if (!Array.isArray(body?.target_tenants) || body.target_tenants.length === 0)
      errs.push({ field: 'target_tenants', message: 'minimal 1 tenant' });
    if (errs.length) throw new ValidationError(errs);

    const platforms: string[] = body.platforms ?? ['ig', 'threads', 'tiktok'];
    const tenants = await prisma.tenant.findMany({
      where: { id: { in: body.target_tenants } },
    });

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const c = await tx.campaign.create({
        data: {
          nama: body.nama,
          brief: body.brief ?? '',
          captionTemplate: body.caption_template,
          media: body.media ?? [],
          targetTenantIds: body.target_tenants,
          platforms,
          status: 'queued',
        },
      });
      const { jobs } = fanout({
        campaign: {
          id: c.id,
          caption_template: body.caption_template,
          target_tenants: body.target_tenants,
        },
        tenants: tenants.map((t: (typeof tenants)[number]) => ({
          id: t.id,
          nama: t.nama,
          slot_harian: t.slotHarian,
          aktif: t.aktif,
        })),
        platforms,
      });
      const uniq = stagger(dedupe(jobs));
      await tx.job.createMany({
        data: uniq.map((j) => ({
          id: j.id,
          campaignId: c.id,
          tenantId: j.tenant,
          platform: j.platform,
          slot: j.slot,
          waktu: j.waktu ?? '07:00',
          caption: j.caption,
          media: (body.media ?? [])[0] ?? '',
        })),
      });
      return { campaign: c, jobCount: uniq.length };
    });

    return Response.json({ data: result, request_id: requestId }, { status: 201 });
  } catch (err) {
    return toResponse(err, requestId);
  }
}
