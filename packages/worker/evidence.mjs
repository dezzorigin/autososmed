import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const evidenceDir = path.resolve(rootDir, 'evidence');

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

/**
 * Generate a visual mockup screenshot for a job in dry-run or verification mode.
 * @param {import('playwright').Browser} browser
 * @param {object} job
 * @returns {Promise<string>} path to screenshot
 */
export async function generateMockupScreenshot(browser, job) {
  const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
  
  const platformColor =
    job.platform === 'ig'
      ? '#E1306C'
      : job.platform === 'tiktok'
      ? '#00f2fe'
      : '#7c3aed';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            background: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: #f8fafc;
          }
          .card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            width: 480px;
            padding: 24px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          }
          .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          .avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: ${platformColor};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            color: #fff;
          }
          .tenant {
            font-weight: 600;
            font-size: 16px;
          }
          .platform {
            font-size: 12px;
            text-transform: uppercase;
            color: #94a3b8;
          }
          .caption {
            font-size: 15px;
            line-height: 1.6;
            color: #e2e8f0;
            margin-bottom: 20px;
            white-space: pre-wrap;
          }
          .footer {
            border-top: 1px solid #334155;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
          }
          .badge {
            background: #10b98122;
            color: #34d399;
            padding: 2px 8px;
            border-radius: 9999px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="avatar">${job.platform.slice(0, 2).toUpperCase()}</div>
            <div>
              <div class="tenant">${job.tenantId}</div>
              <div class="platform">${job.platform} • Scheduled at ${job.waktu}</div>
            </div>
          </div>
          <div class="caption">${escapeHtml(job.caption)}</div>
          <div class="footer">
            <span>ID: ${job.id}</span>
            <span class="badge">SIMULATED EVIDENCE</span>
          </div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  const screenshotPath = path.resolve(evidenceDir, `${job.id}.png`);
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
 * Dispatch notification to Discord webhook if configured.
 * @param {object} payload
 */
export async function sendDiscordNotification(payload) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('http')) return;

  try {
    const body = {
      content: `📢 **AutoSosmed Job ${payload.status.toUpperCase()}**`,
      embeds: [
        {
          title: `[${payload.platform.toUpperCase()}] ${payload.tenantId}`,
          description: payload.caption,
          color: payload.status === 'done' ? 0x10b981 : 0xef4444,
          fields: [
            { name: 'Job ID', value: payload.jobId, inline: true },
            { name: 'Waktu Stagger', value: payload.waktu || '-', inline: true },
            { name: 'Post URL', value: payload.postUrl || 'N/A', inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn('[discord] Gagal kirim notif:', err.message);
  }
}
