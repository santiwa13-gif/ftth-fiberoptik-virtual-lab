import React, { useState, useEffect } from "react";
import { AppScreen } from "../types";
import { 
  ArrowLeft, 
  Zap, 
  Award, 
  RefreshCw, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Sliders, 
  Play, 
  Settings, 
  AlertTriangle,
  Flame,
  Info,
  Check,
  MoveHorizontal
} from "lucide-react";
import { audioSynth } from "../utils/audio";

interface Module2Props {
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

enum ActiveTab {
  SIMULATOR = "SIMULATOR",
  THEORY = "THEORY"
}

export default function Module2({ onBack, onComplete, isCompleted }: Module2Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.SIMULATOR);
  
  // Drag & Drop / Selection states for core fiber optik
  const [isLeftPlaced, setIsLeftPlaced] = useState<boolean>(false);
  const [isRightPlaced, setIsRightPlaced] = useState<boolean>(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);
  const [isOverLeft, setIsOverLeft] = useState<boolean>(false);
  const [isOverRight, setIsOverRight] = useState<boolean>(false);

  // Simulator State
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [isSplicing, setIsSplicing] = useState<boolean>(false);
  const [isSpliced, setIsSpliced] = useState<boolean>(false);
  const [spliceLoss, setSpliceLoss] = useState<number | null>(null);
  const [spliceStatus, setSpliceStatus] = useState<"SUCCESS" | "FAILED" | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "Splicer standby. Tarik & letakkan dua ujung core fiber optik ke slot V-Groove!",
    "Sensor ready. Elektroda tungsten terkalibrasi."
  ]);

  // Visual simulation coordinates
  const [leftY, setLeftY] = useState<number>(35); // Misaligned initially (Slightly high)
  const [rightY, setRightY] = useState<number>(45); // Misaligned initially (Slightly low and fully visible in the right rail)
  const [leftX, setLeftX] = useState<number>(70); // Far apart but long enough to be highly visible
  const [rightX, setRightX] = useState<number>(130); // Far apart but long enough to be highly visible

  // Add log helper
  const addLog = (msg: string) => {
    setSystemLogs(prev => [msg, ...prev.slice(0, 5)]);
  };

  // Drag and drop events
  const handleDragStart = (e: React.DragEvent, side: "left" | "right") => {
    e.dataTransfer.setData("fiber_side", side);
    if (side === "left") setIsDraggingLeft(true);
    if (side === "right") setIsDraggingRight(true);
  };

  const handleDragEnd = (side: "left" | "right") => {
    if (side === "left") setIsDraggingLeft(false);
    if (side === "right") setIsDraggingRight(false);
  };

  const handleDragOverZone = (e: React.DragEvent, side: "left" | "right") => {
    e.preventDefault();
    if (side === "left") setIsOverLeft(true);
    if (side === "right") setIsOverRight(true);
  };

  const handleDragLeaveZone = (side: "left" | "right") => {
    if (side === "left") setIsOverLeft(false);
    if (side === "right") setIsOverRight(false);
  };

  const handleDropOnZone = (e: React.DragEvent, zoneSide: "left" | "right") => {
    e.preventDefault();
    setIsOverLeft(false);
    setIsOverRight(false);
    
    const dragSide = e.dataTransfer.getData("fiber_side");
    
    if (dragSide === zoneSide) {
      handlePlaceFiber(zoneSide);
    } else {
      // Wrong side dropped onto incorrect slot
      audioSynth.playAlarm();
      addLog(`❌ Alarm warning: Serat optik sisi ketukar! Pasang core ${dragSide === "left" ? "KIRI" : "KANAN"} pada baki v-groove ${zoneSide === "left" ? "kiri" : "kanan"}.`);
    }
  };

  const handlePlaceFiber = (side: "left" | "right") => {
    if (side === "left") {
      if (isLeftPlaced) return;
      setIsLeftPlaced(true);
      audioSynth.playPop();
      addLog("✓ Core optik Kiri terpasang tepat di atas elektroda slot V-Groove kiri.");
    } else {
      if (isRightPlaced) return;
      setIsRightPlaced(true);
      audioSynth.playPop();
      addLog("✓ Core optik Kanan terpasang tepat di atas elektroda slot V-Groove kanan.");
    }
  };

  // 1. Alignment trigger
  const handleAlign = () => {
    if (!isLeftPlaced || !isRightPlaced) {
      audioSynth.playAlarm();
      addLog("⚠️ Sumbu error: Masukkan kedua serat optik terlebih dahulu!");
      return;
    }
    if (isAligned) return;
    addLog("Melakukan penyelasaran sumbu core otomatis (Core Alignment)...");
    
    // Smooth transition simulation - bringing the cores to horizontal center (y=40) and close together
    setTimeout(() => {
      setLeftY(40);
      setRightY(40);
      setLeftX(96);   // Beautiful 4px gap from center (x=100)
      setRightX(104); // Beautiful 4px gap from center (x=100)
      setIsAligned(true);
      addLog("✓ Penyelarasan X/Y axis SUKSES. Sudut simpang < 0.1°.");
    }, 1200);
  };

  // 2. Fusion Splicing laser/arc spark trigger
  const handleSplice = () => {
    if (!isAligned || isSplicing) return;
    setIsSplicing(true);
    
    // Play laser / arc sizzle sound effect
    audioSynth.playSplice();
    addLog("Melepaskan lucutan elektrik busur gas plasma (4000V)...");

    setTimeout(() => {
      // Connect fiber ends completely at the exact center (x=100)
      setLeftX(100);
      setRightX(100);
      
      // Calculate realistic, successful splicing loss under 0.03 dB
      const generatedLoss = parseFloat((0.01 + Math.random() * 0.018).toFixed(3));
      setSpliceLoss(generatedLoss);

      setIsSplicing(false);
      setIsSpliced(true);

      if (generatedLoss <= 0.03) {
        setSpliceStatus("SUCCESS");
        addLog(`✓ SAMBUNGAN BERHASIL! Loss: ${generatedLoss} dB (Standard ITU G.652D &lt; 0.03dB).`);
      } else {
        setSpliceStatus("FAILED");
        audioSynth.playAlarm();
        addLog(`❌ SAMBUNGAN LEMAH! Loss: ${generatedLoss} dB. Melebihi ambang batas redaman.`);
      }
    }, 1800);
  };

  // 3. Reset/Retry Splicing
  const handleRetry = () => {
    setIsLeftPlaced(false);
    setIsRightPlaced(false);
    setIsAligned(false);
    setIsSplicing(false);
    setIsSpliced(false);
    setSpliceLoss(null);
    setSpliceStatus(null);
    setLeftY(35);
    setRightY(45);
    setLeftX(70);
    setRightX(130);
    setSystemLogs([
      "Baki V-Groove dibersihkan... Masukkan kembali serat optik baru.",
      "Splicer standby."
    ]);
  };

  // Helper text guidance
  const getInstructionText = () => {
    if (!isLeftPlaced) {
      return "Tarik core fiber optik sebelah kiri dan letakkan tepat di atas elektroda slot V-Groove!";
    }
    if (!isRightPlaced) {
      return "Bagus! Sekarang tarik core fiber optik sebelah kanan ke slot V-Groove sebelah kanan!";
    }
    if (!isAligned) {
      return "Kedua core telah berada di posisi V-Groove! Silakan klik 'LURUSKAN SUMBU (ALIGNMENT)' untuk koreksi posisi sumbu core!";
    }
    if (!isSpliced) {
      return "Fibers telah lurus sempurna! Klik tombol 'SAMBUNG (SPLICE CORE)' yang berkedip di samping kanan!";
    }
    if (spliceStatus === "SUCCESS") {
      return "Luar biasa! Sambungan serat optik tuntas dengan loss rendah. Klik 'Simpan & Tuntaskan Modul II'!";
    }
    return "Sambungan rapuh/redaman tinggi! Klik 'Reset & Las Ulang' di kanan bawah untuk mengulang proses pengelasan.";
  };

  return (
    <div id="module2-screen" className="flex flex-col h-full w-full p-4 text-white bg-slate-950 relative overflow-hidden">
      
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            id="btn-m2-back"
            onClick={onBack}
            className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          
          <span className="text-[10px] text-slate-500 font-mono tracking-widest hidden sm:inline">|</span>
          
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse-slow" />
            <span>Modul II: Proses Fusion Splicing</span>
          </h3>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-850">
          <button
            id="tab-sim-btn"
            onClick={() => setActiveTab(ActiveTab.SIMULATOR)}
            className={`px-3 py-1 text-[10px] rounded-md font-mono flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === ActiveTab.SIMULATOR
                ? "bg-cyan-650 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulator Splicing</span>
          </button>

          <button
            id="tab-theory-btn"
            onClick={() => setActiveTab(ActiveTab.THEORY)}
            className={`px-3 py-1 text-[10px] rounded-md font-mono flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === ActiveTab.THEORY
                ? "bg-cyan-650 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>SOP & Aturan Las</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-2">
        
        {/* TAB 1: INTERACTIVE SIMULATOR WORKSTATION */}
        {activeTab === ActiveTab.SIMULATOR && (
          <div className="space-y-2.5">
            
            {/* Guide strip displaying progress index & instructional voice lines */}
            <div className="bg-slate-900 border border-slate-850 px-3 py-2 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-inner">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8.5px] font-mono tracking-wider font-extrabold text-cyan-400 bg-cyan-950/40 border border-cyan-900/60 px-2.5 py-0.5 rounded uppercase inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                    INSTRUKSI GURU (Langkah 2 dari 4)
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">Close-up Terminal Monitor</span>
                </div>
                <h4 className="text-xs font-bold text-slate-250 leading-relaxed font-sans">
                  "{getInstructionText()}"
                </h4>
              </div>

              {spliceStatus === "SUCCESS" && (
                <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 px-3 py-1 rounded-md flex items-center gap-1 text-[9.5px] font-mono font-bold animate-pulse uppercase shrink-0 self-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SAMBUNGAN LOLOS INTEGRITAS</span>
                </div>
              )}
            </div>

            {/* Splicer Interface Layout */}
            <div className="grid grid-cols-12 gap-3 items-stretch">
              
              {/* LEFT fiber pot column (source tray for Left fiber) */}
              <div className="col-span-12 sm:col-span-2 flex flex-col gap-2 bg-slate-900/65 border border-slate-900 rounded-xl p-2 justify-center text-center">
                <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-800 pb-1">
                  Core Kiri
                </span>
                
                {!isLeftPlaced ? (
                  <div
                    draggable={!isSplicing}
                    onDragStart={(e) => handleDragStart(e, "left")}
                    onDragEnd={() => handleDragEnd("left")}
                    onClick={() => handlePlaceFiber("left")}
                    className={`p-2 rounded-lg border border-dashed text-center flex flex-col items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing transition-all ${
                      isDraggingLeft 
                        ? "bg-cyan-950/50 border-cyan-400 animate-pulse text-cyan-300"
                        : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                    title="Sentuh & seret ke dalam monitor, atau klik untuk memasang langsung!"
                  >
                    <div className="w-6 h-1 bg-cyan-500 rounded animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                    <span className="text-[9px] font-mono font-bold uppercase select-none leading-none">
                      Drag / Klik
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold leading-none select-none">
                      Kupas Core
                    </span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/60 text-emerald-400 flex flex-col items-center justify-center gap-1">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-[8px] font-mono font-extrabold uppercase">TERPASANG</span>
                    {!isSpliced && (
                      <button 
                        onClick={() => setIsLeftPlaced(false)}
                        className="text-[7.5px] font-mono text-slate-505 hover:text-rose-400 font-bold hover:underline bg-transparent border-none mt-1 cursor-pointer"
                      >
                        [Tarik Balik]
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CENTER column: Splicer Machine Screen Monitor (SVG View) */}
              <div className="col-span-12 sm:col-span-7 flex flex-col gap-1.5">
                <div 
                  id="splicer-monitor"
                  onDragOver={(e) => handleDragOverZone(e, !isLeftPlaced ? "left" : "right")}
                  onDragLeave={() => { setIsOverLeft(false); setIsOverRight(false); }}
                  onDrop={(e) => handleDropOnZone(e, !isLeftPlaced ? "left" : "right")}
                  className={`bg-slate-950 rounded-xl border p-2 h-[155px] relative flex flex-col overflow-hidden shadow-inner font-mono transition-all duration-300 ${
                    isOverLeft || isOverRight 
                      ? "border-cyan-400 bg-slate-900/70"
                      : "border-slate-850"
                  }`}
                >
                  {/* Camera grids overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.15] border-t border-b border-dashed border-slate-500 my-auto h-0.5"></div>
                  <div className="absolute inset-0 pointer-events-none opacity-[0.15] border-l border-r border-dashed border-slate-500 mx-auto w-0.5"></div>
                  
                  {/* OSD telemetry lines */}
                  <div className="absolute top-1.5 left-2.5 right-2.5 flex justify-between text-[8px] text-slate-500 pointer-events-none select-none z-20">
                    <div className="flex gap-2">
                      <span className="text-cyan-400 font-extrabold">CLOSE-UP V-GROOVE</span>
                      <span>X/Y CAMERA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${isLeftPlaced && isRightPlaced ? "bg-emerald-500 animate-pulse" : "bg-yellow-500 animate-pulse"}`}></span>
                      <span className={isLeftPlaced && isRightPlaced ? "text-emerald-400 font-bold" : "text-yellow-500"}>
                        {isLeftPlaced && isRightPlaced ? "SERAT DETECTED" : "MENUNGGU SERAT"}
                      </span>
                    </div>
                  </div>

                  {/* Splicer Core SVG Visualizer */}
                  <div className="flex-1 w-full flex items-center justify-center relative">
                    
                    <svg viewBox="0 0 200 80" className="w-full h-full">
                      {/* Grid overlay */}
                      <g stroke="#ffffff" strokeWidth="0.08" opacity="0.12">
                        <line x1="20" y1="40" x2="180" y2="40" />
                        <line x1="100" y1="10" x2="100" y2="70" />
                        <circle cx="100" cy="40" r="10" fill="none" strokeWidth="0.5" />
                        <circle cx="100" cy="40" r="22" fill="none" strokeWidth="0.3" strokeDasharray="2,1" />
                      </g>

                      {/* V-Groove metal rails representation underneath */}
                      <g fill="#1e293b" stroke="#334155" strokeWidth="0.4" opacity="0.6">
                        {/* Left block rail */}
                        <path d="M 5,30 L 45,30 L 51,40 L 45,50 L 5,50 Z" />
                        {/* Right block rail */}
                        <path d="M 195,30 L 155,30 L 149,40 L 155,50 L 195,50 Z" />
                      </g>

                      {/* Central Electrodes (Top & Bottom tungsten needle pins) */}
                      <g stroke="#475569" strokeWidth="2" strokeLinecap="round">
                        {/* Top needle */}
                        <line x1="100" y1="2" x2="100" y2="23" strokeWidth="3" />
                        <polygon points="97,23 103,23 100,28" fill="#94a3b8" stroke="none" />
                        {/* Bottom needle */}
                        <line x1="100" y1="78" x2="100" y2="57" strokeWidth="3" />
                        <polygon points="97,57 103,57 100,52" fill="#94a3b8" stroke="none" />
                      </g>

                      {/* Missing Fiber Silhouette place guides when unplaced */}
                      {!isLeftPlaced && (
                        <g>
                          <rect x="0" y="27" width="70" height="16" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="1.5,1.5" opacity="0.35" />
                          <line x1="0" y1="35" x2="70" y2="35" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                          {isOverLeft && (
                            <rect x="0" y="27" width="70" height="16" fill="#0ea5e9" opacity="0.15" />
                          )}
                        </g>
                      )}

                      {!isRightPlaced && (
                        <g>
                          <rect x="130" y="37" width="70" height="16" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="1.5,1.5" opacity="0.35" />
                          <line x1="130" y1="45" x2="200" y2="45" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                          {isOverRight && (
                            <rect x="130" y="37" width="70" height="16" fill="#0ea5e9" opacity="0.15" />
                          )}
                        </g>
                      )}

                      {/* FIBER CORES */}
                      {/* Left side core (Fitted when isLeftPlaced) */}
                      {isLeftPlaced && (
                        <g className="transition-all duration-1000 ease-in-out">
                          {/* Cladding thick sleeve glass */}
                          <rect 
                            x="0" 
                            y={leftY - 8} 
                            width={leftX} 
                            height="16" 
                            fill="#334155" 
                            opacity="0.5" 
                            rx="1"
                          />
                          {/* Inner Core laser light guide */}
                          <rect 
                            x="0" 
                            y={leftY - 1.5} 
                            width={leftX} 
                            height="3" 
                            fill="#06b6d4" 
                            opacity="0.95"
                            className={isSpliced && spliceStatus === "SUCCESS" ? "fill-cyan-300 shadow-md" : "fill-cyan-500"}
                          />
                        </g>
                      )}

                      {/* Right side core (Fitted when isRightPlaced) */}
                      {isRightPlaced && (
                        <g className="transition-all duration-1000 ease-in-out">
                          {/* Cladding thick sleeve */}
                          <rect 
                            x={rightX} 
                            y={rightY - 8} 
                            width={200 - rightX} 
                            height="16" 
                            fill="#334155" 
                            opacity="0.5" 
                            rx="1"
                          />
                          {/* Inner core */}
                          <rect 
                            x={rightX} 
                            y={rightY - 1.5} 
                            width={200 - rightX} 
                            height="3" 
                            fill="#06b6d4" 
                            opacity="0.95"
                            className={isSpliced && spliceStatus === "SUCCESS" ? "fill-cyan-300 shadow-md" : "fill-cyan-500"}
                          />
                        </g>
                      )}

                      {/* Laser fused weld continuous joint highlights */}
                      {isSpliced && spliceStatus === "SUCCESS" && (
                        <line 
                          x1="99" 
                          y1="40" 
                          x2="101" 
                          y2="40" 
                          stroke="#22d3ee" 
                          strokeWidth="3.5" 
                          className="animate-pulse"
                        />
                      )}

                      {/* Live mechanical arc plasma gas discharge effect */}
                      {isSplicing && (
                        <g>
                          <line x1="100" y1="28" x2="100" y2="52" stroke="#a5f3fc" strokeWidth="4" className="animate-pulse" />
                          <circle cx="100" cy="40" r="16" fill="#ffffff" className="animate-ping opacity-90" />
                          <circle cx="100" cy="40" r="10" fill="#e0f2fe" opacity="0.8" />
                        </g>
                      )}
                    </svg>

                    {/* Splicing plasma spark text overlay */}
                    {isSplicing && (
                      <div className="absolute inset-0 bg-white/70 animate-fade-out pointer-events-none flex items-center justify-center">
                        <div className="bg-cyan-950 text-cyan-300 font-bold font-mono border-2 border-cyan-400 p-2 rounded-lg text-xs tracking-widest animate-scale-in">
                          ⚡ PELEBURAN LASER PLASMA (4000V) ⚡
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Alignment screen status indicators */}
                  <div className="absolute bottom-1.5 left-2.5 right-2.5 flex justify-between text-[8px] pointer-events-none select-none z-20">
                    <span className={`${
                      !isLeftPlaced || !isRightPlaced 
                        ? "text-slate-500" 
                        : isAligned 
                          ? "text-emerald-400 font-bold" 
                          : "text-amber-500 animate-pulse font-extrabold"
                    }`}>
                      SUMBU: {!isLeftPlaced || !isRightPlaced ? "KOSONG" : isAligned ? "✓ SEJAJAR (ALIGNED)" : "⚠️ ERROR MISALIGNED"}
                    </span>
                    <span className="text-slate-500">
                      Tegangan: {isSplicing ? "4000V" : "0V"}
                    </span>
                  </div>

                </div>

                {/* Splicer Telemetry System Logs */}
                <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-900 flex flex-col justify-start min-h-[46px] font-mono text-[9px] text-slate-400 leading-snug">
                  <header className="border-b border-slate-850 pb-1 mb-1 text-[8px] text-slate-500 font-bold uppercase tracking-wider flex justify-between">
                    <span>TELEMETRI KONSOL UTAMA</span>
                    <span className="text-cyan-400 font-mono font-bold">ARC-II_SMK</span>
                  </header>
                  <div className="space-y-0.5">
                    {systemLogs.map((log, i) => (
                      <div key={i} className="truncate">
                        <span className="text-slate-600 font-bold">[{i}]</span> {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT fiber pot column (source tray for Right fiber) */}
              <div className="col-span-12 sm:col-span-3 flex flex-col justify-between bg-slate-900 border border-slate-850 rounded-xl p-2.5">
                <div className="space-y-2">
                  <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block border-b border-slate-800 pb-1 text-center">
                    Core Kanan & Kendali
                  </span>

                  {!isRightPlaced ? (
                    <div
                      draggable={!isSplicing}
                      onDragStart={(e) => handleDragStart(e, "right")}
                      onDragEnd={() => handleDragEnd("right")}
                      onClick={() => handlePlaceFiber("right")}
                      className={`p-2 rounded-lg border border-dashed text-center flex flex-col items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing transition-all ${
                        isDraggingRight 
                          ? "bg-cyan-950/50 border-cyan-400 animate-pulse text-cyan-300"
                          : "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400"
                      }`}
                      title="Sentuh & seret ke dalam monitor, atau klik untuk memasang langsung!"
                    >
                      <div className="w-6 h-1 bg-cyan-500 rounded animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                      <span className="text-[9px] font-mono font-bold uppercase select-none leading-none">
                        Drag / Klik
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold leading-none select-none">
                        Kupas Core
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/60 text-emerald-400 flex flex-col items-center justify-center gap-1">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <span className="text-[8px] font-mono font-extrabold uppercase">TERPASANG</span>
                      {!isSpliced && (
                        <button 
                          onClick={() => setIsRightPlaced(false)}
                          className="text-[7.5px] font-mono text-slate-505 hover:text-rose-400 font-bold hover:underline bg-transparent border-none mt-1 cursor-pointer"
                        >
                          [Tarik Balik]
                        </button>
                      )}
                    </div>
                  )}

                  {/* Buttons controls layout container */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    
                    {/* BUTTON A: Luruskan Sumbu alignment */}
                    <button
                      onClick={handleAlign}
                      disabled={!isLeftPlaced || !isRightPlaced || isAligned || isSplicing || isSpliced}
                      className={`w-full py-2 rounded-lg font-mono text-[9.5px] font-bold tracking-wide flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        !isLeftPlaced || !isRightPlaced
                          ? "bg-slate-950 border-transparent text-slate-600 cursor-not-allowed opacity-50"
                          : isAligned
                            ? "bg-slate-950 border-slate-850 text-slate-500 cursor-not-allowed"
                            : "bg-cyan-950/80 border-cyan-500 hover:bg-cyan-900 text-cyan-400 shadow-md active:scale-95"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isAligned ? "✓ Sumbu Lurus" : "Luruskan Sumbu"}</span>
                    </button>

                    {/* BUTTON B: SPLICER FUSION AUTOMATIC - Pulsing when ready */}
                    <button
                      onClick={handleSplice}
                      disabled={!isAligned || isSplicing || isSpliced}
                      className={`w-full py-2 rounded-lg font-mono text-[10px] font-extrabold tracking-wide flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        !isAligned || isSplicing || isSpliced
                          ? "bg-slate-950 border-transparent text-slate-600 opacity-40 cursor-not-allowed"
                          : "bg-amber-600 hover:bg-amber-500 border-amber-400 text-white shadow-lg active:scale-95 animate-pulse"
                      }`}
                      title="Sambung Laser Fusion"
                    >
                      <Zap className="w-3.5 h-3.5 animate-bounce-slow text-yellow-300" />
                      <span>SET / SPLICE</span>
                    </button>

                  </div>

                  {/* Diagnostic details box */}
                  {isSpliced && spliceStatus && (
                    <div className="mt-2 bg-slate-950 border border-slate-850 rounded-lg p-2 space-y-1.5 animate-scale-in">
                      <header className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                        Hasil Detektor Las
                      </header>
                      
                      {spliceStatus === "SUCCESS" ? (
                        <div className="space-y-1 text-left">
                          <strong className="text-[9.5px] text-emerald-400 font-mono block">
                            ✓ LOSS BAGUS! 
                          </strong>
                          <p className="text-[8.5px] text-slate-300 leading-snug">
                            Kerugian daya: <strong className="text-cyan-400 font-mono">{spliceLoss} dB</strong> (&le; 0.03 dB). Lolos standardisasi.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-left">
                          <strong className="text-[9.5px] text-rose-500 font-mono block flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            LOSS TINGGI!
                          </strong>
                          <p className="text-[8.5px] text-slate-350 leading-snug">
                            Loss: <strong className="text-rose-400 font-mono">{spliceLoss} dB</strong>. Redaman tinggi memicu drop data paket!
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* State Control helper retry */}
                <div className="pt-2 shrink-0 border-t border-slate-800 text-center">
                  {isSpliced && (
                    <button
                      onClick={handleRetry}
                      className="w-full py-1.5 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-750 transition-all font-mono text-[9px] text-slate-350 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-cyan-400" />
                      <span>Reset & Las Ulang</span>
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}
        
        {/* TAB 2: TECHNICAL SOP THEORY REVIEW */}
        {activeTab === ActiveTab.THEORY && (
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-4">
            <div className="space-y-2 border-b border-slate-800/80 pb-3">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                SOP Pengoperasian Mesin Fusion Splicer (Penyambung Serat)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Di dalam dunia Transmisi Fiber Optik/TJKT, penyambungan menggunakan busur api listrik suhu tinggi (Fusion Splicer) adalah standar mutlak guna meminimalkan kerugian (loss) transmisi data internet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
              <div className="space-y-2.5">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                  <strong className="text-cyan-300 font-mono uppercase text-[10px] block">1. Koreksi Alignment Sumbu</strong>
                  <p className="text-slate-400">
                    Splicer modern mengarahkan sejajar serat optik secara digital pada sumbu X (horizontal) dan Y (vertikal) mengandalkan sensor bayangan optik / kamera internal. Core serat single-mode yang amat tipis (9μm) diselaraskan presisi di depan mikro-elektroda.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                  <strong className="text-cyan-300 font-mono uppercase text-[10px] block">2. Siklus Arc (Pijar Api Listrik)</strong>
                  <p className="text-slate-400">
                    Ketika kancah penampang kaca bersih, mesin menembakkan lompatan listrik (arc discharge) instan 4000V. Listrik melunakkan silika serat kaca hingga mencair dan melebur dalam waktu hitungan milidetik secara halus tanpa bintik gelembung udara.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                  <strong className="text-amber-450 font-mono uppercase text-[10px] block font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Kalkulasi Redaman Maksimal (Standard Loss)
                  </strong>
                  <p className="text-slate-405">
                    Menurut standar PT Telkom Indonesia / Vokasi TJKT, batas aman redaman sambungan las yang ditolerir adalah <strong className="text-amber-400 font-mono">≤ 0.03 dB</strong> per titik splicing. Sinyal las di atas itu dinilai lemah dan rawan memicu putus koneksi di kemudian hari (drop ping packet).
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                  <strong className="text-cyan-300 font-mono uppercase text-[10px] block">3. Perawatan Elektroda Alat</strong>
                  <p className="text-slate-400">
                    Kotoran karbon mikro yang menempel pada ujung elektroda wolfram harus dibuang melalui mode &quot;Arc Clean&quot; secara berkala agar pengelasan kaca berikutnya berjalan merata tanpa penyimpangan panas busur api.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Selesaikan Modul control bar */}
      <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between items-center bg-slate-950 shrink-0">
        <p className="text-[9.5px] text-slate-500 font-mono">
          Petunjuk: Selesaikan praktikum simulator las dengan loss optimal (&le; 0.03 dB) untuk mengaktifkan tombol simpan.
        </p>

        <button
          id="btn-complete-m2"
          onClick={onComplete}
          disabled={!isCompleted && spliceStatus !== "SUCCESS"}
          className={`py-2 px-5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isCompleted || (spliceStatus === "SUCCESS")
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-[0.98]"
              : "bg-slate-900 border border-slate-800 text-slate-650 cursor-not-allowed"
          }`}
        >
          <Award className="w-4 h-4 text-emerald-300" />
          <span>{isCompleted ? "Kembali ke Dashboard (Tuntas)" : "Simpan & Tuntaskan Modul II"}</span>
        </button>
      </div>

    </div>
  );
}
