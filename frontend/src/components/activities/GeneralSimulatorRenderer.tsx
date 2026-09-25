import React, { useState } from 'react';
import { InteractiveModuleConfig } from '../../types/app';
import { CarbonCycleSimulator } from './CarbonCycleSimulator';
import { ChemFormula } from '../common/ChemFormula';

interface GeneralSimulatorRendererProps {
  config: InteractiveModuleConfig;
}

export const GeneralSimulatorRenderer: React.FC<GeneralSimulatorRendererProps> = ({ config }) => {
  if (config.type === 'carbon_cycle_simulator') {
    return <CarbonCycleSimulator initialState={config.initialState as any} />;
  }

  if (config.type === 'reaction_kinetics') {
    return <KineticsSimulator />;
  }

  if (config.type === 'equilibrium_shift') {
    return <EquilibriumSimulator />;
  }

  if (config.type === 'embed_iframe' && config.embedUrl) {
    return (
      <div className="bg-white rounded-3xl border border-chem-border overflow-hidden shadow-subtle p-4 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-chem-forest">{config.title}</span>
          <span className="text-[10px] text-chem-ash">Simulasi Eksternal Terisolasi</span>
        </div>
        <div className="aspect-video w-full rounded-2xl overflow-hidden border border-chem-border bg-slate-100">
          <iframe
            src={config.embedUrl}
            title={config.title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-chem-subtle rounded-2xl border border-chem-border text-center">
      <p className="text-xs text-chem-ash italic">Modul simulasi sedang dalam konfigurasi.</p>
    </div>
  );
};

// Sub-component: Kinetika Reaksi & Suhu Simulator
const KineticsSimulator: React.FC = () => {
  const [temperature, setTemperature] = useState(35);
  const [substrate, setSubstrate] = useState(1.5);
  const [catalystType, setCatalystType] = useState<'tanpa' | 'mno2' | 'katalase'>('katalase');

  // Calculate rate based on Arrhenius and enzyme denaturation
  let rateMultiplier = 1.0;
  if (catalystType === 'mno2') rateMultiplier = 4.2;
  else if (catalystType === 'katalase') {
    if (temperature <= 40) {
      rateMultiplier = 8.5 * (1 + (temperature - 20) * 0.04);
    } else {
      // enzyme denatures rapidly above 42°C
      rateMultiplier = Math.max(0.2, 8.5 * Math.exp(-(temperature - 40) * 0.15));
    }
  }

  const rate = Number((substrate * 0.8 * rateMultiplier * Math.pow(1.03, temperature - 25)).toFixed(2));
  const reactionTime = Math.max(2, Math.round(120 / (rate + 0.1)));

  return (
    <div className="bg-white rounded-3xl border border-chem-border shadow-subtle p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-chem-border">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Kinetika Kimia Hijau
          </span>
          <h3 className="text-lg font-bold text-chem-dark mt-1">
            Simulator Uji Laju Dekomposisi H₂O₂ & Pengaruh Suhu
          </h3>
          <p className="text-xs text-chem-ash">
            Bandingkan efisiensi enzim katalase vs katalis anorganik MnO₂ pada rentang suhu 10°C - 80°C.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-chem-subtle/50 p-5 rounded-2xl border border-chem-border">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-chem-dark">Suhu Reaksi: {temperature}°C</span>
              <span className="text-[11px] text-chem-ash font-mono">{temperature > 45 && catalystType === 'katalase' ? '⚠️ Denaturasi Terjadi' : 'Suhu Terkendali'}</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-chem-dark">Konsentrasi Substrat [H₂O₂]: {substrate} M</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={substrate}
              onChange={(e) => setSubstrate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-chem-forest"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-chem-dark block">Pilihan Katalis:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tanpa', label: 'Tanpa Katalis' },
                { id: 'mno2', label: 'MnO₂ (Anorganik)' },
                { id: 'katalase', label: 'Katalase (Biokatalis)' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCatalystType(c.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                    catalystType === c.id
                      ? 'bg-chem-forest text-white font-bold'
                      : 'bg-white border border-chem-border text-chem-ash hover:bg-chem-subtle'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meters */}
        <div className="space-y-4 bg-chem-paper p-5 rounded-2xl border border-chem-border flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-xl border border-chem-border">
              <span className="text-[11px] text-chem-ash block">Laju Pembentukan Gas Oksigen (v)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-chem-forest">{rate}</span>
                <span className="text-xs text-chem-ash">mL O₂/detik</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-chem-border">
              <span className="text-[11px] text-chem-ash block">Estimasi Waktu Dekomposisi Lengkap</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-mono font-bold text-emerald-600">{reactionTime}</span>
                <span className="text-xs text-chem-ash">detik</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-chem-subtle rounded-xl text-xs text-chem-dark border border-chem-border/70">
            <p className="font-semibold mb-1">Persamaan Reaksi:</p>
            <ChemFormula formula="2H2O2(aq) -> 2H2O(l) + O2(g)" className="text-sm font-bold text-chem-forest" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Kesetimbangan Ion Karbonat & pH Laut Simulator
const EquilibriumSimulator: React.FC = () => {
  const [ph, setPh] = useState(8.1);
  const [temp, setTemp] = useState(25);

  // Fraction approximations of carbonate species based on ocean pH
  // At pH 8.1: HCO3- dominates (~88%), CO3^2- (~11%), CO2(aq) (~1%)
  const hco3 = Math.max(50, Math.min(95, 88 + (7.8 - ph) * 15));
  const co3 = Math.max(1, Math.min(25, 11 + (ph - 8.1) * 22 - (temp - 25) * 0.3));
  const dissolvedCo2 = Math.max(0.5, 100 - hco3 - co3);

  // Aragonite saturation state (Omega)
  const omega = Number((co3 / 11 * 3.8).toFixed(2));
  const isCorrosive = omega < 1.0;

  return (
    <div className="bg-white rounded-3xl border border-chem-border shadow-subtle p-6 space-y-6">
      <div className="pb-4 border-b border-chem-border">
        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
          Kimia Oseanografi
        </span>
        <h3 className="text-lg font-bold text-chem-dark mt-1">
          Model Dinamis Kesetimbangan Sistem Karbonat & Pengasaman Samudra
        </h3>
        <p className="text-xs text-chem-ash">
          Amati pergeseran fraksi ion karbonat (CO₃²⁻) terhadap penurunan pH dan dampaknya bagi kalsifikasi terumbu karang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 bg-chem-subtle/50 p-5 rounded-2xl border border-chem-border">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-chem-dark">pH Permukaan Laut: {ph}</span>
              <span className={`font-bold font-mono text-[11px] ${ph < 7.8 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {ph >= 8.1 ? 'Normal (Alami)' : ph >= 7.8 ? 'Terdegradasi' : 'Kritis (Korosif)'}
              </span>
            </div>
            <input
              type="range"
              min="7.4"
              max="8.4"
              step="0.05"
              value={ph}
              onChange={(e) => setPh(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-chem-dark">Suhu Air Laut: {temp}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="35"
              step="1"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-chem-forest"
            />
          </div>
        </div>

        <div className="space-y-3 bg-chem-paper p-5 rounded-2xl border border-chem-border flex flex-col justify-between">
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-bold text-chem-ash block">Distribusi Fraksi Spesies:</span>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>Ion Bikarbonat [HCO₃⁻]:</span>
                <span className="font-mono font-bold text-chem-forest">{hco3.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Ion Karbonat Bebas [CO₃²⁻]:</span>
                <span className="font-mono font-bold text-blue-700">{co3.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Gas CO₂ Terlarut [CO₂(aq)]:</span>
                <span className="font-mono font-bold text-amber-700">{dissolvedCo2.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-xs ${isCorrosive ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Tingkat Kejenuhan Aragonit (Ω):</span>
              <span className="text-base font-bold font-mono">{omega}</span>
            </div>
            <p className="text-[10px] mt-1 opacity-80">
              {isCorrosive
                ? '⚠️ Ω < 1.0: Air laut bersifat melarutkan kalsium karbonat (koral tidak dapat mempertahankan cangkang).'
                : '✓ Ω ≥ 1.0: Kondisi air laut mendukung presipitasi dan pembentukan koral baru.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
