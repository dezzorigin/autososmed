/**
 * Threads automation poster using Playwright persistent context.
 * @param {import('playwright').BrowserContext} context
 * @param {object} job
 * @param {string} screenshotDir
 * @returns {Promise<{ success: boolean, postUrl?: string, screenshotPath: string, error?: string }>}
 */
export async function postToThreads(context, job, screenshotDir) {
  const page = context.pages()[0] || (await context.newPage());
  const screenshotPath = `${screenshotDir}/${job.id}.png`;

  try {
    await page.goto('https://www.threads.net/', { waitUntil: 'networkidle', timeout: 30000 });

    // Cek apakah ada prompt login atau tombol masuk
    const isLoginNeeded = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return (
        text.includes('Log in') ||
        text.includes('Masuk') ||
        Boolean(document.querySelector('input[name="username"]'))
      );
    });

    if (isLoginNeeded) {
      await page.screenshot({ path: screenshotPath });
      return {
        success: false,
        screenshotPath,
        error: 'SESSION_DEAD: Akun Threads belum login atau sesi expired. Silakan jalankan `npm run login threads <tenantId>`.',
      };
    }

    // Cek tombol composer "Start a thread..." atau tombol tambah '+'
    const composeBtn = page.locator('text="Start a thread"').first();
    const plusBtn = page.locator('svg[aria-label="Create"], svg[aria-label="Buat"]').first();

    if (await composeBtn.isVisible({ timeout: 5000 })) {
      await composeBtn.click();
    } else if (await plusBtn.isVisible({ timeout: 5000 })) {
      await plusBtn.click();
    }

    // Type caption ke editor Threads
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 8000 });
    await editor.click();
    await editor.fill(job.caption);

    // Human-like delay
    await page.waitForTimeout(1000 + Math.random() * 1500);

    // Klik tombol Kirim / Post
    const postBtn = page.locator('button:has-text("Post"), button:has-text("Kirim")').last();
    await postBtn.click();

    // Tunggu postingan terkirim
    await page.waitForTimeout(3000);
    await page.screenshot({ path: screenshotPath });

    const postUrl = page.url();
    return {
      success: true,
      postUrl: postUrl.includes('threads.net') ? postUrl : `https://www.threads.net/@${job.tenantId}`,
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
