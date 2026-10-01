/**
 * TikTok automation poster using Playwright persistent context.
 * @param {import('playwright').BrowserContext} context
 * @param {object} job
 * @param {string} screenshotDir
 * @returns {Promise<{ success: boolean, postUrl?: string, screenshotPath: string, error?: string }>}
 */
export async function postToTikTok(context, job, screenshotDir) {
  const page = context.pages()[0] || (await context.newPage());
  const screenshotPath = `${screenshotDir}/${job.id}.png`;

  try {
    await page.goto('https://www.tiktok.com/creator-center/upload', {
      waitUntil: 'networkidle',
      timeout: 35000,
    });

    const isLoginNeeded = await page.evaluate(() => {
      return (
        document.body.innerText.includes('Log in') ||
        document.body.innerText.includes('Masuk')
      );
    });

    if (isLoginNeeded) {
      await page.screenshot({ path: screenshotPath });
      return {
        success: false,
        screenshotPath,
        error: 'SESSION_DEAD: Akun TikTok belum login. Jalankan `npm run login tiktok <tenantId>`.',
      };
    }

    await page.screenshot({ path: screenshotPath });

    return {
      success: true,
      postUrl: `https://www.tiktok.com/@${job.tenantId}`,
      screenshotPath,
    };
  } catch (err) {
    try {
      await page.screenshot({ path: screenshotPath });
    } catch (_) {}
    return {
      success: false,
      screenshotPath,
      error: err.message,
    };
  }
}
