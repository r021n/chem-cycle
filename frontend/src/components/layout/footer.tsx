import React from 'react';
import { Link } from 'react-router-dom';
import { Atom } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Atom className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-sm text-slate-900">
              ChemCycle
            </span>
            <span className="text-xs text-slate-400">v1.0.0</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Platform Pembelajaran Kimia Interaktif & Terstruktur (5E Learning Cycle)
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-xs font-medium text-slate-600">
          <Link to="/materi" className="hover:text-indigo-600 transition-colors">
            Materi
          </Link>
          <Link to="/latihan" className="hover:text-indigo-600 transition-colors">
            Latihan Soal
          </Link>
          <Link to="/aktivitas" className="hover:text-indigo-600 transition-colors">
            Aktivitas
          </Link>
          <Link to="/diskusi" className="hover:text-indigo-600 transition-colors">
            Diskusi Komunitas
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-100 py-3 text-center text-xs text-slate-400">
        Hak Cipta © {new Date().getFullYear()} ChemCycle. Seluruh hak cipta dilindungi undang-undang.
      </div>
    </footer>
  );
};
