"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  List,
  PlusCircle,
  RefreshCw,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  ExternalLink,
  X,
  ShieldCheck,
  AlertTriangle,
  Play,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Account {
  id: string;
  platform: string;
  username: string;
  status: string;
  lastCheck: string;
  _count?: { posts: number };
}

interface Post {
  id: string;
  campaign: string;
  caption: string;
  scheduledAt: string;
  status: string;
  evidencePath?: string | null;
  responseMessage?: string | null;
  account?: Account | null;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "accounts">("queue");
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEvidence, setSelectedEvidence] = useState<Post | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, accountsRes] = await Promise.all([
        fetch("/api/posts"),
        fetch("/api/accounts"),
      ]);
      const postsData = await postsRes.json();
      const accountsData = await accountsRes.json();

      setPosts(postsData.data || []);
      setAccounts(accountsData.data || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const scheduledPosts = posts.filter((p) => p.status === "scheduled");
  const postedPosts = posts.filter((p) => p.status === "posted");
  const failedPosts = posts.filter((p) => p.status === "failed");
  const connectedAccounts = accounts.filter((a) => a.status === "connected");

  const filteredPosts = posts.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      {/* Top Navbar */}
      <nav className="border-b bg-background sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                  AS
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight block leading-tight">AutoSosmed</span>
                  <span className="text-[10px] text-muted-foreground block -mt-0.5">Internal Team Tool v1</span>
                </div>
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
                  Antrean Postingan ({posts.length})
                </button>
                <button
                  onClick={() => setActiveTab("accounts")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "accounts"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Akun Terhubung ({accounts.length})
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
              <Link href="/connect">
                <Button variant="outline" className="rounded-full text-xs">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  + Akun
                </Button>
              </Link>
              <Link href="/compose">
                <Button className="rounded-full shadow-sm text-xs">
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Jadwalkan Post
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Antrean Scheduled
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-primary">
                {scheduledPosts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Menunggu eksekusi cron 2-menit
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Posted
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {postedPosts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sukses dipublikasikan via Playwright
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Akun Terkoneksi
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {connectedAccounts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                dari total {accounts.length} akun terdaftar
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gagal / Warning
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {failedPosts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {failedPosts.length === 0 ? "Semua berjalan normal" : "Perlu pengecekan"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab 1: Queue Table */}
        {activeTab === "queue" && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-xl">Antrean Postingan Terjadwal</CardTitle>
                <CardDescription>
                  Daftar konten yang dijadwalkan untuk diposting otomatis via Playwright
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg text-xs font-medium">
                {["all", "scheduled", "processing", "posted", "failed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md capitalize transition-colors ${
                      statusFilter === st
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st} {st !== "all" && `(${posts.filter((p) => p.status === st).length})`}
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
                        <th className="px-4 py-3 text-left font-semibold">Waktu Jadwal</th>
                        <th className="px-4 py-3 text-left font-semibold">Akun Platform</th>
                        <th className="px-4 py-3 text-left font-semibold">Campaign</th>
                        <th className="px-4 py-3 text-left font-semibold">Caption</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredPosts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                            Belum ada postingan dengan status ini.{" "}
                            <Link href="/compose" className="text-primary font-semibold hover:underline">
                              Buat postingan baru →
                            </Link>
                          </td>
                        </tr>
                      ) : (
                        filteredPosts.map((post) => (
                          <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">
                              {new Date(post.scheduledAt).toLocaleString("id-ID", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {post.account ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs uppercase font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                                    {post.account.platform}
                                  </span>
                                  <span className="font-semibold text-xs">@{post.account.username}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs italic">Tanpa akun</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground text-xs whitespace-nowrap">
                              {post.campaign}
                            </td>
                            <td className="px-4 py-3 max-w-sm truncate text-muted-foreground text-xs">
                              {post.caption}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  post.status === "posted"
                                    ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                    : post.status === "processing"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    : post.status === "failed"
                                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                    : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                }`}
                              >
                                {post.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              {post.status === "posted" ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedEvidence(post)}
                                  className="h-7 text-xs rounded-md px-2.5 text-primary hover:bg-primary/10"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Bukti Post
                                </Button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  Cron auto
                                </span>
                              )}
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
        )}

        {/* Tab 2: Accounts List */}
        {activeTab === "accounts" && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
              <div>
                <CardTitle className="text-xl">Daftar Akun Terhubung</CardTitle>
                <CardDescription>
                  Status sesi Playwright untuk seluruh akun media sosial internal tim
                </CardDescription>
              </div>
              <Link href="/connect">
                <Button size="sm" className="rounded-full shadow-xs">
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Hubungkan Akun Baru
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Platform</th>
                      <th className="px-4 py-3 text-left">Username</th>
                      <th className="px-4 py-3 text-left">Status Sesi</th>
                      <th className="px-4 py-3 text-left">Pengecekan Terakhir</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {accounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">
                          Belum ada akun terhubung. Hubungkan akun Instagram, Threads, atau TikTok tim Anda.
                        </td>
                      </tr>
                    ) : (
                      accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {acc.platform}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground text-xs">
                            @{acc.username}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                acc.status === "connected"
                                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              }`}
                            >
                              {acc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(acc.lastCheck).toLocaleString("id-ID", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <Link href={`/connect?platform=${acc.platform}&username=${acc.username}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs rounded-md px-2.5"
                              >
                                Re-login
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Evidence Popup */}
        {selectedEvidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <h3 className="font-bold text-lg text-foreground">Bukti Eksekusi Playwright</h3>
                  <p className="text-xs text-muted-foreground">
                    Post ID: {selectedEvidence.id} • Campaign: {selectedEvidence.campaign}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border bg-muted/30 p-2 overflow-hidden flex items-center justify-center">
                  <img
                    src={`/api/evidence/${selectedEvidence.id}`}
                    alt="Screenshot Evidence"
                    className="rounded-lg shadow-xs max-h-80 w-auto object-contain bg-background"
                  />
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1">
                  <span className="font-semibold block text-foreground">Hasil Eksekusi:</span>
                  <p className="text-muted-foreground">{selectedEvidence.responseMessage || "Sukses diposting"}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setSelectedEvidence(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
