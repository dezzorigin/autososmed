"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  Calendar,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Account {
  id: string;
  platform: string;
  username: string;
  status: string;
}

export default function ComposePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [campaign, setCampaign] = useState("");
  const [caption, setCaption] = useState("");
  const [previewCaption, setPreviewCaption] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Set default schedule to 5 minutes from now
    const now = new Date(Date.now() + 5 * 60 * 1000);
    const localIso = now.toISOString().slice(0, 16);
    setScheduledAt(localIso);

    // Fetch accounts
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        const accs = data.data || [];
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id);
        }
      })
      .catch((err) => console.error("Failed to load accounts:", err));
  }, []);

  // Simple client-side spintax resolver for preview
  const spinText = (text: string) => {
    return text.replace(/\{([^{}]+)\}/g, (match, choices) => {
      const parts = choices.split("|");
      return parts[Math.floor(Math.random() * parts.length)];
    });
  };

  const handlePreviewSpin = () => {
    if (!caption) return;
    setPreviewCaption(spinText(caption));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data?.data?.id) {
        setMediaId(data.data.id);
        setMessage(`Media "${selectedFile.name}" berhasil diunggah.`);
      } else {
        setMessage(`Gagal unggah media: ${data.detail || "Error"}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessage(`Gagal unggah: ${errMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccountId || null,
          media_id: mediaId,
          campaign: campaign || "Default Campaign",
          caption,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Postingan berhasil dijadwalkan!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      } else {
        setMessage(`Gagal menjadwalkan: ${data.detail || "Terjadi kesalahan"}`);
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessage(`Error: ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 text-foreground py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
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
                Internal Post Composer
              </span>
            </div>
            <CardTitle className="text-xl">Jadwalkan Postingan Baru</CardTitle>
            <CardDescription>
              Upload media ke disk lokal, buat variasi caption spintax, dan tentukan waktu eksekusi antrean.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div
                className={`mb-6 p-3 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                  message.includes("Gagal") || message.includes("Error")
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Pilih Akun Tujuan</label>
                {accounts.length === 0 ? (
                  <div className="text-xs p-3 rounded-lg border border-dashed text-muted-foreground flex items-center justify-between">
                    <span>Belum ada akun terhubung.</span>
                    <Link href="/connect" className="text-primary font-semibold hover:underline">
                      + Hubungkan Akun
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        [{acc.platform.toUpperCase()}] @{acc.username} ({acc.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Campaign Tag */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Nama Campaign</label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Contoh: Launch Promo Q4"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Media / Foto</label>
                <div className="rounded-lg border border-dashed border-border p-4 text-center hover:bg-muted/30 transition-colors">
                  <input
                    type="file"
                    id="media-upload"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="media-upload" className="cursor-pointer block space-y-1">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <span className="text-xs font-semibold text-primary block">
                      {uploading ? "Mengunggah..." : file ? file.name : "Klik untuk upload media"}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Disimpan otomatis di folder server `./data/uploads`
                    </span>
                  </label>
                </div>
              </div>

              {/* Caption with Spintax */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold">
                    Caption Spintax <span className="text-muted-foreground font-normal">({"{"}opsi1|opsi2{"}"})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCaption(
                        "{Halo|Hai|Hi} teman-teman! {Promo spesial|Diskon menarik|Kabar gembira} buat kalian hari ini. Dapatkan segera! #Promo #Terbaru"
                      )
                    }
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="h-3 w-3" />
                    Contoh
                  </button>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tulis caption Anda di sini dengan format spintax..."
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background p-3 text-sm font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Spintax Live Preview */}
              {caption && (
                <div className="p-3 rounded-lg bg-muted/40 border border-border/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Preview Variasi Caption:
                    </span>
                    <button
                      type="button"
                      onClick={handlePreviewSpin}
                      className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Acak Ulang
                    </button>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap font-sans bg-background p-2 rounded border">
                    {previewCaption || spinText(caption)}
                  </p>
                </div>
              )}

              {/* Scheduled DateTime */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Waktu Jadwal Eksekusi</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !caption.trim()}
                className="w-full rounded-full py-2.5 font-semibold text-sm shadow-xs"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Menyimpan Jadwal Post...
                  </>
                ) : (
                  "Simpan & Jadwalkan Post"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
