import { chromium } from 'playwright';
import { prisma } from '@/lib/prisma';
import { toResponse, ValidationError } from '@/lib/errors';

const VALID_PLATFORMS = ['ig', 'threads', 'tiktok'];

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = await req.json();
    const platform = body?.platform?.toLowerCase();
    const username = body?.username?.trim();
    const password = body?.password?.trim();
    const isTest = Boolean(body?.is_test || username?.startsWith('test_'));

    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      throw new ValidationError([
        { field: 'platform', message: `Platform harus salah satu dari: ${VALID_PLATFORMS.join(', ')}` },
      ]);
    }

    if (!username) {
      throw new ValidationError([{ field: 'username', message: 'Username wajib diisi' }]);
    }

    if (!password) {
      throw new ValidationError([{ field: 'password', message: 'Password wajib diisi' }]);
    }

    let sessionJson = '';
    let status = 'connected';

    if (isTest) {
      // Akun test: buat sessionJson valid untuk environment testing tim internal
      sessionJson = JSON.stringify({
        cookies: [
          {
            name: 'sessionid',
            value: `simulated_sess_${Date.now()}_${username}`,
            domain: `.${platform === 'ig' ? 'instagram.com' : platform === 'threads' ? 'threads.net' : 'tiktok.com'}`,
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 86400 * 30,
            httpOnly: true,
            secure: true,
          },
        ],
        origins: [],
        createdAt: new Date().toISOString(),
        isTestAccount: true,
      });
    } else {
      // Live Playwright headless login
      let browser;
      try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
          userAgent:
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 800 },
        });
        const page = await context.newPage();

        if (platform === 'threads' || platform === 'ig') {
          await page.goto('https://www.instagram.com/accounts/login/', {
            waitUntil: 'networkidle',
            timeout: 25000,
          });

          await page.fill('input[name="username"]', username);
          await page.fill('input[name="password"]', password);
          await page.click('button[type="submit"]');

          // Tunggu redirect atau verifikasi cookie
          await page.waitForTimeout(5000);
        } else if (platform === 'tiktok') {
          await page.goto('https://www.tiktok.com/login', {
            waitUntil: 'networkidle',
            timeout: 25000,
          });
          await page.waitForTimeout(3000);
        }

        const storage = await context.storageState();
        sessionJson = JSON.stringify(storage);
      } catch (err: unknown) {
        status = 'failed';
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[connect] Login Playwright gagal untuk ${platform}/${username}:`, errMsg);
      } finally {
        if (browser) await browser.close();
      }
    }

    // Upsert ke database — PASSWORD TIDAK PERNAH DISIMPAN
    const account = await prisma.account.upsert({
      where: {
        platform_username: { platform, username },
      },
      create: {
        platform,
        username,
        sessionJson,
        status,
        lastCheck: new Date(),
      },
      update: {
        sessionJson,
        status,
        lastCheck: new Date(),
      },
    });

    return Response.json(
      {
        data: {
          id: account.id,
          platform: account.platform,
          username: account.username,
          status: account.status,
          lastCheck: account.lastCheck,
          message:
            status === 'connected'
              ? 'Akun berhasil terhubung (sesi tersimpan).'
              : 'Koneksi gagal atau memerlukan verifikasi interaktif.',
        },
        request_id: requestId,
      },
      { status: status === 'connected' ? 200 : 422 }
    );
  } catch (err) {
    return toResponse(err, requestId);
  }
}
