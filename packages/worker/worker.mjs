import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { runJob } from './runner.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
dotenv.config({ path: path.resolve(rootDir, '.env') });

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const isOnce = args.includes('--once');
const isDryRun = args.includes('--dry-run') || process.env.DRY_RUN !== 'false';
const pollIntervalMs = 5000; // 5 detik untuk responsive queue polling

console.log(`=======================================================`);
console.log(`🤖 AutoSosmed Background Worker Daemon Started`);
console.log(`Mode        : ${isDryRun ? 'DRY-RUN (Simulasi Evidence)' : 'LIVE (Browser Execution)'}`);
console.log(`Execution   : ${isOnce ? 'ONE-SHOT' : `DAEMON (Interval: ${pollIntervalMs}ms)`}`);
console.log(`=======================================================`);

let isProcessing = false;

async function pollQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    // Ambil jobs queued
    const queuedJobs = await prisma.job.findMany({
      where: { status: 'queued' },
      orderBy: [{ waktu: 'asc' }, { createdAt: 'asc' }],
      take: 3,
    });

    if (queuedJobs.length === 0) {
      if (isOnce) {
        console.log('[worker] Tidak ada job queued. Selesai.');
        process.exit(0);
      }
      return;
    }

    console.log(`[worker] Menemukan ${queuedJobs.length} job(s) dalam antrean.`);

    for (const job of queuedJobs) {
      try {
        console.log(`[worker] Menjalankan job: ${job.id} (${job.platform} - ${job.tenantId})`);
        await runJob(job.id, { dryRun: isDryRun });
        
        // Jeda aman antar job
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(`[worker] Error mengeksekusi job ${job.id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[worker] Error polling queue:', err.message);
  } finally {
    isProcessing = false;
  }
}

async function start() {
  await pollQueue();

  if (isOnce) {
    process.exit(0);
  }

  const interval = setInterval(async () => {
    await pollQueue();
  }, pollIntervalMs);

  process.on('SIGINT', () => {
    console.log('\n[worker] Menerima SIGINT, mematikan worker...');
    clearInterval(interval);
    prisma.$disconnect().then(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    console.log('\n[worker] Menerima SIGTERM, mematikan worker...');
    clearInterval(interval);
    prisma.$disconnect().then(() => process.exit(0));
  });
}

start();
