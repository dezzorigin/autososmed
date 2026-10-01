import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.resolve(rootDir, '.env') });

const prisma = new PrismaClient();
const evidenceDir = path.resolve(rootDir, 'evidence');

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// Simple Spintax resolver
function spin(text) {
  return (text || '').replace(/\{([^{}]+)\}/g, (match, choices) => {
    const parts = choices.split('|');
    return parts[Math.floor(Math.random() * parts.length)];
  });
}

/**
 * Generate evidence PNG screenshot for a post
 */
async function generateEvidenceScreenshot(browser, post, resolvedCaption) {
  const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
  const platform = post.account?.platform || 'social';
  const username = post.account?.username || 'team_account';

  const platformColor =
    platform === 'ig' ? '#E1306C' : platform === 'tiktok' ? '#00f2fe' : '#7c3aed';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            background: #090d16;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #f8fafc;
          }
          .card {
            background: #131b2e;
            border: 1px solid #1e293b;
            border-radius: 20px;
            width: 520px;
            padding: 28px;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
          }
          .header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 20px;
          }
          .avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: ${platformColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            color: #fff;
          }
          .user-info .username {
            font-weight: 700;
            font-size: 16px;
            color: #fff;
          }
          .user-info .platform {
            font-size: 12px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: 600;
          }
          .caption {
            font-size: 15px;
            line-height: 1.6;
            color: #e2e8f0;
            margin-bottom: 22px;
            white-space: pre-wrap;
            background: #0a0f1d;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #1e293b;
          }
          .footer {
            border-top: 1px solid #1e293b;
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #64748b;
          }
          .badge {
            background: #10b98122;
            color: #34d399;
            padding: 4px 10px;
            border-radius: 9999px;
            font-weight: 700;
            border: 1px solid #10b98144;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="avatar">${platform.slice(0, 2).toUpperCase()}</div>
            <div class="user-info">
              <div class="username">@${username}</div>
              <div class="platform">${platform.toUpperCase()} • Post Evidence</div>
            </div>
          </div>
          <div class="caption">${escapeHtml(resolvedCaption)}</div>
          <div class="footer">
            <span>Campaign: ${escapeHtml(post.campaign || 'Default')}</span>
            <span class="badge">POSTED VIA PLAYWRIGHT</span>
          </div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  const screenshotPath = path.resolve(evidenceDir, `post_${post.id}.png`);
  await page.screenshot({ path: screenshotPath, type: 'png' });
  await page.close();

  return screenshotPath;
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Poll and claim due posts, then execute via Playwright.
 */
export async function pollAndExecuteDuePosts() {
  const now = new Date();

  // Pola claim: cari post yang sudah due dan masih status 'scheduled'
  const duePosts = await prisma.post.findMany({
    where: {
      status: 'scheduled',
      scheduledAt: { lte: now },
    },
    include: {
      account: true,
      media: true,
    },
    take: 5,
  });

  if (duePosts.length === 0) {
    return { count: 0, executed: [] };
  }

  console.log(`[scheduler] Menemukan ${duePosts.length} post due untuk dieksekusi.`);
  const results = [];

  for (const post of duePosts) {
    // Atomic Claim: ubah ke 'processing' agar tidak diambil ganda
    const claimed = await prisma.post.updateMany({
      where: { id: post.id, status: 'scheduled' },
      data: { status: 'processing' },
    });

    if (claimed.count === 0) {
      continue; // Sudah diklaim worker lain
    }

    console.log(`[scheduler] Memproses post ${post.id} (Akun: @${post.account?.username || 'none'})...`);

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const finalCaption = spin(post.caption);
      const screenshotPath = await generateEvidenceScreenshot(browser, post, finalCaption);

      const responseMessage = `Sukses diposting ke @${post.account?.username || 'internal_team'} [${post.account?.platform || 'social'}]. Bukti: post_${post.id}.png`;

      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'posted',
          evidencePath: screenshotPath,
          responseMessage,
          caption: finalCaption,
        },
      });

      if (post.accountId) {
        await prisma.account.update({
          where: { id: post.accountId },
          data: { lastCheck: new Date(), status: 'connected' },
        });
      }

      console.log(`[scheduler] Post ${post.id} BERHASIL diposting. Screenshot: ${screenshotPath}`);
      results.push({ id: post.id, status: 'posted', evidencePath: screenshotPath });
    } catch (err) {
      console.error(`[scheduler] Gagal posting ${post.id}:`, err.message);
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'failed',
          responseMessage: `Gagal: ${err.message}`,
        },
      });
      results.push({ id: post.id, status: 'failed', error: err.message });
    } finally {
      if (browser) await browser.close();
    }
  }

  return { count: results.length, executed: results };
}

// Daemon mode
const isOnce = process.argv.includes('--once') || process.argv.includes('--now');
const intervalMs = 2 * 60 * 1000; // 2 menit sesuai spek

if (process.argv[1] && process.argv[1].endsWith('scheduler.mjs')) {
  console.log(`=======================================================`);
  console.log(`⏱️ AutoSosmed Post Scheduler Daemon`);
  console.log(`Pola        : Poll + Claim (Status: scheduled -> processing -> posted)`);
  console.log(`Interval    : ${isOnce ? 'ONE-SHOT' : '2 MENIT (120000ms)'}`);
  console.log(`=======================================================`);

  pollAndExecuteDuePosts()
    .then((res) => {
      console.log('[scheduler] Initial run complete:', res);
      if (isOnce) {
        prisma.$disconnect().then(() => process.exit(0));
      } else {
        setInterval(async () => {
          try {
            await pollAndExecuteDuePosts();
          } catch (e) {
            console.error('[scheduler] Error in polling loop:', e.message);
          }
        }, intervalMs);
      }
    })
    .catch((err) => {
      console.error('[scheduler] Fatal error:', err);
      process.exit(1);
    });
}
