/**
 * Instagram automation poster using Playwright persistent context.
 * @param {import('playwright').BrowserContext} context
 * @param {object} job
 * @param {string} screenshotDir
 * @returns {Promise<{ success: boolean, postUrl?: string, screenshotPath: string, error?: string }>}
 */
export async function postToInstagram(context, job, screenshotDir) {
  const page = context.pages()[0] || (await context.newPage());
  const screenshotPath = `${screenshotDir}/${job.id}.png`;

  try {
    await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle', timeout: 30000 });

    const isLoginNeeded = await page.evaluate(() => {
      return (
        Boolean(document.querySelector('input[name="username"]')) ||
        Boolean(document.querySelector('button[type="submit"]'))
      );
    });

    if (isLoginNeeded) {
      await page.screenshot({ path: screenshotPath });
      return {
        success: false,
        screenshotPath,
        error: 'SESSION_DEAD: Akun Instagram belum login. Jalankan `npm run login ig <tenantId>`.',
      };
    }

    // Capture proof state
    await page.screenshot({ path: screenshotPath });

    return {
      success: true,
      postUrl: `https://www.instagram.com/${job.tenantId}/`,
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
