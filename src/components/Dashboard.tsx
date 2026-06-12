import React from "react";
import { AppScreen, ModuleProgress } from "../types";
import { 
  BookOpen, 
  Cpu, 
  Settings, 
  LineChart, 
  Award, 
  HelpCircle, 
  ChevronRight, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  Copyright
} from "lucide-react";

interface DashboardProps {
  studentName: string;
  studentClass: string;
  progress: ModuleProgress;
  onSelectScreen: (screen: AppScreen) => void;
  onResetProgress: () => void;
  joinedAt: string;
}

export default function Dashboard({ 
  studentName, 
  studentClass, 
  progress, 
  onSelectScreen, 
  onResetProgress,
  joinedAt
}: DashboardProps) {

  const totalCompleted = [progress.m1Completed, progress.m2Completed, progress.m3Completed].filter(Boolean).length;
  const progressPercent = Math.round((totalCompleted / 3) * 100);

  const modules = [
    {
      id: AppScreen.MODULE1,
      num: "MEJA 1",
      title: "Stripping & Cleaving Lab",
      desc: "Latihan kupas jaket cladding serat kaca & pemotongan presisi 90 derajat siku dengan circular diamond cleaver.",
      duration: "15 Menit",
      status: progress.m1Completed ? "Tuntas" : "Belum Selesai",
      colorClass: progress.m1Completed 
        ? "border-emerald-800 bg-emerald-950/15 hover:bg-emerald-900/30 text-emerald-400 hover:scale-[1.03]" 
        : "border-slate-850 bg-slate-900/40 hover:border-cyan-500/80 hover:bg-cyan-950/15 text-cyan-400 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",
      isDone: progress.m1Completed,
      icon: <BookOpen className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300" />
    },
    {
      id: AppScreen.MODULE2,
      num: "MEJA 2",
      title: "Fusion Splicing",
      desc: "Proses penempatan core dalam slot V-Groove, alignment sumbu X/Y otomatis, dan tembakan listrik pijar laser.",
      duration: "25 Menit",
      status: progress.m2Completed ? "Tuntas" : "Belum Selesai",
      colorClass: progress.m2Completed 
        ? "border-emerald-800 bg-emerald-950/15 hover:bg-emerald-900/30 text-emerald-400 hover:scale-[1.03]" 
        : "border-slate-850 bg-slate-900/40 hover:border-cyan-500/80 hover:bg-cyan-950/15 text-cyan-400 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",
      isDone: progress.m2Completed,
      icon: <Cpu className="w-8 h-8 text-cyan-500 group-hover:text-cyan-300" />
    },
    {
      id: AppScreen.MODULE3,
      num: "MEJA 3",
      title: "OTDR Test",
      desc: "Pengukuran redaman cahaya koneksi, pembacaan grafik event zona mati, dan troubleshooting link FTTH putus.",
      duration: "20 Menit",
      status: progress.m3Completed ? "Tuntas" : "Belum Selesai",
      colorClass: progress.m3Completed 
        ? "border-emerald-800 bg-emerald-950/15 hover:bg-emerald-900/30 text-emerald-400 hover:scale-[1.03]" 
        : "border-slate-850 bg-slate-900/40 hover:border-cyan-500/80 hover:bg-cyan-950/15 text-cyan-400 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]",
      isDone: progress.m3Completed,
      icon: <LineChart className="w-8 h-8 text-cyan-500 group-hover:text-cyan-300" />
    }
  ];

  return (
    <div id="dashboard-screen" className="flex flex-col h-full w-full p-4 text-white bg-slate-950 relative overflow-hidden">
      
      {/* Upper stats banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between border-b border-slate-900 pb-3 mb-3.5 gap-3">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 border border-cyan-950 px-2 py-0.5 rounded">
            LOKASI: PERALATAN UTAMA LAB VOKASI
          </span>
          <h2 className="text-xl font-extrabold text-white">
            Ruang Praktik Virtual Fiber Optic
          </h2>
        </div>

        {/* User Card */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono">
            <span className="text-slate-500">PROFIL:</span>{" "}
            <span className="text-white font-bold">{studentName}</span>{" "}
            <span className="text-slate-600">({studentClass})</span>
          </div>

          <div className="bg-slate-900/85 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">{joinedAt}</span>
          </div>

          <button 
            id="btn-reset-data"
            onClick={onResetProgress}
            title="Keluar Sesi & Reset Workstation"
            className="p-1 px-2.5 rounded-lg border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-rose-950/40 active:scale-95 text-xs font-mono cursor-pointer transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch content-center min-h-0 overflow-y-auto pr-1 pb-2">
        {/* Left Side: 3 Interactive workbench desks in 2D layout representation */}
        <div className="lg:col-span-8 flex flex-col gap-3 relative">
          
          {/* Instruction & Dialog/Marquee banner row */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 space-y-1.5 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-lg pointer-events-none"></div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 animate-pulse">● INDIKATOR UTAMA:</span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-100 font-sans tracking-wide">
                "Halo calon engineer, pilih meja praktikmu!"
              </p>
            </div>

            {/* Scrolling Dialogue marquee ticker block */}
            <div className="bg-slate-950 p-1.5 rounded border border-slate-850/60 flex items-center gap-2 overflow-hidden">
              <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0 uppercase tracking-wider bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-900/30">
                INFO LAB:
              </span>
              <div className="flex-1 overflow-hidden relative w-full font-mono text-[10.5px] text-slate-350">
                <div className="animate-marquee whitespace-nowrap inline-block">
                  Pilihlah salah satu modul untuk memulai eksperimen keselamatan dan penyambungan serat optik. Selesaikan ketiga meja untuk kelulusan ujian kompetensi keahlian.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 2D Workstations layout Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                id={`module-card-${idx + 1}`}
                onClick={() => onSelectScreen(m.id)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-300 ${m.colorClass} group`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <span className="font-mono text-[9px] bg-cyan-900/20 px-2 py-0.5 rounded text-cyan-400 font-extrabold uppercase tracking-widest border border-cyan-800/20">
                      {m.num}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      m.isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/10 text-cyan-400"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${m.isDone ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`}></span>
                      {m.status}
                    </span>
                  </div>

                  {/* 2D Isometric Bench Icon Visual representation */}
                  <div className="h-16 w-full rounded-lg bg-slate-950/80 border border-slate-900 flex items-center justify-center relative overflow-hidden select-none">
                    {/* Isometric Vector Backdrop of Workspace */}
                    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 60">
                      {/* Grid lines */}
                      <path d="M 0 10 L 100 40 M 0 25 L 100 55 M 0 40 L 100 70" stroke="#0891b2" strokeWidth="0.2" fill="none" />
                      <path d="M 10 0 L 10 60 M 40 0 L 40 60 M 75 0 L 75 60" stroke="#0891b2" strokeWidth="0.2" fill="none" />
                      {/* Stand base table representation */}
                      <polygon points="20,40 80,40 90,52 10,52" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
                      <line x1="20" y1="40" x2="20" y2="58" stroke="#334155" strokeWidth="0.5" />
                      <line x1="80" y1="40" x2="80" y2="58" stroke="#334155" strokeWidth="0.5" />
                    </svg>

                    <div className="z-10 flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
                      {m.icon}
                      <span className="text-[10px] font-mono text-cyan-400 font-bold mt-1 tracking-wider">
                        MASUK EKSPERIMEN
                      </span>
                    </div>

                    <div className="absolute top-1 right-1 opacity-10 group-hover:opacity-40 transition-opacity">
                      <span className="text-white text-[8px] font-mono">[VIRTUAL DESK]</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {m.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>WAKTU LATIHAN: {m.duration}</span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center font-bold">
                    Menu Meja <ChevronRight className="w-3.5 h-3.5 mt-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Side: Evaluasi Desk / Stats */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 pl-1">
            Uji Kompetensi Keahlian
          </h3>

          <div className="bg-slate-900/90 border border-slate-805 rounded-xl p-3.5 flex flex-col justify-between flex-1 relative overflow-hidden box-cyan">
            {/* Embedded abstract geometric background */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="space-y-2.5 z-10">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  FINAL EVALUASI KOORDINASI
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Standar KKM: 80%</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-amber-500/20 to-blue-500/5 rounded-lg text-amber-400 shrink-0">
                  <Award className="w-6.5 h-6.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-100">Ujian Teori & Kasus Lapangan</h4>
                  <p className="text-[10px] text-slate-400 leading-tight">Evaluasi pemahaman instalasi serat optik SMK TJKT.</p>
                </div>
              </div>

              {/* Progress metrics */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-slate-400">Pekerjaan Modul:</span>
                  <span className="text-cyan-400 font-bold">{totalCompleted} / 3 Selesai ({progressPercent}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {progress.quizCompleted && (
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-850/60 font-mono text-[9px] flex items-center justify-between leading-tight">
                  <span className="text-slate-450">Skor Terakhir Ujian:</span>
                  <strong className={progress.quizScore >= 80 ? "text-emerald-400" : "text-rose-450"}>
                    {progress.quizScore}% ({progress.quizScore >= 80 ? "KOMPETEN" : "BELUM KOMPETEN"})
                  </strong>
                </div>
              )}
            </div>

            <button
              id="btn-goto-evaluation"
              onClick={() => onSelectScreen(AppScreen.EVALUATION)}
              className="w-full mt-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs tracking-wide transition-all shadow-lg active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{progress.quizCompleted ? "Ulangi Uji Kompetensi" : "Mulai Uji Kompetensi"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lab Console Status footer bar */}
      <div className="mt-4 pt-3 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-950 text-slate-400 font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SIAP_KERJA
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">STANDAR INDUSTRI: FTTH ITU-T G.652D</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            id="btn-goto-creator"
            onClick={() => onSelectScreen(AppScreen.CREATOR)}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 border-r border-slate-850 pr-3 cursor-pointer"
          >
            <Copyright className="w-3.5 h-3.5" />
            <span>Kreator & Lisensi</span>
          </button>

          <span className="text-slate-600">SMK Pusat Keunggulan</span>
        </div>
      </div>
    </div>
  );
}
