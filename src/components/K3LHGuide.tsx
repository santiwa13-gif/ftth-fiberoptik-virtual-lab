import React, { useState } from "react";
import { ShieldAlert, CheckCircle, EyeOff, Trash2, Flame, Zap, ArrowRight, ShieldCheck } from "lucide-react";

interface K3LHGuideProps {
  onContinue: () => void;
  studentName: string;
}

export default function K3LHGuide({ onContinue, studentName }: K3LHGuideProps) {
  // Tracker for the four rules being agreed to
  const [agreed, setAgreed] = useState<boolean[]>([false, false, false, false]);

  const toggleAgree = (index: number) => {
    const updated = [...agreed];
    updated[index] = !updated[index];
    setAgreed(updated);
  };

  const allAgreed = agreed.every(v => v === true);

  const rules = [
    {
      title: "1. Perlindungan Retina dari Bahaya Laser Inframerah",
      description: "Panjang gelombang cahaya yang digunakan dalam sistem FTTH (1310nm, 1490nm, 1550nm) berada pada spektrum inframerah dekat yang tidak kasat mata (invisible). Menatap langsung ke ujung serat yang aktif dapat membakar jaringan retina mata tanpa menimbulkan rasa sakit seketika.",
      safetyTip: "DILARANG MELIHAT LANGSUNG ke arah lubang adaptor optik, ujung pigtail, maupun patchcord sebelum memastikan laser transmitter dalam kondisi mati total.",
      icon: <EyeOff className="w-6 h-6 text-rose-500" />,
      actionLabel: "Saya paham bahaya laser tak terlihat & berjanji untuk tidak menatap langsung"
    },
    {
      title: "2. Penanganan Serpihan Pecahan Kaca (Glass Core Shards)",
      description: "Casing pelindung yang kita kupas menyisakan core kaca transparan yang sangat tipis (diameter 125 mikron, mirip rambut manusia). Serpihan kecil sisa pemotongan cleaver tidak berwarna, sangat tajam, kaku, dan mudah menembus pori-pori kulit.",
      safetyTip: "Jangan buang pecahan core ke lantai. Selalu gunakan lakban/tape untuk memungut pecahan kaca, kemudian masukkan langsung ke wadah tertutup (Disposal Vessel). Dilarang menyentuh serpihan kaca langsung!",
      icon: <Trash2 className="w-6 h-6 text-rose-500" />,
      actionLabel: "Saya paham pembuangan limbah core kaca & berjanji memakai disposal vessel"
    },
    {
      title: "3. Penanganan Cairan Cair Isopropyl Alcohol 99% (Sakit & Mudah Menguap)",
      description: "Alkohol berkadar tinggi 99% digunakan untuk mensterilkan core dari sisa-sisa gel coating agar pembacaan loss sambungan minimal. Karakteristik alkohol ini sangat mudah menguap, mudah terbakar, dan dapat mengiritasi pernafasan.",
      safetyTip: "Selalu tutup botol alkohol otomatis (one-touch pump dispenser) segera setelah digunakan. Lakukan sterilisasi fiber di area dengan sirkulasi udara yang baik, jauh dari sumber cipratan api.",
      icon: <Flame className="w-6 h-6 text-rose-500" />,
      actionLabel: "Saya paham sifat mudah terbakar Isopropyl Alcohol & berjanji selalu menutup botol"
    },
    {
      title: "4. Tegangan Elektroda Splicer (Arc Discharge)",
      description: "Fusion Splicer menggunakan elektroda wolfram untuk melepaskan tegangan tinggi berupa busur api listrik (arc discharge) sebesar 2000-5000 Volt guna meleburkan dua ujung core kaca bersama-sama.",
      safetyTip: "Jangan pernah membuka penutup pelindung angin (wind protector) atau memasukkan jari ke ruang elektroda saat proses sambung (splicing) berlangsung untuk menghindari bahaya sengatan listrik bertegangan tinggi.",
      icon: <Zap className="w-6 h-6 text-rose-500" />,
      actionLabel: "Saya paham bahaya tegangan tinggi elektroda & berjanji menjaga wind protector tetap tertutup"
    }
  ];

  return (
    <div id="k3lh-screen" className="flex flex-col h-full w-full p-5 text-white bg-slate-950 relative overflow-hidden">
      {/* Decorative safety background glow */}
      <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-rose-950/10 to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-4 mb-4 gap-3">
        <div>
          <span className="text-[10px] bg-rose-950/80 text-rose-400 border border-rose-900 px-2.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
            PROTOKOL WAJIB LAB K3LH
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            Aturan Keselamatan & Kesehatan Kerja Serat Optik
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
          <span>Operator:</span>
          <strong className="text-cyan-400">{studentName}</strong>
        </div>
      </div>

      {/* Body content: Scrollable area for rules */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 pb-2">
        <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 text-xs md:text-sm text-amber-200/90 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>PERHATIAN TARUNA JURUSAN TJKT!</strong> Pekerjaan penyambungan serat optik melibatkan material kaca berdiameter mikro dan radiasi infra merah yang berbahaya bagi tubuh manusia. Anda tidak diizinkan masuk ke ruang Lab Virtual sebelum memahami dan menyetujui seluruh pakta keselamatan berikut.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, idx) => (
            <div 
              key={idx} 
              id={`k3lh-rule-${idx}`}
              className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between gap-3 ${
                agreed[idx] 
                  ? "bg-emerald-950/20 border-emerald-800/60 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
                  <div className={`p-1.5 rounded-lg ${agreed[idx] ? "bg-emerald-950 text-emerald-400" : "bg-slate-950 text-rose-500"}`}>
                    {agreed[idx] ? <CheckCircle className="w-5 h-5" /> : rule.icon}
                  </div>
                  <h4 className={`font-bold ${agreed[idx] ? "text-emerald-400" : "text-white"}`}>{rule.title}</h4>
                </div>
                <p className="text-slate-400 leading-relaxed">{rule.description}</p>
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
                  <span className="font-semibold text-rose-400">Instruksi Guru: </span>
                  {rule.safetyTip}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  id={`agree-checkbox-${idx}`}
                  onClick={() => toggleAgree(idx)}
                  className={`w-full py-2 px-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer ${
                    agreed[idx]
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-950 hover:bg-slate-900 text-slate-350 border border-slate-850 hover:border-slate-700"
                  }`}
                >
                  <input 
                    id={`native-checkbox-${idx}`}
                    type="checkbox" 
                    checked={agreed[idx]} 
                    onChange={() => {}} // handled by button click
                    className="accent-emerald-500 h-3.5 w-3.5 rounded cursor-pointer pointer-events-none"
                  />
                  <span>{agreed[idx] ? "Disetujui ✓" : "Saya Mengerti & Siap Patuh"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-4 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 z-20">
        <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
          <span>Persetujuan: </span>
          <span className="font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            {agreed.filter(x => x).length} dari 4 Selesai
          </span>
        </div>

        <button
          id="btn-agree-continue"
          onClick={onContinue}
          disabled={!allAgreed}
          className={`w-full sm:w-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
            allAgreed
              ? "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/10 active:scale-98"
              : "bg-slate-900 text-slate-600 border border-slate-800/80 cursor-not-allowed"
          }`}
        >
          <span>Lanjut Masuk Ruang Lab Virtual</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
