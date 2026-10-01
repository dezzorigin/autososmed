// Scheduler core: spintax -> fanout -> dedupe -> stagger.
// Murni fungsi (tanpa IO) biar gampang dites. IO (baca tenants/campaign)
// milik caller (API route / worker).
import { createHash } from 'crypto';

/** Expand spintax deterministik: {a|b|c} dipilih via index. */
export function spin(tpl, i) {
  return tpl.replace(/\{([^}]+)\}/g, (_, g) => {
    const opts = g.split('|');
    return opts[i % opts.length];
  });
}

function jobId(campaignId, tenantId, platform, caption, slot) {
  return (
    `${tenantId}+${platform}+` +
    createHash('sha256')
      .update([campaignId, tenantId, platform, caption, slot].join('|'))
      .digest('hex')
      .slice(0, 12)
  );
}

/**
 * 1 campaign -> N job (tenant x slot x platform).
 * tenants fleksibel (bukan patokan 7), t.aktif===false diskip.
 */
export function fanout({ campaign, tenants, platforms }) {
  const plats = platforms ?? campaign.platforms ?? ['ig'];
  const entitled = tenants.filter(
    (t) => campaign.target_tenants.includes(t.id) && t.aktif !== false,
  );
  const jobs = [];
  entitled.forEach((t, ti) => {
    for (let s = 0; s < t.slot_harian; s++) {
      for (const p of plats) {
        const caption = spin(
          campaign.caption_template
            .replace('{produk}', t.nama)
            .replace('{produkTag}', t.id),
          ti + s,
        );
        jobs.push({
          id: jobId(campaign.id, t.id, p, caption, s),
          tenant: t.id,
          platform: p,
          slot: s + 1,
          caption,
          status: 'queued',
        });
      }
    }
  });
  return { entitled, jobs };
}

/** Buang job ber-id sama (hash collision / input ganda). */
export function dedupe(jobs) {
  const seen = new Set();
  return jobs.filter((j) => {
    if (seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });
}

/** Sebar jam 07:00-22:00 + jitter deterministik -25..+25 mnt. */
export function stagger(jobs, { startMin = 7 * 60, endMin = 22 * 60 } = {}) {
  jobs.forEach((j, i) => {
    const base =
      startMin + Math.floor(((endMin - startMin) * i) / Math.max(jobs.length, 1));
    const jitter = ((i * 37) % 51) - 25;
    const m = Math.min(Math.max(base + jitter, startMin), endMin);
    j.waktu =
      String(Math.floor(m / 60)).padStart(2, '0') +
      ':' +
      String(m % 60).padStart(2, '0');
  });
  return jobs;
}

const PIPELINE_NEED = [
  'cron',
  'load_tenant',
  'entitlement',
  'auth_reuse',
  'normalize_dedupe',
  'execute_browser_post',
  'evidence',
];

/** Kontrak pipeline: kembalikan node yang hilang (kosong = OK). */
export function checkPipeline(pipeline, need = PIPELINE_NEED) {
  return need.filter((n) => !pipeline.nodes.includes(n));
}
