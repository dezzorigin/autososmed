"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  List,
  PlusCircle,
  Settings,
  RefreshCw,
  Users,
  Network,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntegrationGraph } from "@/components/ui/integration-card";

interface Job {
  id: string;
  tenantId: string;
  platform: string;
  waktu: string;
  caption: string;
  status: string;
}

interface Tenant {
  id: string;
  nama: string;
  ig?: string | null;
  threads?: string | null;
  tiktok?: string | null;
  slotHarian: number;
  aktif: boolean;
}

interface Campaign {
  id: string;
  nama: string;
  status: string;
  _count?: { jobs: number };
}

interface Session {
  id: string;
  platform: string;
  tenantId: string;
  live: boolean;
  lastCheck?: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "composer" | "tenants" | "pipeline">("queue");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, tenantsRes, campaignsRes, sessionsRes] = await Promise.all([
        fetch("/api/queue?status=all"),
        fetch("/api/tenants"),
        fetch("/api/campaigns"),
        fetch("/api/sessions"),
      ]);
      const jobsData = await jobsRes.json();
      const tenantsData = await tenantsRes.json();
      const campaignsData = await campaignsRes.json();
      const sessionsData = await sessionsRes.json();

      setJobs(jobsData.data || []);
      setTenants(tenantsData.data || []);
      setCampaigns(campaignsData.data || []);
      setSessions(sessionsData.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const queuedJobs = jobs.filter((j) => j.status === "queued");
  const runningJobs = jobs.filter((j) => j.status === "running");
  const doneJobs = jobs.filter((j) => j.status === "done");
  const failedJobs = jobs.filter((j) => j.status === "failed");
  const activeTenants = tenants.filter((t) => t.aktif).length;
  const successRate = jobs.length > 0 ? Math.round((doneJobs.length / jobs.length) * 100) : 0;

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === "all") return true;
    return j.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      {/* Top Navigation */}
      <nav className="border-b bg-background sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                  AS
                </div>
                <span className="text-xl font-bold tracking-tight">AutoSosmed</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("queue")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "queue"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-4 w-4" />
                  Antrean Jobs ({jobs.length})
                </button>
                <button
                  onClick={() => setActiveTab("composer")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "composer"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Campaign Composer
                </button>
                <button
                  onClick={() => setActiveTab("tenants")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "tenants"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Tenants ({tenants.length})
                </button>
                <button
                  onClick={() => setActiveTab("pipeline")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "pipeline"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Network className="h-4 w-4" />
                  Pipeline Graph
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchData}
                className="rounded-full"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
              </Button>
              <Button
                onClick={() => setActiveTab("composer")}
                className="rounded-full shadow-sm"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Antrean Queued
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-primary">{queuedJobs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {runningJobs.length > 0 ? `${runningJobs.length} sedang running • ` : ""}
                Total {jobs.length} jobs hari ini
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lini Bisnis / Tenant
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{activeTenants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeTenants} aktif dari total {tenants.length} tenant
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Campaigns
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total campaign terdaftar
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Success Rate
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {jobs.length > 0 ? `${successRate}%` : "100%"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {doneJobs.length} berhasil • {failedJobs.length} gagal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab 1: Queue Table */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-xl">Antrean Jadwal Posting</CardTitle>
                  <CardDescription>
                    Jobs hasil fan-out campaign dengan delay anti-ban + jitter per platform
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg text-xs font-medium">
                  {["all", "queued", "running", "done", "failed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-md capitalize transition-colors ${
                        statusFilter === st
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st} {st !== "all" && `(${jobs.filter((j) => j.status === st).length})`}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Waktu Stagger</th>
                          <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                          <th className="px-4 py-3 text-left font-semibold">Platform</th>
                          <th className="px-4 py-3 text-left font-semibold">Varian Caption</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredJobs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                              Belum ada jobs dengan status ini. Buat campaign baru untuk fan-out antrean.
                            </td>
                          </tr>
                        ) : (
                          filteredJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3 font-mono text-xs font-medium text-foreground whitespace-nowrap">
                                {job.waktu}
                              </td>
                              <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                                {job.tenantId}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                                    job.platform === "ig"
                                      ? "bg-pink-500/10 text-pink-600 dark:text-pink-400"
                                      : job.platform === "tiktok"
                                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                                      : "bg-purple-500/10 text-primary"
                                  }`}
                                >
                                  {job.platform.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 max-w-md truncate text-muted-foreground text-xs">
                                {job.caption}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    job.status === "done"
                                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                      : job.status === "running"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                      : job.status === "failed"
                                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                      : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                  }`}
                                >
                                  {job.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Campaign Composer */}
        {activeTab === "composer" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CampaignComposer
                onSuccess={() => {
                  fetchData();
                  setActiveTab("queue");
                }}
                tenants={tenants}
              />
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tips Spintax & Fan-Out</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Format Spintax: <code className="text-primary font-mono font-semibold">{"{A|B|C}"}</code> akan dipilih acak dan deterministik per tenant & slot sehingga tiap akun memposting kalimat berbeda.
                  </p>
                  <p>
                    Contoh placeholder:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    <li><code className="text-foreground">{"{Coba|Nikmati|Kenalin}"}</code></li>
                    <li><code className="text-foreground">{"{diskon 50%|promo hemat|gratis ongkir}"}</code></li>
                    <li><code className="text-foreground">{"#BisnisKeren #PromoToday"}</code></li>
                  </ul>
                  <div className="pt-3 border-t">
                    <span className="text-xs font-semibold text-foreground block mb-1">
                      Anti-Ban Stagger:
                    </span>
                    <p className="text-xs">
                      Sistem otomatis menerapkan jeda 90m (IG), 45m (Threads), 120m (TikTok) + jitter ±25m di rentang jam 07:00–22:00.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Tenants Management */}
        {activeTab === "tenants" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Daftar Lini Bisnis & Akun</CardTitle>
                  <CardDescription>
                    Kelola profil produk dan akun sosial media yang terhubung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left">ID</th>
                          <th className="px-4 py-3 text-left">Nama Lini Bisnis</th>
                          <th className="px-4 py-3 text-left">Slot Harian</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {tenants.map((t) => (
                          <tr key={t.id} className="hover:bg-muted/20">
                            <td className="px-4 py-3 font-mono text-xs font-semibold">{t.id}</td>
                            <td className="px-4 py-3 font-medium text-foreground">{t.nama}</td>
                            <td className="px-4 py-3 text-muted-foreground">{t.slotHarian} slot/hari</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  t.aktif
                                    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400"
                                }`}
                              >
                                {t.aktif ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <AddTenantForm onSuccess={fetchData} />
            </div>
          </div>
        )}

        {/* Tab 4: Pipeline Graph */}
        {activeTab === "pipeline" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl">Network Pipeline Arsitektur</CardTitle>
                  <CardDescription>
                    Visualisasi relasi real-time antara Core Scheduler, AI Engine, dan Akun Media Sosial
                  </CardDescription>
                </CardHeader>
                <div className="p-4 sm:p-6 bg-muted/10">
                  <div className="h-[410px] w-full max-w-xl mx-auto rounded-xl border bg-background overflow-hidden relative shadow-sm">
                    <IntegrationGraph />
                  </div>
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Koneksi Sesi Browser</CardTitle>
                  <CardDescription>Status persistent context Playwright</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessions.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                      Belum ada sesi browser aktif. Sesi dibuat otomatis saat worker mengeksekusi job pertama.
                    </div>
                  ) : (
                    sessions.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs"
                      >
                        <div>
                          <span className="font-semibold block text-foreground">{s.id}</span>
                          <span className="text-muted-foreground uppercase">{s.platform}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ${
                            s.live ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {s.live ? "Live" : "Dead"}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function CampaignComposer({ onSuccess, tenants }: { onSuccess: () => void; tenants: Tenant[] }) {
  const [nama, setNama] = useState("");
  const [captionTemplate, setCaptionTemplate] = useState("");
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>(["ig", "threads"]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !captionTemplate || selectedTenants.length === 0) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          caption_template: captionTemplate,
          target_tenants: selectedTenants,
          platforms,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Campaign "${nama}" berhasil dibuat dengan ${data.jobs} antrean jobs!`);
        setNama("");
        setCaptionTemplate("");
        setSelectedTenants([]);
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setMessage(`Error: ${data.detail || "Gagal membuat campaign"}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Composer Campaign Baru</CardTitle>
        <CardDescription>
          Fan-out otomatis ke multi-tenant dan multi-platform dengan variasi caption unik
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.startsWith("Error")
                ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
                : "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Nama Campaign</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Launch Promo Akhir Pekan"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold">
                Template Caption (Spintax)
              </label>
              <button
                type="button"
                onClick={() =>
                  setCaptionTemplate(
                    "{Coba|Kenalin} produk baru kami — {diskon 20%|promo spesial}! Dapatkan segera di link bio #Promo #Viral"
                  )
                }
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Gunakan Contoh
              </button>
            </div>
            <textarea
              value={captionTemplate}
              onChange={(e) => setCaptionTemplate(e.target.value)}
              placeholder="{Coba|Kenalin} {produk} — {diskon|gratis ongkir}! #{produkTag}"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Pilih Target Lini Bisnis ({selectedTenants.length} terpilih)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {tenants.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTenants.includes(t.id)
                      ? "border-primary bg-primary/5 text-foreground font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTenants.includes(t.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTenants([...selectedTenants, t.id]);
                      } else {
                        setSelectedTenants(selectedTenants.filter((id) => id !== t.id));
                      }
                    }}
                    className="rounded border-border accent-primary"
                  />
                  <span className="text-sm truncate">{t.nama}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Target Platform</label>
            <div className="flex flex-wrap gap-4">
              {["ig", "threads", "tiktok"].map((p) => (
                <label
                  key={p}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    platforms.includes(p)
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={platforms.includes(p)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPlatforms([...platforms, p]);
                      } else {
                        setPlatforms(platforms.filter((pl) => pl !== p));
                      }
                    }}
                    className="rounded border-border accent-primary"
                  />
                  <span className="text-sm uppercase tracking-wider">{p}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !nama || !captionTemplate || selectedTenants.length === 0}
            className="w-full rounded-full py-3 font-semibold shadow-sm"
          >
            {submitting ? "Memproses Fan-out Antrean..." : "Generate & Jadwalkan Posting"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddTenantForm({ onSuccess }: { onSuccess: () => void }) {
  const [id, setId] = useState("");
  const [nama, setNama] = useState("");
  const [ig, setIg] = useState("");
  const [threads, setThreads] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !nama) return;

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id.toLowerCase().replace(/\s+/g, "-"),
          nama,
          ig: ig || null,
          threads: threads || null,
          tiktok: tiktok || null,
          slot_harian: 3,
        }),
      });
      if (res.ok) {
        setStatus("Tenant berhasil ditambahkan!");
        setId("");
        setNama("");
        setIg("");
        setThreads("");
        setTiktok("");
        onSuccess();
      } else {
        const err = await res.json();
        setStatus(`Error: ${err.detail || "Gagal menambah tenant"}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatus(`Error: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tambah Tenant Baru</CardTitle>
        <CardDescription>Daftarkan brand/produk baru ke sistem</CardDescription>
      </CardHeader>
      <CardContent>
        {status && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs font-medium ${
              status.startsWith("Error")
                ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300"
                : "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300"
            }`}
          >
            {status}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
              Slug ID (unik)
            </label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="kopi-c"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
              Nama Brand / Produk
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Kopi Kenangan Senja"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
              Username Instagram
            </label>
            <input
              type="text"
              value={ig}
              onChange={(e) => setIg(e.target.value)}
              placeholder="@kopisenja"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
              Username Threads
            </label>
            <input
              type="text"
              value={threads}
              onChange={(e) => setThreads(e.target.value)}
              placeholder="@kopisenja"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground">
              Username TikTok
            </label>
            <input
              type="text"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="@kopisenja.official"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || !id || !nama}
            className="w-full rounded-full text-xs font-semibold"
          >
            {submitting ? "Menyimpan..." : "Tambah Tenant"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
