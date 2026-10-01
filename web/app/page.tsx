import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold">AutoSosmed</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
              <Link 
                href="/dashboard" 
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Empower Your Business With{" "}
              <span className="text-primary">Smarter Posting</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Platform otomasi modern yang membantu tim mengelola posting sosial media, 
              mengatur jadwal konten, dan membuat keputusan lebih baik — semua dalam satu dashboard intuitif.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-8 py-3 text-base font-semibold hover:bg-muted transition-colors"
              >
                View Demo
              </Link>
            </div>
            <div className="mt-12 text-sm text-muted-foreground">
              Trusted by creators, teams and developers worldwide
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Scale
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features to automate your social media workflow
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Multi-Platform Posting",
                description: "Post ke Instagram, Threads, dan TikTok dari satu tempat dengan caption bervariasi otomatis.",
              },
              {
                title: "Smart Scheduling",
                description: "Jadwal otomatis 07:00–22:00 dengan jeda optimal per akun + jitter untuk keamanan.",
              },
              {
                title: "Campaign Management",
                description: "Satu campaign → banyak akun, caption spintax, media per tenant, dedupe otomatis.",
              },
              {
                title: "Session Monitoring",
                description: "Tracking status login per akun, deteksi sesi mati, re-login hanya saat perlu.",
              },
              {
                title: "Evidence & Proof",
                description: "Screenshot + URL setiap posting, notifikasi Discord, audit trail lengkap.",
              },
              {
                title: "Tenant Flexibility",
                description: "Tambah tenant/produk tanpa ubah kode, slot harian per tenant, aktif/nonaktif toggle.",
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/50 py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple and Flexible Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your needs
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "For individuals starting out",
                features: [
                  "3 tenants",
                  "Basic scheduling",
                  "Manual posting",
                  "Email support",
                ],
              },
              {
                name: "Pro",
                price: "$19",
                description: "For growing teams",
                popular: true,
                features: [
                  "Unlimited tenants",
                  "Smart scheduling + jitter",
                  "Auto posting via browser",
                  "Campaign management",
                  "Evidence tracking",
                  "Discord notifications",
                  "Priority support",
                ],
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations",
                features: [
                  "Everything in Pro",
                  "AI caption generator",
                  "AI image generator",
                  "Custom integrations",
                  "Dedicated support",
                  "SLA guarantee",
                ],
              },
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`rounded-xl border bg-card p-8 shadow-sm hover:shadow-md transition-shadow ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="mb-4 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/dashboard" 
                  className={`mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition-colors ${
                    plan.popular 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "border border-border bg-background hover:bg-muted"
                  }`}
                >
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start Building Your Social Presence Faster
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Platform fleksibel yang dirancang untuk membantu tim mengelola konten, jadwal, dan operasi melalui dashboard yang bersih dan scalable.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started Now
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-8 py-3 text-base font-semibold hover:bg-muted transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary" />
                <span className="text-lg font-bold">AutoSosmed</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Platform fleksibel untuk automasi posting sosial media.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            © 2026 AutoSosmed. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
