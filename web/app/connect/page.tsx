"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Lock, ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConnectPage() {
  const router = useRouter();
  const [platform, setPlatform] = useState<string>("threads");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/accounts/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Akun ${platform.toUpperCase()} @${username} berhasil terhubung!`);
        setPassword("");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(data.detail || "Gagal menghubungkan akun. Periksa username dan password.");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 text-foreground py-12 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                AS
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Internal Team Tool
              </span>
            </div>
            <CardTitle className="text-xl">Hubungkan Akun Sosial Media</CardTitle>
            <CardDescription>
              Login headless via browser Playwright. Password tidak pernah disimpan ke database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 text-xs font-medium border border-green-200 dark:border-green-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Pilih Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "threads", label: "Threads" },
                    { id: "ig", label: "Instagram" },
                    { id: "tiktok", label: "TikTok" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                        platform === p.id
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5">Username / Akun</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: test_team_ig"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 flex items-center justify-between">
                  <span>Password Akun</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-normal">
                    <Lock className="h-3 w-3" />
                    Dipakai 1x untuk sesi
                  </span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Jaminan Keamanan Password:
                </div>
                <p>
                  Password dipakai langsung di proses Chromium untuk otentikasi sesi dan langsung dihapus dari memori. Yang disimpan di database hanyalah token cookie sesi (`sessionJson`).
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full rounded-full py-2.5 text-sm font-semibold shadow-xs"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Menghubungkan via Playwright...
                  </>
                ) : (
                  "Hubungkan Akun Sekarang"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
