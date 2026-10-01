import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const sessionsDir = path.resolve(rootDir, 'sessions');

const prisma = new PrismaClient();

const platformUrls = {
  ig: 'https://www.instagram.com/accounts/login/',
  threads: 'https://www.threads.net/login',
  tiktok: 'https://www.tiktok.com/login',
};

async function main() {
  const platform = process.argv[2]?.toLowerCase();
  const tenantId = process.argv[3];

  if (!platform || !tenantId || !platformUrls[platform]) {
    console.error('Penggunaan: node login.mjs <platform> <tenantId>');
    console.error('Pilihan platform: ig, threads, tiktok');
    console.error('Contoh: node login.mjs threads kopi-a');
    process.exit(1);
  }

  const sessionKey = `${platform}-${tenantId}`;
  const sessionPath = path.resolve(sessionsDir, sessionKey);

  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }

  console.log(`=======================================================`);
  console.log(`🔐 AutoSosmed 1-Time Session Login Helper`);
  console.log(`Platform : ${platform.toUpperCase()}`);
  console.log(`Tenant   : ${tenantId}`);
  console.log(`Folder   : ${sessionPath}`);
  console.log(`=======================================================`);
  console.log(`Membuka browser Playwright... Silakan selesaikan login.`);

  let context;
  try {
    context = await chromium.launchPersistentContext(sessionPath, {
      headless: false,
      viewport: { width: 1280, height: 800 },
    });

    const page = context.pages()[0] || (await context.newPage());
    await page.goto(platformUrls[platform]);

    console.log(`\n👉 Lakukan login manual pada jendela browser.`);
    console.log(`👉 Jika sudah berhasil masuk ke feed/dashboard, kembali ke terminal ini.`);
    console.log(`👉 Tekan [ENTER] di sini setelah selesai login untuk menyimpan sesi...\n`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await new Promise((resolve) => rl.question('', resolve));
    rl.close();

    // Simpan ke database
    await prisma.session.upsert({
      where: { id: sessionKey },
      create: {
        id: sessionKey,
        platform,
        tenantId,
        status: 'live',
        lastCheck: new Date(),
      },
      update: {
        status: 'live',
        lastCheck: new Date(),
      },
    });

    console.log(`✅ Sesi ${sessionKey} berhasil diverifikasi dan disimpan ke DB & disk!`);
  } catch (err) {
    console.error(`❌ Gagal login:`, err.message);
  } finally {
    if (context) await context.close();
    await prisma.$disconnect();
  }
}

main();
