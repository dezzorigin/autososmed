"use client";

import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const AuthForm: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background py-20 text-foreground">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: "easeInOut" }}
        className="relative z-10 mx-auto w-full max-w-xl p-4"
      >
        <Logo />
        <Header />
        <SocialButtons />
        <Divider />
        <LoginForm onSuccess={() => router.push("/dashboard")} />
        <TermsAndConditions />
      </motion.div>
      <BackgroundDecoration />
    </div>
  );
};

const BackButton: React.FC = () => (
  <a
    href="/"
    className="group absolute left-4 top-4 z-20 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
  >
    <ChevronLeft size={16} />
    Go back
  </a>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => (
  <button
    className={`rounded-md bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-lg text-primary-foreground 
    ring-2 ring-primary/50 ring-offset-2 ring-offset-background 
    transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-primary/70 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Logo: React.FC = () => (
  <div className="mb-6 flex justify-center">
    <div className="h-8 w-8 rounded-lg bg-primary" />
    <span className="ml-2 text-xl font-bold">AutoSosmed</span>
  </div>
);

const Header: React.FC = () => (
  <div className="mb-6 text-center">
    <h1 className="text-2xl font-semibold">Sign in to your account</h1>
    <p className="mt-2 text-muted-foreground">
      Don&apos;t have an account?{" "}
      <a href="#" className="text-primary hover:underline">
        Create one.
      </a>
    </p>
  </div>
);

const SocialButtons: React.FC = () => (
  <div className="mb-6 space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <SocialButton>Twitter</SocialButton>
      <SocialButton>Github</SocialButton>
      <SocialButton fullWidth>Sign in with SSO</SocialButton>
    </div>
  </div>
);

const SocialButton: React.FC<{
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}> = ({ icon, fullWidth, children }) => (
  <button
    className={`relative z-0 flex items-center justify-center gap-2 overflow-hidden rounded-md 
    border border-border bg-card 
    px-4 py-2 font-semibold text-card-foreground transition-all duration-500
    before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5]
    before:rounded-[100%] before:bg-muted before:transition-transform before:duration-1000 before:content-[""]
    hover:scale-105 hover:before:translate-x-[0%] hover:before:translate-y-[0%] active:scale-95
    ${fullWidth ? "col-span-2" : ""}`}
  >
    {icon}
    <span>{children}</span>
  </button>
);

const Divider: React.FC = () => (
  <div className="my-6 flex items-center gap-3">
    <div className="h-[1px] w-full bg-border" />
    <span className="text-muted-foreground">OR</span>
    <div className="h-[1px] w-full bg-border" />
  </div>
);

const LoginForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(data?.detail || "Gagal masuk. Periksa email dan password.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
          {error}
        </div>
      )}
      <div className="mb-3">
        <label
          htmlFor="email-input"
          className="mb-1.5 block text-muted-foreground"
        >
          Email
        </label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@provider.com"
          className="w-full rounded-md border border-border 
          bg-background px-3 py-2 text-foreground
          placeholder-muted-foreground 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-primary"
        />
      </div>
      <div className="mb-6">
        <div className="mb-1.5 flex items-end justify-between">
          <label
            htmlFor="password-input"
            className="block text-muted-foreground"
          >
            Password
          </label>
          <a href="#" className="text-sm text-primary">
            Forgot?
          </a>
        </div>
        <input
          id="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full rounded-md border border-border 
          bg-background px-3 py-2 text-foreground
          placeholder-muted-foreground 
          ring-1 ring-transparent transition-shadow focus:outline-0 focus:ring-primary"
        />
      </div>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
};

const TermsAndConditions: React.FC = () => (
  <p className="mt-9 text-xs text-muted-foreground">
    By signing in, you agree to our{" "}
    <a href="#" className="text-primary">
      Terms & Conditions
    </a>{" "}
    and{" "}
    <a href="#" className="text-primary">
      Privacy Policy.
    </a>
  </p>
);

const BackgroundDecoration: React.FC = () => {
  return (
    <div
      className="absolute right-0 top-0 z-0 size-[50vw]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(99 102 241 / 0.15)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-bl from-transparent to-background"
      />
    </div>
  );
};

export default AuthForm;
