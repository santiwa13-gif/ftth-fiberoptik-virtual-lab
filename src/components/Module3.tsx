import React, { useState } from "react";
import { 
  ArrowLeft, 
  Award, 
  Activity, 
  LineChart, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Info, 
  Volume2, 
  Sparkles,
  Zap
} from "lucide-react";

interface Module3Props {
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function Module3({ onBack, onComplete, isCompleted }: Module3Props) {
  // Trace Selection option
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Custom audio synthesizer with Web Audio API
  const playBeep = (freq: number, type: "sine" | "square" | "sawtooth" | "triangle" = "sine", duration: number = 0.2) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.warn("Web Audio API not supported or blocked by browser policy:", err);
    }
  };

  const handleSelectOption = (option: "A" | "B" | "C") => {
    setSelectedOption(option);
    if (option === "B") {
      // Success Sound: pleasant dual-tone chime
      playBeep(587.33, "sine", 0.12); // D5
      setTimeout(() => {
        playBeep(880, "sine", 0.22); // A5
      }, 110);
    } else {
      // Fail Sound: sad low-pitched triangle buzz
      playBeep(180, "triangle", 0.3);
    }
  };

  // Helper stats depending on active state to show in HUD
  const getTraceHUDStats = () => {
    switch (selectedOption) {
      case "A":
        return {
          event: "Kabel Putus (Reflective Fracture)",
          loss: "> 50 dB (Total loss)",
          distance: "5.0 Kilometer",
          vflState: "Laser Berhenti Total di km 5"
        };
      case "B":
        return {
          event: "Bending / Tekukan (Non-Reflective Event)",
          loss: "4.5 dB (Step drop)",
          distance: "2.5 Kilometer",
          vflState: "Cahaya Bocor Terang pd Tekukan"
        };
      case "C":
        return {
          event: "Konektor Kotor (High-Reflective Loss)",
          loss: "8.2 dB (Initial drop)",
          distance: "0.0 Kilometer",
          vflState: "Pijar Pendar di Awal Serat"
        };
      default:
        return {
          event: "Menunggu Input Operator...",
          loss: "-- dB",
          distance: "-- km",
          vflState: "--"
        };
    }
  };

  const hud = getTraceHUDStats();

  return (
    <div id="module3-screen" className="flex flex-col h-full w-full p-4 text-white bg-slate-950 relative overflow-hidden">
      
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <button
            id="btn-m3-back"
            onClick={onBack}
            className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest hidden sm:inline">|</span>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-cyan-400 animate-pulse-slow" />
            <span>Modul III: OTDR Analisis Grafik</span>
          </h3>
        </div>

        {/* Audio Mute toggle helper */}
        <button
          id="btn-toggle-sound"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-2.5 py-1 text-[10px] font-mono rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
            soundEnabled 
              ? "bg-cyan-950/40 border-cyan-900/50 text-cyan-400" 
              : "bg-slate-900 border-slate-800 text-slate-500"
          }`}
          title="Nyalakan/Matikan Simulasi Audio"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>AUDIO: {soundEnabled ? "AKTIF" : "SENYAP"}</span>
        </button>
      </div>

      {/* Guide strip */}
      <div className="bg-slate-900 border border-slate-850 px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2 shadow-inner mb-2 shrink-0">
        <div className="space-y-0.5">
          <span className="text-[9.5px] font-mono tracking-wider font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-900/60 px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            Langkah 3 dari 4: Deteksi Kerusakan Jalur Kabel
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-slate-100">
            Analisis Reflektometri Domain Waktu Optik (OTDR Graph Cases)
          </h4>
        </div>
        {selectedOption === "B" && (
          <div className="bg-emerald-950/50 border border-emerald-900 px-2 py-1 rounded inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-bounce-slow" />
            <span>KOMPETENSI TERAKREDITASI✓</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Monitor Panel, Right Case Option Panel */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch min-h-0 overflow-y-auto pr-1 pb-2">
        
        {/* Left Column: SVD OTDR Screen Layout */}
        <div className="md:col-span-7 flex flex-col gap-2">
          
          <div 
            id="otdr-monitor"
            className="flex-1 min-h-[160px] bg-slate-950 border border-slate-800 rounded-xl relative flex flex-col p-2 shadow-inner select-none font-mono"
          >
            {/* Real OSD values overlay */}
            <header className="flex justify-between items-center text-[8.5px] text-cyan-500 border-b border-slate-900 pb-1.5 mb-1 bg-slate-950">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="font-bold">OTDR TRACE VIEW - ACTIVE</span>
              </div>
              <div className="flex gap-2 text-slate-500">
                <span>PULSE: 100ns</span>
                <span>λ: 1550nm</span>
                <span>IOR: 1.46820</span>
              </div>
            </header>

            {/* High-fidelity SVG Graphics */}
            <div className="flex-1 relative flex items-center justify-center">
              <svg viewBox="0 0 450 180" className="w-full h-full">
                {/* Visual grid ticks for decibels & distance */}
                <g stroke="#334155" strokeWidth="0.5" opacity="0.4" strokeDasharray="2,2">
                  {/* Grid Lines X (distance: 1, 2, 3, 4, 5, 6 km) */}
                  <line x1="40" y1="20" x2="40" y2="155" />
                  <line x1="110" y1="20" x2="110" y2="155" />
                  <line x1="180" y1="20" x2="180" y2="155" />
                  <line x1="250" y1="20" x2="250" y2="155" />
                  <line x1="320" y1="20" x2="320" y2="155" />
                  <line x1="390" y1="20" x2="390" y2="155" />
                  <line x1="430" y1="20" x2="430" y2="155" />

                  {/* Grid Lines Y (attenuation level in dB: 0, -10, -20, -30, -40, -50) */}
                  <line x1="40" y1="20" x2="430" y2="20" />
                  <line x1="40" y1="47" x2="430" y2="47" />
                  <line x1="40" y1="74" x2="430" y2="74" />
                  <line x1="40" y1="101" x2="430" y2="101" />
                  <line x1="40" y1="128" x2="430" y2="128" />
                  <line x1="40" y1="155" x2="430" y2="155" />
                </g>

                {/* Axes and text labels */}
                {/* Distance km ruler */}
                <g fill="#64748b" className="text-[7.5px]" textAnchor="middle">
                  <text x="40" y="166">0 km</text>
                  <text x="110" y="166">1 km</text>
                  <text x="180" y="166">2 km</text>
                  <text x="250" y="166">3 km</text>
                  <text x="320" y="166">4 km</text>
                  <text x="390" y="166">5 km</text>
                  <text x="430" y="166">6 km</text>
                </g>

                {/* Attenuation dB ruler (y axis) */}
                <g fill="#64748b" className="text-[7.5px]" textAnchor="end">
                  <text x="32" y="23">0 dB</text>
                  <text x="32" y="50">-10 dB</text>
                  <text x="32" y="77">-20 dB</text>
                  <text x="32" y="104">-30 dB</text>
                  <text x="32" y="131">-40 dB</text>
                  <text x="32" y="158">-50 dB</text>
                </g>

                {/* Labels on chart screen */}
                <text x="235" y="177" textAnchor="middle" fill="#475569" className="text-[7px] font-bold uppercase tracking-wider">
                  Sumbu Horizontal: Jarak Fisik Serat Optik (km)
                </text>
                
                <text x="13" y="90" textAnchor="middle" transform="rotate(-90 13 90)" fill="#475569" className="text-[7px] font-bold uppercase tracking-wider">
                  Daya Sinyal (dB)
                </text>

                {/* DYNAMIC CASE TRACE DRAWINGS */}
                {/* Default standby trace when no option chosen */}
                {!selectedOption && (
                  <path 
                    d="M 35,120 L 40,40 L 45,55 L 430,75" 
                    fill="none" 
                    stroke="#475569" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    className="opacity-70 animate-pulse"
                  />
                )}

                {/* Option A: Cable fracture at 5km (Fresnel reflection followed by drop to noise floor) */}
                {selectedOption === "A" && (
                  <g>
                    {/* Trace path */}
                    <path 
                      d="M 35,120 L 40,40 L 45,55 L 390,85 L 392,20 L 395,152 L 430,154" 
                      fill="none" 
                      stroke="#fb7185" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                    {/* Graphic markers pointing at defect */}
                    <circle cx="392" cy="20" r="4" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                    <line x1="392" y1="20" x2="392" y2="160" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="3,3" />
                    {/* Tooltip callout on screen */}
                    <rect x="300" y="30" width="85" height="22" rx="3" fill="#020617" stroke="#fb7185" strokeWidth="0.5" />
                    <text x="342.5" y="43" textAnchor="middle" fill="#fb7185" className="text-[6.5px] font-bold leading-normal">KABEL PUTUS (5 km)</text>
                  </g>
                )}

                {/* Option B: Bending at 2.5km (Clean non-reflective vertical loss step drop) */}
                {selectedOption === "B" && (
                  <g>
                    {/* Trace path */}
                    <path 
                      d="M 35,120 L 40,40 L 45,55 L 215,70 L 216,112 L 430,130" 
                      fill="none" 
                      stroke="#22d3ee" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Highlight target zone */}
                    <circle cx="215" cy="91" r="5" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="animate-pulse" />
                    <line x1="215" y1="70" x2="215" y2="160" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="3,3" />
                    {/* Tooltip text inside monitor display */}
                    <rect x="225" y="65" width="95" height="22" rx="3" fill="#020617" stroke="#06b6d4" strokeWidth="0.5" />
                    <text x="272.5" y="78.5" textAnchor="middle" fill="#22d3ee" className="text-[6.5px] font-bold">BENDING EVENT (2.5 km)</text>
                  </g>
                )}

                {/* Option C: Dirty Connector at 0km (Massive reflection spike at launch and huge step loss) */}
                {selectedOption === "C" && (
                  <g>
                    {/* Trace path */}
                    <path 
                      d="M 35,120 L 40,20 L 45,115 L 430,135" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Highlight target zone */}
                    <circle cx="40" cy="20" r="4" fill="none" stroke="#f59e0b" strokeWidth="1" className="animate-ping" />
                    <line x1="40" y1="20" x2="40" y2="160" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="3,3" />
                    {/* Tooltip */}
                    <rect x="52" y="15" width="110" height="22" rx="3" fill="#020617" stroke="#f59e0b" strokeWidth="0.5" />
                    <text x="107" y="28" textAnchor="middle" fill="#f59e0b" className="text-[6.5px] font-bold">KONEKTOR KOTOR / REDAM (0 km)</text>
                  </g>
                )}

              </svg>
            </div>

            {/* Quick telemetry bar */}
            <div className="bg-slate-900 px-2 py-1 rounded border border-slate-850 flex justify-between text-[8px] text-slate-400 mt-1">
              <span>EVENT: <strong className="text-white">{hud.event}</strong></span>
              <span>JARAK: <strong className="text-cyan-400">{hud.distance}</strong></span>
              <span>LOSS: <strong className="text-amber-400">{hud.loss}</strong></span>
            </div>
          </div>

          {/* Quick instructions hint */}
          <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between px-1">
            <span>*Kecurigaan redaman optik diukur dari STO OLT kantor pusat.</span>
            <span>Instruksi: Analisa pola grafik miring jatuh lalu klik pilihan kanan &gt;&gt;</span>
          </div>

        </div>

        {/* Right Column: Multiple Choice Inquiry Board */}
        <div className="md:col-span-5 flex flex-col justify-between bg-slate-900 border border-slate-850 rounded-xl p-3 relative">
          
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[9.5px] font-mono font-bold text-slate-450 uppercase tracking-widest block border-b border-slate-800 pb-1.5 mb-2.5">
                PILIH DIAGNOSA YANG TEPAT:
              </span>

              {/* Three selection options */}
              <div className="space-y-2">
                
                {/* OPTION A */}
                <button
                  id="opt-a"
                  onClick={() => handleSelectOption("A")}
                  className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-start gap-2.5 cursor-pointer ${
                    selectedOption === "A"
                      ? "bg-rose-950/20 border-rose-500 text-rose-300 shadow-lg"
                      : "bg-slate-950 border-slate-850 hover:bg-slate-900/60 text-slate-350"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${
                    selectedOption === "A" ? "border-rose-450 bg-rose-500 text-slate-950 font-bold" : "border-slate-700 bg-slate-900"
                  }`}>
                    A
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-xs block text-slate-200">Kabel Putus Total di kilometer 5.0</strong>
                    <span className="text-[9px] font-mono text-slate-500 block">Karakteristik: Fresnel Reflective Peak &amp; Noise Drop</span>
                  </div>
                </button>

                {/* OPTION B (CORRECT) */}
                <button
                  id="opt-b"
                  onClick={() => handleSelectOption("B")}
                  className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-start gap-2.5 cursor-pointer ${
                    selectedOption === "B"
                      ? "bg-emerald-950/25 border-emerald-500 text-emerald-300 shadow-md"
                      : "bg-slate-950 border-slate-850 hover:bg-slate-900/60 text-slate-350"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${
                    selectedOption === "B" ? "border-emerald-450 bg-emerald-500 text-slate-950 font-bold" : "border-slate-700 bg-slate-900"
                  }`}>
                    B
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-xs block text-slate-200">Terjadi Redaman / Bending di km 2.5</strong>
                    <span className="text-[9px] font-mono text-emerald-450/80 block font-semibold flex items-center gap-1">
                      Karakteristik: Sudden Non-Reflective Step Drop (Jawaban Benar)
                    </span>
                  </div>
                </button>

                {/* OPTION C */}
                <button
                  id="opt-c"
                  onClick={() => handleSelectOption("C")}
                  className={`w-full p-2.5 rounded-lg text-left transition-all border flex items-start gap-2.5 cursor-pointer ${
                    selectedOption === "C"
                      ? "bg-amber-950/20 border-amber-500 text-amber-300 shadow-lg"
                      : "bg-slate-950 border-slate-850 hover:bg-slate-900/60 text-slate-350"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${
                    selectedOption === "C" ? "border-amber-450 bg-amber-550 text-slate-950 font-bold" : "border-slate-700 bg-slate-900"
                  }`}>
                    C
                  </div>
                  <div className="space-y-0.5">
                    <strong className="text-xs block text-slate-200">Konektor Kotor di kilometer 0.0</strong>
                    <span className="text-[9px] font-mono text-slate-500 block">Karakteristik: High Initial Reflection &amp; Insertion Loss</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Dynamic Pedagogical and feedback response panel */}
            <div className="mt-2.5 flex-1 flex flex-col justify-end">
              {selectedOption === null && (
                <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-850 text-[10px] text-slate-400 flex items-start gap-2 animate-fade-in">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    Silakan klik salah satu opsi studi kasus di atas untuk memproyeksikan jejak sinyal sirkuit fisik ke monitor OTDR sebelah kiri secara dinamis, dan dengarkan petunjuk sinyal audio instan.
                  </p>
                </div>
              )}

              {selectedOption === "B" && (
                <div className="bg-emerald-950/30 rounded-lg p-2.5 border border-emerald-900/60 text-[10px] text-emerald-300 space-y-1.5 animate-scale-in">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>DIAGNOSA AKURAT ✓ EXCELLENT!</span>
                  </div>
                  <p className="leading-relaxed text-slate-300 text-[9.5px]">
                    <strong>Penjelasan Pedagogis:</strong> Penurunan drastis setajam anak tangga tanpa ada spike pembalikan (non-reflective event) di km 2.5 mutlak menandakan adanya <strong>bending (tekukan tajam)</strong>. Tekukan merubah sudut kritis inti silika sehingga merusak pemantulan internal sempurna, dan memicu kebocoran foton cahaya keluar ke buffer jacket.
                  </p>
                </div>
              )}

              {(selectedOption === "A" || selectedOption === "C") && (
                <div className="bg-rose-950/25 rounded-lg p-2.5 border border-rose-900/50 text-[10px] text-rose-300 space-y-1.5 animate-scale-in">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 font-mono">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>DIAGNOSA KURANG TEPAT ⚠️</span>
                  </div>
                  <p className="leading-relaxed text-slate-350 text-[9.5px]">
                    {selectedOption === "A" ? (
                      <span><strong>Analisa Pola:</strong> Kabel putus (fracture) memotong jalur total. Di kilometer 5 di grafik terlihat ada Fresnel Reflection (puncak pulsa lancip karena batas kaca-udara) disusul penurunan daya instan ke garis bawah (noise floor). Cari grafik yang memiliki drop non-reflective tanpa spike di km 2.5!</span>
                    ) : (
                      <span><strong>Analisa Pola:</strong> Konektor yang kotor berada di pangkal transmisi (kilometer 0), ditunjukkan dengan lonjakan reflektifitas masukan di titik nol, namun setelahnya kabel meneruskan sinyal secara datar. Pahami pola drop murni di tengah jalur (km 2.5).</span>
                    )}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Control Navigation & Finalize Module Bar */}
      <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between items-center bg-slate-950 shrink-0">
        <div id="m3-footer-tip" className="text-[10px] text-slate-500 font-mono hidden sm:block">
          Dapatkan jawaban yang benar (Opsi B) untuk merekam kelulusan Modul III secara permanen.
        </div>

        <button
          id="btn-complete-m3"
          onClick={onComplete}
          disabled={!isCompleted && selectedOption !== "B"}
          className={`py-2 px-5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isCompleted || (selectedOption === "B")
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-[0.98]"
              : "bg-slate-900 border border-slate-800 text-slate-650 cursor-not-allowed"
          }`}
        >
          <Award className="w-4 h-4 text-emerald-300" />
          <span>{isCompleted ? "Kembali ke Dashboard (Tuntas)" : "Simpan & Tuntaskan Modul III"}</span>
        </button>
      </div>

    </div>
  );
}
