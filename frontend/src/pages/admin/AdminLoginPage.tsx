import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { LoadingButton } from '../../components/ui/loading-button';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useDataStore();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const success = await login(usernameOrEmail.trim(), password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setErrorMsg('Kredensial tidak valid. Gunakan email/username dan kata sandi pengelola.');
      }
    } catch {
      setErrorMsg('Gagal menghubungkan ke server backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-chem-paper lab-grid-bg flex items-center justify-center p-4 font-sans text-chem-dark">
      <div className="w-full max-w-md bg-white rounded-3xl border border-chem-border shadow-float p-8 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-chem-forest text-chem-glow mx-auto flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-8 h-8 text-chem-mint" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-chem-dark">
            Portal Administrator CMS
          </h1>
          <p className="text-xs text-chem-ash">
            Masuk untuk mengelola modul materi, aktivitas interaktif, dan bank soal kurikulum.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-chem-dark">Email atau Username Admin</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-chem-ash" />
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin@ecoinclusive.edu"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-xs text-chem-dark rounded-2xl border border-chem-border focus:border-chem-sage focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-chem-dark">Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-chem-ash" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 focus:bg-white text-xs text-chem-dark rounded-2xl border border-chem-border focus:border-chem-sage focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-chem-ash hover:text-chem-dark focus:outline-none cursor-pointer transition-colors p-1"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingLabel="Memverifikasi..."
            className="w-full py-3.5 px-4 bg-chem-forest hover:bg-chem-moss disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-float transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>Masuk ke Dashboard CMS</span>
            <ArrowRight className="w-4 h-4 text-chem-glow" />
          </LoadingButton>
        </form>

        {/* Back to Public Home */}
        <div className="text-center pt-2 border-t border-chem-border/60">
          <Link
            to="/"
            className="text-xs font-semibold text-chem-ash hover:text-chem-forest transition-colors"
          >
            ← Kembali ke Beranda Siswa
          </Link>
        </div>
      </div>
    </div>
  );
};
