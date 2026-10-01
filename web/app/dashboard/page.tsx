"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, List, PlusCircle, Settings, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  slotHarian: number;
  aktif: boolean;
}

interface Campaign {
  id: string;
  nama: string;
  status: string;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, tenantsRes, campaignsRes] = await Promise.all([
        fetch("/api/queue?status=all"),
        fetch("/api/tenants"),
        fetch("/api/campaigns"),
      ]);
      const jobsData = await jobsRes.json();
      const tenantsData = await tenantsRes.json();
      const campaignsData = await campaignsRes.json();
      
      setJobs(jobsData.data || []);
      setTenants(tenantsData.data || []);
      setCampaigns(campaignsData.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const queuedJobs = jobs.filter(j => j.status === "queued");
  const activeTenants = tenants.filter(t => t.aktif).length;
  const runningCampaigns = campaigns.filter(c => c.status === "queued" || c.status === "running").length;
  const doneJobs = jobs.filter(j => j.status === "done").length;
  const successRate = jobs.length > 0 ? Math.round((doneJobs / jobs.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <span className="text-xl font-bold">AutoSosmed</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <List className="h-4 w-4" />
                  Queue
                </a>
                <a href="#campaigns" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Calendar className="h-4 w-4" />
                  Campaigns
                </a>
                <a href="#settings" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchData}
                className="rounded-full border border-border bg-background p-2 hover:bg-muted transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <a 
                href="#composer"
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <PlusCircle className="inline h-4 w-4 mr-2" />
                New Campaign
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Queued Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{queuedJobs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {jobs.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeTenants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {tenants.length} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{runningCampaigns}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Running today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobs.length > 0 ? `${successRate}%` : "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {doneJobs} of {jobs.length} done
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Queue Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today&apos;s Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Time</th>
                      <th className="px-4 py-3 text-left font-medium">Tenant</th>
                      <th className="px-4 py-3 text-left font-medium">Platform</th>
                      <th className="px-4 py-3 text-left font-medium">Caption</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No jobs scheduled yet. Create your first campaign to get started.
                        </td>
                      </tr>
                    ) : (
                      jobs.slice(0, 20).map((job) => (
                        <tr key={job.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs">{job.waktu}</td>
                          <td className="px-4 py-3">{job.tenantId}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {job.platform}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-md truncate">{job.caption}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              job.status === "done" ? "bg-green-100 text-green-800" :
                              job.status === "failed" ? "bg-red-100 text-red-800" :
                              job.status === "running" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
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

        {/* Composer Section */}
        <div id="composer">
          <CampaignComposer onSuccess={fetchData} tenants={tenants} />
        </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !captionTemplate || selectedTenants.length === 0) return;

    setSubmitting(true);
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
      if (res.ok) {
        setNama("");
        setCaptionTemplate("");
        setSelectedTenants([]);
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to create campaign:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Launch fitur X"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Caption Template <span className="text-muted-foreground">(spintax: {"{opt1|opt2}"})</span>
            </label>
            <textarea
              value={captionTemplate}
              onChange={(e) => setCaptionTemplate(e.target.value)}
              placeholder="{Coba|Kenalin} {produk} — {diskon|gratis}! #{produkTag}"
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Target Tenants</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {tenants.map((t) => (
                <label key={t.id} className="flex items-center gap-2 cursor-pointer">
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
                    className="rounded border-border"
                  />
                  <span className="text-sm">{t.nama}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Platforms</label>
            <div className="flex gap-4">
              {["ig", "threads", "tiktok"].map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
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
                    className="rounded border-border"
                  />
                  <span className="text-sm uppercase">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !nama || !captionTemplate || selectedTenants.length === 0}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
