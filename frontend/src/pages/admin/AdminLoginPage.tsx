import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useDataStore();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(usernameOrEmail.trim(), password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMsg('Kredensial tidak valid. Gunakan email/username dan kata sandi pengelola.');
    }
  };

  const fillDemoCredentials = () => {
    setUsernameOrEmail('admin@ecoinclusive.edu');
    setPassword('admin123');
    setErrorMsg('');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail.trim().length > 3) {
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setResetModalOpen(false);
        setResetEmail('');
      }, 2500);
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

        {/* Demo Fast Login Helper */}
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold block flex items-center gap-1 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Demo Akun Instan
            </span>
            <span className="text-[11px] opacity-80">
              admin@ecoinclusive.edu / admin123
            </span>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition-colors cursor-pointer"
          >
            Gunakan Akun Demo
          </button>
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-chem-dark">Kata Sandi</label>
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="text-[11px] text-chem-forest hover:text-chem-moss font-semibold cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-chem-ash" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 focus:bg-white text-xs text-chem-dark rounded-2xl border border-chem-border focus:border-chem-sage focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-chem-forest hover:bg-chem-moss text-white rounded-2xl text-xs font-bold shadow-float transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>Masuk ke Dashboard CMS</span>
            <ArrowRight className="w-4 h-4 text-chem-glow" />
          </button>
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

      {/* Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-chem-border max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-serif text-lg font-bold text-chem-dark">
                Atur Ulang Kata Sandi
              </h3>
            </div>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 text-center">
                Tautan verifikasi pembaruan kata sandi telah dikirimkan ke email terdaftar!
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <p className="text-xs text-chem-ash">
                  Masukkan email administrator Anda untuk menerima tautan pemulihan sesi aman.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@ecoinclusive.edu"
                  className="w-full p-3 bg-slate-50 text-xs rounded-xl border border-chem-border focus:border-chem-sage focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-chem-ash hover:text-chem-dark cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-chem-forest hover:bg-chem-moss text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Kirim Tautan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
