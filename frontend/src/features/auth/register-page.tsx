import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useUiStore } from '../../stores/ui-store';
import { api, ApiError } from '../../lib/api-client';
import { AuthResponse, UserRole } from '../../types/auth';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user, isAuthenticated, setAuth } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post<AuthResponse>('/auth/register', {
        fullName,
        username,
        email,
        password,
        identityNumber,
        role,
      });

      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        addToast('Akun berhasil didaftarkan! Selamat datang.', 'success');
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Gagal mendaftar akun. Periksa data input.');
      }
    } finally {
      setLoading(false);
    }
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

      {/* Main Register Form Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md">
          <Card className="p-7 sm:p-9 shadow-float border-chem-border rounded-3xl bg-white/95 backdrop-blur-md">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-chem-subtle text-chem-forest flex items-center justify-center mx-auto mb-3 border border-chem-border/70 shadow-xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-chem-dark">
                Daftar Akun Baru
              </h1>
              <p className="text-xs text-chem-ash mt-1">
                Bergabung dengan siklus pembelajaran biogeokimia interaktif
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-5 border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role selection tab */}
              <div className="mb-2">
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-chem-ash mb-1.5">
                  Pilih Peran Akun
                </label>
                <div className="p-1 rounded-xl bg-chem-subtle grid grid-cols-2 gap-1 border border-chem-border/60">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-white text-chem-forest font-semibold shadow-xs'
                        : 'text-chem-ash hover:text-chem-dark'
                    }`}
                  >
                    Siswa (Student)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-white text-chem-forest font-semibold shadow-xs'
                        : 'text-chem-ash hover:text-chem-dark'
                    }`}
                  >
                    Guru (Admin)
                  </button>
                </div>
              </div>

              <Input
                label="Nama Lengkap"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Budi Pratama"
              />

              <Input
                label="Username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="budikimia"
              />

              <Input
                label="Alamat Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@chemcycle.id"
              />

              <Input
                label={role === 'admin' ? 'Nomor Induk Pegawai (NIP)' : 'Nomor Induk Siswa Nasional (NISN)'}
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="Opsional / 10-18 digit angka"
              />

              <Input
                label="Kata Sandi (Minimal 6 Karakter)"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
                Daftar Sekarang
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-chem-ash space-y-2">
              <div>
                Sudah memiliki akun?{' '}
                <Link to="/auth/login" className="font-semibold text-chem-forest hover:text-chem-dark">
                  Masuk ke Akun
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

export default RegisterPage;
