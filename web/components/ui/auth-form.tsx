'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { LogIn, Mail } from 'lucide-react';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Gagal mengirim link auth');
      }

      setSuccess('Cek inbox email Anda untuk link login!');
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full sm:w-96 shadow-lg border-slate-200">
      <CardHeader className="space-y-2 text-center pb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <LogIn className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Masuk Dashboard
        </CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500">
          Gunakan email tim Anda untuk masuk tanpa password (Magic Link).
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 pb-6">
          <Button 
            type="submit" 
            className="w-full font-semibold shadow-sm text-white" 
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Kirim Link Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
