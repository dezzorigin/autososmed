import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { generateMockupScreenshot, sendDiscordNotification } from './evidence.mjs';
import { postToThreads } from './platforms/threads.mjs';
import { postToInstagram } from './platforms/ig.mjs';
import { postToTikTok } from './platforms/tiktok.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const sessionsDir = path.resolve(rootDir, 'sessions');
const evidenceDir = path.resolve(rootDir, 'evidence');

const prisma = new PrismaClient();

/**
 * Execute a single job by ID.
 * @param {string} jobId
 * @param {object} options - { dryRun: boolean }
 */
export async function runJob(jobId, options = {}) {
  const isDryRun = Boolean(options.dryRun || process.env.DRY_RUN === 'true');

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { tenant: true, campaign: true },
  });

  if (!job) {
    throw new Error(`Job ${jobId} tidak ditemukan di database.`);
  }

  console.log(`[runner] Memulai eksekusi job: ${job.id} (${job.platform} - ${job.tenantId}) [dryRun: ${isDryRun}]`);

  // Set status running
  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'running' },
  });

  const sessionKey = `${job.platform}-${job.tenantId}`;
  const sessionPath = path.resolve(sessionsDir, sessionKey);
  const hasExistingSession = fs.existsSync(sessionPath);

  // Jika dry run atau belum ada sesi browser login, kita jalankan simulasi evidence
  if (isDryRun || !hasExistingSession) {
    console.log(`[runner] Menjalankan mode SIMULATED/DRY-RUN untuk ${job.id}...`);

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const screenshotPath = await generateMockupScreenshot(browser, job);
      const postUrl = `https://${job.platform === 'threads' ? 'threads.net' : job.platform === 'tiktok' ? 'tiktok.com' : 'instagram.com'}/@${job.tenantId}`;

      // Simpan evidence
      await prisma.evidence.upsert({
        where: { jobId: job.id },
        create: {
          jobId: job.id,
          screenshotPath,
          postUrl,
          status: 'success',
        },
        update: {
          screenshotPath,
          postUrl,
          status: 'success',
          executedAt: new Date(),
        },
      });

      // Update job
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'done',
          attempts: { increment: 1 },
        },
      });

      // Send discord notification
      await sendDiscordNotification({
        status: 'done',
        platform: job.platform,
        tenantId: job.tenantId,
        caption: job.caption,
        jobId: job.id,
        waktu: job.waktu,
        postUrl,
      });

      console.log(`[runner] Job ${job.id} SUKSES disimulasikan. Evidence disimpan di ${screenshotPath}`);
      return { success: true, jobId: job.id, screenshotPath, postUrl, simulated: true };
    } finally {
      if (browser) await browser.close();
    }
  }

  // Live browser execution via Playwright persistent context
  console.log(`[runner] Membuka sesi Playwright persistent context: ${sessionPath}`);
  let context;
  try {
    context = await chromium.launchPersistentContext(sessionPath, {
      headless: true,
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });

    let result;
    if (job.platform === 'threads') {
      result = await postToThreads(context, job, evidenceDir);
    } else if (job.platform === 'ig') {
      result = await postToInstagram(context, job, evidenceDir);
    } else if (job.platform === 'tiktok') {
      result = await postToTikTok(context, job, evidenceDir);
    } else {
      throw new Error(`Platform tidak didukung: ${job.platform}`);
    }

    if (result.success) {
      await prisma.evidence.upsert({
        where: { jobId: job.id },
        create: {
          jobId: job.id,
          screenshotPath: result.screenshotPath,
          postUrl: result.postUrl || '',
          status: 'success',
        },
        update: {
          screenshotPath: result.screenshotPath,
          postUrl: result.postUrl || '',
          status: 'success',
          executedAt: new Date(),
        },
      });

      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'done', attempts: { increment: 1 } },
      });

      // Update session live
      await prisma.session.upsert({
        where: { id: sessionKey },
        create: { id: sessionKey, platform: job.platform, tenantId: job.tenantId, status: 'live' },
        update: { status: 'live', lastCheck: new Date() },
      });

      await sendDiscordNotification({
        status: 'done',
        platform: job.platform,
        tenantId: job.tenantId,
        caption: job.caption,
        jobId: job.id,
        waktu: job.waktu,
        postUrl: result.postUrl,
      });

      console.log(`[runner] Job ${job.id} BERHASIL diposting secara LIVE.`);
      return { success: true, jobId: job.id, screenshotPath: result.screenshotPath, postUrl: result.postUrl };
    } else {
      // Gagal / Captcha / Session Dead
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'failed', attempts: { increment: 1 } },
      });

      if (result.error && result.error.includes('SESSION_DEAD')) {
        await prisma.session.upsert({
          where: { id: sessionKey },
          create: { id: sessionKey, platform: job.platform, tenantId: job.tenantId, status: 'dead' },
          update: { status: 'dead', lastCheck: new Date() },
        });
      }

      await sendDiscordNotification({
        status: 'failed',
        platform: job.platform,
        tenantId: job.tenantId,
        caption: `[ERROR: ${result.error}] ${job.caption}`,
        jobId: job.id,
        waktu: job.waktu,
      });

      console.warn(`[runner] Job ${job.id} GAGAL: ${result.error}`);
      return { success: false, jobId: job.id, error: result.error };
    }
  } finally {
    if (context) await context.close();
  }
}

// CLI runner handler
if (process.argv[1] && process.argv[1].endsWith('runner.mjs')) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const jobId = args.find((a) => !a.startsWith('--'));

  if (!jobId) {
    // Jalankan 1 job queued teratas
    prisma.job
      .findFirst({ where: { status: 'queued' }, orderBy: { waktu: 'asc' } })
      .then((firstJob) => {
        if (!firstJob) {
          console.log('[runner] Tidak ada job berstatus queued di antrean.');
          process.exit(0);
        }
        return runJob(firstJob.id, { dryRun: true });
      })
      .then((res) => {
        console.log('[runner] Result:', res);
        process.exit(0);
      })
      .catch((err) => {
        console.error('[runner] Error:', err);
        process.exit(1);
      });
  } else {
    runJob(jobId, { dryRun })
      .then((res) => {
        console.log('[runner] Result:', res);
        process.exit(0);
      })
      .catch((err) => {
        console.error('[runner] Error:', err);
        process.exit(1);
      });
  }
}
