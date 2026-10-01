// TDD scheduler: RED dulu (node --test), lalu implementasi di fanout.mjs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spin, fanout, dedupe, stagger, checkPipeline } from './fanout.mjs';

const tenants = [
  { id: 'kopi-a', nama: 'Kopi A', slot_harian: 2 },
  { id: 'kopi-b', nama: 'Kopi B', slot_harian: 2 },
  { id: 'kopi-c', nama: 'Kopi C', slot_harian: 2, aktif: false }, // diskip
];
const campaign = {
  id: 'cmp-001',
  caption_template:
    '{Coba|Kenalin} {produk} — {diskon|gratis ongkir}! #{produkTag}',
  target_tenants: ['kopi-a', 'kopi-b', 'kopi-c'],
  platforms: ['ig', 'threads'],
};

describe('spin', () => {
  it('deterministik per index', () => {
    assert.equal(spin('{a|b|c}', 0), 'a');
    assert.equal(spin('{a|b|c}', 4), 'b');
  });
});

describe('fanout fleksibel (bukan patokan 7)', () => {
  it('2 tenant aktif x 2 slot x 2 platform = 8 job', () => {
    const { entitled, jobs } = fanout({ campaign, tenants });
    assert.equal(entitled.length, 2);
    assert.equal(jobs.length, 8);
    assert.ok(jobs.every((j) => j.status === 'queued'));
    assert.ok(jobs.every((j) => j.tenant !== 'kopi-c'));
  });
  it('caption bervariasi antar tenant (spintax jalan)', () => {
    const { jobs } = fanout({ campaign, tenants });
    const caps = new Set(jobs.map((j) => j.caption));
    assert.ok(caps.size > 1);
  });
});

describe('dedupe', () => {
  it('id sama dibuang', () => {
    const { jobs } = fanout({ campaign, tenants });
    const dup = [...jobs, { ...jobs[0] }];
    assert.equal(dedupe(dup).length, jobs.length);
  });
});

describe('stagger', () => {
  it('semua dalam 07:00-22:00', () => {
    const { jobs } = fanout({ campaign, tenants });
    stagger(jobs);
    assert.ok(jobs.every((j) => j.waktu >= '07:00' && j.waktu <= '22:00'));
  });
});

describe('pipeline contract', () => {
  it('node wajib lengkap', () => {
    const missing = checkPipeline({
      nodes: [
        'cron',
        'load_tenant',
        'entitlement',
        'auth_reuse',
        'captcha_login_branch',
        'fetch_content',
        'normalize_dedupe',
        'execute_browser_post',
        'notify',
        'evidence',
      ],
    });
    assert.deepEqual(missing, []);
  });
  it('node hilang ketahuan', () => {
    assert.deepEqual(checkPipeline({ nodes: ['cron'] }).length > 0, true);
  });
});
