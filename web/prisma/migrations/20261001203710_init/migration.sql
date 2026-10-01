-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "ig" TEXT,
    "threads" TEXT,
    "tiktok" TEXT,
    "slot_harian" INTEGER NOT NULL DEFAULT 3,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "brief" TEXT NOT NULL DEFAULT '',
    "caption_template" TEXT NOT NULL,
    "media" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_tenant_ids" TEXT[],
    "platforms" TEXT[] DEFAULT ARRAY['ig', 'threads', 'tiktok']::TEXT[],
    "window_start" TEXT NOT NULL DEFAULT '07:00',
    "window_end" TEXT NOT NULL DEFAULT '22:00',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "waktu" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "media" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'live',
    "last_check" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "job_id" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screenshot_path" TEXT NOT NULL DEFAULT '',
    "post_url" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("job_id")
);

-- CreateIndex
CREATE INDEX "jobs_status_platform_waktu_idx" ON "jobs"("status", "platform", "waktu");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
