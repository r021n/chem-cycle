import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { AuthResponse } from '../../types/auth';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Lock, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user, isAuthenticated, setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const rawFrom = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const from = rawFrom && rawFrom !== '/' ? rawFrom : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post<AuthResponse>('/auth/login', {
        identifier,
        password,
      });

      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        addToast(`Selamat datang kembali, ${res.data.user.fullName}!`, 'success');
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kesalahan saat masuk. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg flex flex-col justify-between antialiased text-chem-dark font-sans">
      {/* Top Brand Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-chem-border/70 bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 select-none">
          <div className="w-8 h-8 rounded-xl bg-chem-forest text-chem-glow flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 spin-orbital" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)" strokeWidth="1.5" strokeDasharray="2 2" />
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <span className="font-serif italic text-lg font-medium text-chem-dark">
            Chem<span className="font-sans font-bold not-italic text-chem-sage">Cycle</span>
          </span>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-chem-ash hover:text-chem-dark transition-colors inline-flex items-center gap-1.5"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Login Form Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          <Card className="p-7 sm:p-9 shadow-float border-chem-border rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center mx-auto mb-3 border border-chem-border/70 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-chem-dark">
                Masuk ChemCycle
              </h1>
              <p className="text-xs text-chem-ash mt-1">
                Akses ruang belajar mandiri, materi daur materi, dan evaluasi adaptif
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-5 border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email atau Username"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="nama@chemcycle.id atau username"
              />

              <Input
                label="Kata Sandi"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
                Masuk ke Akun
              </Button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 pt-5 border-t border-chem-border">
              <p className="text-xs font-semibold text-chem-dark mb-2.5 flex items-center">
                <UserCheck className="w-4 h-4 mr-1 text-chem-forest" /> Masuk Cepat Akun Demo (Seeder):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('guru@chemcycle.id', 'admin123')}
                  className="p-2.5 text-left border border-chem-border rounded-xl hover:bg-chem-subtle hover:border-chem-sage/60 text-xs transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-chem-dark">Akun Guru</div>
                  <div className="text-[11px] text-chem-ash truncate">guru@chemcycle.id</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('siswa@chemcycle.id', 'siswa123')}
                  className="p-2.5 text-left border border-chem-border rounded-xl hover:bg-chem-subtle hover:border-chem-sage/60 text-xs transition-colors cursor-pointer"
                >
                  <div className="font-semibold text-chem-dark">Akun Siswa</div>
                  <div className="text-[11px] text-chem-ash truncate">siswa@chemcycle.id</div>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-chem-ash space-y-2">
              <div>
                Belum punya akun?{' '}
                <Link to="/auth/register" className="font-semibold text-chem-forest hover:text-chem-dark">
                  Daftar Akun Baru
                </Link>
              </div>
              <div>
                <Link to="/" className="text-[11px] text-chem-ash hover:text-chem-dark transition-colors inline-flex items-center gap-1">
                  ← Kembali ke Beranda
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-chem-ash border-t border-chem-border/70 bg-white/60">
        ChemCycle © {new Date().getFullYear()} — Platform Pembelajaran Siklus Biogeokimia Terpadu
      </footer>
    </div>
  );
};

export default LoginPage;
