import React from "react";
import { ArrowLeft, Copyright, Globe, Award, Heart } from "lucide-react";

interface CreatorCreditsProps {
  onBack: () => void;
}

export default function CreatorCredits({ onBack }: CreatorCreditsProps) {
  return (
    <div id="creator-screen" className="flex flex-col h-full w-full p-4 text-white bg-slate-950 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            id="btn-creator-back"
            onClick={onBack}
            className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest hidden sm:inline">|</span>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Copyright className="w-4 h-4 text-cyan-400" />
            Informasi Kreator & Lisensi Hak Cipta
          </h3>
        </div>

        <div className="text-xs font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-850 text-slate-400">
          Versi: <strong className="text-cyan-400">v1.2-Standard-SMK</strong>
        </div>
      </div>

      {/* Main Credits grid layout */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch content-center pb-2">
        
        {/* Left Card: Developer Profile */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[230px] lg:min-h-[330px]">
          <div className="space-y-3 font-sans">
            <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-900 px-2.5 py-0.5 rounded tracking-wide uppercase">
              STUDENT PROFILE & TIM AKADEMIK
            </span>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-600 via-blue-700 to-indigo-800 rounded-full border-2 border-cyan-400 flex items-center justify-center font-serif text-2xl font-black text-white shadow-lg pointer-events-none select-none">
                SMK
              </div>
              
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-100 uppercase tracking-tight">TIM TIM AKADEMIK TJKT</h4>
                <p className="text-[11px] text-slate-400 font-mono">Penyusun Kurikulum & Rekayasa Perangkat Lunak</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-401 pl-0.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-450" />
                  <span>Teknik Jaringan Komputer dan Telekomunikasi</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1.5 border-t border-slate-800/60">
              Aplikasi ini didevelop secara mandiri untuk mendukung kegiatan praktikum mandiri (Lab Maya) murid-murid Fase E SMK, 
               guna melatih kecakapan motorik kerja penyambungan laser di lapangan pekerjaan transmisi telekomunikasi telepoint secara virtual.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <span>Dirakit penuh rasa</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>untuk Pendidikan Vokasi Indonesia.</span>
          </div>
        </div>

        {/* Right Card: Creative Commons CC BY-SA 4.0 License */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[230px] lg:min-h-[330px]">
          <div className="space-y-3 font-sans">
            <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-450 border border-amber-500/20 px-2.5 py-0.5 rounded tracking-wide uppercase">
              LISENSI HAK CIPTA INTERNASIONAL
            </span>

            {/* CC BY-SA 4.0 inline SVG design */}
            <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 shrink-0">
                {/* CC icon */}
                <span className="bg-white text-slate-950 font-bold px-1.5 py-0.5 rounded font-mono text-[10px]">CC</span>
                {/* BY icon */}
                <span className="bg-white text-slate-950 font-bold px-1.5 py-0.5 rounded font-mono text-[10px]">BY</span>
                {/* SA icon */}
                <span className="bg-white text-slate-950 font-bold px-1.5 py-0.5 rounded font-mono text-[10px]">SA</span>
              </div>
              <div className="text-right">
                <strong className="text-[10.5px] text-amber-400 block font-mono">CC BY-SA 4.0 License</strong>
                <span className="text-[8.5px] text-slate-450 block font-mono">Creative Commons Attribution-ShareAlike 4.0</span>
              </div>
            </div>

            <div className="text-[10.5px] text-slate-400 leading-normal space-y-1.5">
              <p>
                <strong>Atribusi-BerbagiSerupa 4.0 Internasional (CC BY-SA 4.0)</strong>
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Pengguna terhormat diizinkan membagikan, memodifikasi, dan menyebarkan kembali materi ini dalam bentuk apa pun, 
                asalkan menyertakan atribusi kredit kreator yang sesuai dan melisensikan hasil perubahan di bawah lisensi yang sama.
              </p>
            </div>
          </div>

          <div className="font-mono text-[9px] text-slate-500 text-right border-t border-slate-800/60 pt-2 shrink-0">
            Diterbitkan untuk Sayembara Lab Maya Indonesia Tahun 2026.
          </div>
        </div>

      </div>

      {/* Selesaikan Modul control bar */}
      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center bg-slate-950 shrink-0">
        <p className="text-[10px] text-slate-500 font-mono">
          © Hak Cipta Dilindungi Undang-Undang. SMK Jurusan TJKT Fase E.
        </p>

        <button
          id="btn-creator-done"
          onClick={onBack}
          className="py-2 px-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-all cursor-pointer shadow-md active:scale-98"
        >
          Kembali ke Dashboard
        </button>
      </div>

    </div>
  );
}
