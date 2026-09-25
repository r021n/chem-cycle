import React, { useState } from 'react';
import { Sliders, RotateCcw, AlertTriangle, CheckCircle, Leaf, Flame, Factory } from 'lucide-react';

interface CarbonCycleSimulatorProps {
  initialState?: {
    industrialEmission?: number;
    greenCatalystEfficiency?: number;
    reforestationIndex?: number;
    simulationYears?: number;
  };
}

export const CarbonCycleSimulator: React.FC<CarbonCycleSimulatorProps> = ({ initialState }) => {
  const [emission, setEmission] = useState<number>(initialState?.industrialEmission ?? 42);
  const [catalyst, setCatalyst] = useState<number>(initialState?.greenCatalystEfficiency ?? 25);
  const [reforestation, setReforestation] = useState<number>(initialState?.reforestationIndex ?? 30);

  // Biological absorption capacity (baseline 12 Gt + reforestation bonus)
  const bioAbsorption = 12 + (reforestation / 100) * 16; // approx 15 - 28 Gt
  // Catalytic capture amount
  const catalyticCapture = emission * (catalyst / 100);
  // Net annual emission addition to atmosphere
  const netEmission = Math.max(0, emission - catalyticCapture - bioAbsorption);

  // Projected CO2 ppm in 30 years from baseline 422 ppm
  const projectedPpm = Math.round(422 + (netEmission * 0.45 * 30));
  // Temperature anomaly based on climate sensitivity formula approx
  const tempAnomaly = Number((1.2 + (projectedPpm - 420) * 0.008).toFixed(2));

  // Determine ecological status
  const isNetZero = netEmission <= 1.0;
  const isSafe = tempAnomaly <= 1.5;

  const handleReset = () => {
    setEmission(initialState?.industrialEmission ?? 42);
    setCatalyst(initialState?.greenCatalystEfficiency ?? 25);
    setReforestation(initialState?.reforestationIndex ?? 30);
  };

  return (
    <div className="bg-white rounded-3xl border border-chem-border shadow-subtle p-6 space-y-6 font-sans">
      {/* Title & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-chem-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Simulasi Dinamika Neraca Karbon
            </span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-chem-dark mt-1">
            Laboratorium Interaktif: Neraca Massa & Dinamika Fluks Karbon
          </h3>
          <p className="text-xs text-chem-ash">
            Ubah parameter variabel untuk mengamati dampak langsung terhadap proyeksi ppm atmosfer dan anomali temperatur.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-chem-ash hover:text-chem-dark bg-chem-subtle hover:bg-chem-border/60 rounded-xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Model</span>
        </button>
      </div>

      {/* Main Interactive Grid: Controls & Real-time Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Controller (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 bg-chem-subtle/50 p-5 rounded-2xl border border-chem-border">
          <div className="flex items-center gap-2 text-xs font-bold text-chem-forest uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-chem-sage" />
            <span>Pengaturan Variabel Pengujian</span>
          </div>

          {/* Slider 1: Emisi Industri */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-chem-dark flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-rose-600" />
                Laju Emisi Antropogenik (Fosil & Industri)
              </span>
              <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {emission} Gt CO₂/thn
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="1"
              value={emission}
              onChange={(e) => setEmission(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[10px] text-chem-ash">
              <span>10 Gt (Transisi Total)</span>
              <span>42 Gt (Tingkat Riil Saat Ini)</span>
              <span>70 Gt (Ekspansi Berat)</span>
            </div>
          </div>

          {/* Slider 2: Efisiensi Katalis Hijau / Carbon Capture */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-chem-dark flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                Efisiensi Penangkapan Katalitik (CCU/CCS)
              </span>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {catalyst}% (Terserap: {catalyticCapture.toFixed(1)} Gt)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={catalyst}
              onChange={(e) => setCatalyst(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-chem-ash">
              <span>0% (Tanpa Filter)</span>
              <span>50% (Nanokatalis Maju)</span>
              <span>90% (Sirkular Maksimal)</span>
            </div>
          </div>

          {/* Slider 3: Reboisasi & Tutupan Biomassa */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-chem-dark flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                Indeks Tutupan Hijau & Fotosintesis Alami
              </span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {reforestation}% (Absorpsi: {bioAbsorption.toFixed(1)} Gt)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={reforestation}
              onChange={(e) => setReforestation(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-chem-ash">
              <span>10% (Deforestasi)</span>
              <span>50% (Restorasi Seimbang)</span>
              <span>90% (Konservasi Masif)</span>
            </div>
          </div>
        </div>

        {/* Real-time Result Meters & Projections (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-chem-paper p-5 rounded-2xl border border-chem-border">
          <div className="space-y-3">
            <div className="text-xs font-bold text-chem-ash uppercase tracking-wider">
              Indikator Dampak Real-time
            </div>

            {/* Net Annual Emissions Card */}
            <div className="p-3.5 rounded-xl bg-white border border-chem-border">
              <span className="text-[11px] text-chem-ash block">Emisi Netto ke Atmosfer</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-bold font-mono ${netEmission > 10 ? 'text-rose-600' : netEmission > 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {netEmission.toFixed(1)}
                </span>
                <span className="text-xs text-chem-ash font-medium">Gt CO₂/tahun</span>
              </div>
            </div>

            {/* Projected PPM Card */}
            <div className="p-3.5 rounded-xl bg-white border border-chem-border">
              <span className="text-[11px] text-chem-ash block">Proyeksi Konsentrasi CO₂ (30 Thn)</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-bold font-mono ${projectedPpm > 480 ? 'text-rose-600' : projectedPpm > 440 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {projectedPpm}
                </span>
                <span className="text-xs text-chem-ash font-medium">ppm (Baseline 422 ppm)</span>
              </div>
            </div>

            {/* Temperature Anomaly */}
            <div className="p-3.5 rounded-xl bg-white border border-chem-border">
              <span className="text-[11px] text-chem-ash block">Estimasi Kenaikan Suhu Global</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-2xl font-bold font-mono ${tempAnomaly > 2.0 ? 'text-rose-600' : tempAnomaly > 1.5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  +{tempAnomaly}°C
                </span>
                <span className="text-xs text-chem-ash font-medium">di atas era pra-industri</span>
              </div>
            </div>
          </div>

          {/* Status Alert Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
              isNetZero && isSafe
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : !isSafe
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {isNetZero && isSafe ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold">
                {isNetZero && isSafe
                  ? 'Kondisi Aman: Jalur Net-Zero Tercapai'
                  : !isSafe
                  ? 'Krisis Iklim: Melebihi Batas Ambang 1.5°C'
                  : 'Transisi Bertahap: Perlu Penajaman Mitigasi'}
              </p>
              <p className="text-[10px] opacity-80 leading-tight">
                {isNetZero && isSafe
                  ? 'Neraca emisi dan absorpsi seimbang. Laju akumulasi stabil.'
                  : !isSafe
                  ? 'Konsentrasi CO₂ tinggi memicu efek rumah kaca kritis.'
                  : 'Tingkatkan efisiensi katalis atau turunkan emisi primer.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
