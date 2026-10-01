"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VisualContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface TeamCardProps {
  visual: React.ReactNode;
  title: string;
  description: string;
  url?: string;
  buttonText?: string;
}

interface IntegrationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  x: number;
  y: number;
  path: string;
  delay: number;
}

const InstagramLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TikTokLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const ThreadsLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8c3.21 0 5.96 1.895 7.21 4.62" />
    <path d="M11 8.5c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5-3.5-1.5-3.5-3.5" />
    <path d="M14.5 12c0 2.5 1.5 3.5 3 3.5" />
  </svg>
);

const AiLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
  </svg>
);

const SchedulerLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const WebhookLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// Center is (282, 205)
const integrations: IntegrationItem[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: InstagramLogo,
    x: 110,
    y: 90,
    path: "M 270 205 V 105 Q 270 90 255 90 H 110",
    delay: 0.1,
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: TikTokLogo,
    x: 360,
    y: 70,
    path: "M 294 205 V 85 Q 294 70 309 70 H 360",
    delay: 0.2,
  },
  {
    id: "threads",
    name: "Threads",
    icon: ThreadsLogo,
    x: 160,
    y: 205,
    path: "M 250 205 H 160",
    delay: 0.3,
  },
  {
    id: "ai",
    name: "AI Engine",
    icon: AiLogo,
    x: 480,
    y: 205,
    path: "M 314 205 H 480",
    delay: 0.4,
  },
  {
    id: "scheduler",
    name: "Smart Scheduler",
    icon: SchedulerLogo,
    x: 282,
    y: 350,
    path: "M 282 205 V 350",
    delay: 0.6,
  },
  {
    id: "webhook",
    name: "Evidence / Discord",
    icon: WebhookLogo,
    x: 460,
    y: 330,
    path: "M 314 215 V 315 Q 314 330 329 330 H 460",
    delay: 0.7,
  },
];

const AnimatedPath = ({ d, id }: { d: string; id: string }) => {
  return (
    <>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="text-border opacity-60"
      />
      <motion.path
        d={d}
        stroke={`url(#${id})`}
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="40 160"
        initial={{ strokeDashoffset: 200 }}
        animate={{ strokeDashoffset: -200 }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 1.5,
        }}
      />
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop
            offset="50%"
            stopColor="hsl(var(--primary))"
            stopOpacity="0.8"
          />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </>
  );
};

export function IntegrationGraph() {
  const containerId = useId();

  return (
    <div className="relative h-full w-full">
      {/* SVG Lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 564 410"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {integrations.map((integration) => (
          <AnimatedPath
            key={integration.id}
            d={integration.path}
            id={`${containerId}-${integration.id}`}
          />
        ))}
      </svg>

      {/* Center Logo */}
      <div className="absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-primary/20 bg-background p-2 shadow-lg sm:rounded-2xl sm:p-3 sm:shadow-2xl">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl tracking-wider shadow-inner">
          AS
        </div>
        <motion.div
          className="absolute -inset-1 rounded-2xl border-2 border-primary/30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Peripheral Icons */}
      {integrations.map((integration) => {
        const Icon = integration.icon;
        return (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: integration.delay, duration: 0.4 }}
            style={{
              left: `${(integration.x / 564) * 100}%`,
              top: `${(integration.y / 410) * 100}%`,
            }}
            className="group absolute z-10 flex h-10 w-10 sm:h-12 sm:w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 hover:scale-110 transition-all text-foreground"
            title={integration.name}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {integration.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export function VisualContainer({ children, className }: VisualContainerProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-[564/410] w-full items-center justify-center overflow-hidden bg-muted/40 p-6 sm:p-8 dark:bg-muted/20",
        className,
      )}
    >
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/40" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function IntegrationCard({
  visual,
  title,
  description,
  url = "/dashboard",
  buttonText = "View Active Pipeline",
}: TeamCardProps) {
  return (
    <Card className="mx-auto flex w-full flex-col max-w-xl rounded-2xl overflow-hidden p-0 border shadow-sm hover:shadow-md transition-shadow">
      <VisualContainer>{visual}</VisualContainer>

      <CardContent className="p-6 sm:p-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="rounded-full px-6 shadow-sm">
            <a href={url}>{buttonText}</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IntegrationCardDemo() {
  return (
    <IntegrationCard
      visual={<IntegrationGraph />}
      title="10-Node Automated Fan-Out Engine"
      description="Sinkronisasi jadwal, generate caption bervariasi via AI, dan eksekusi posting ke Instagram, Threads, dan TikTok secara otomatis dengan sistem antrean anti-ban."
      url="/dashboard"
      buttonText="Lihat Antrean Live"
    />
  );
}
