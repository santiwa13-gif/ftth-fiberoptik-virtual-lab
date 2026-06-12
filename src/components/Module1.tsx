import React, { useState, useEffect } from "react";
import { AppScreen } from "../types";
import { 
  ArrowLeft, 
  BookOpen, 
  Check, 
  Info, 
  Award, 
  Scissors, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Trash2,
  Sliders,
  Maximize2
} from "lucide-react";

interface Module1Props {
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

enum ActiveTab {
  THEORY = "THEORY",
  PRACTICE = "PRACTICE"
}

export default function Module1({ onBack, onComplete, isCompleted }: Module1Props) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.PRACTICE);

  // --- Theory Tab State ---
  const [selectedTool, setSelectedTool] = useState<number>(0);
  const [viewedTools, setViewedTools] = useState<boolean[]>(Array(10).fill(false));
  const [answers, setAnswers] = useState<number[]>(Array(3).fill(-1));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  // --- Practice Tab / Simulator State ---
  // simStep guide:
  // 1: Ready to strip - need to drag stripper to cable.
  // 2: Stripping animation or success - bare core exposed.
  // 3: Bare fiber ready to be dragged/clicked into Cleaver.
  // 4: Splice cleaver calibration - needle oscillates, click "POTONG".
  // 5: Outcome evaluation (Success or Failure).
  const [simStep, setSimStep] = useState<number>(1);
  const [isStripped, setIsStripped] = useState(false);
  const [isLoadedInCleaver, setIsLoadedInCleaver] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(15);
  const [isSpanning, setIsSpanning] = useState(true);
  const [cleavedAngle, setCleavedAngle] = useState<number | null>(null);
  const [cleaveResult, setCleaveResult] = useState<"SUCCESS" | "FAILED" | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [simCompleted, setSimCompleted] = useState(false);

  // Initialize first tool as viewed
  useEffect(() => {
    setViewedTools(prev => {
      const copy = [...prev];
      copy[0] = true;
      return copy;
    });
  }, []);

  // Gauge animation loop for step 4
  useEffect(() => {
    if (simStep !== 4 || !isSpanning) return;
    
    let direction = 1;
    const interval = setInterval(() => {
      setGaugeValue(prev => {
        let next = prev + direction * 5;
        if (next >= 95) {
          next = 95;
          direction = -1;
        } else if (next <= 5) {
          next = 5;
          direction = 1;
        }
        return next;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [simStep, isSpanning]);

  const tools = [
    {
      name: "Fusion Splicer",
      localName: "Penyambung Serat Optik",
      function: "Melakukan fusi atau penyambungan peleburan ujung dua inti serat kaca serat optik (core) secara otomatis menggunakan busur api listrik bertegangan tinggi, menghasilkan sambungan permanen dengan redaman yang sangat rendah (ideal <0.03 dB).",
      caution: "Jangan membuka penutup debu/penutup angin saat mesin sedang melepaskan pijar listrik. Elektroda dapat menyengat jari Anda!",
      specs: "Alignment type: Active Core / Cladding, Arc voltage: ~4000V, Splice loss: 0.01 - 0.05 dB",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="25" y="15" width="50" height="50" rx="4" fill="#020617" />
          <rect x="35" y="5" width="30" height="10" rx="1" fill="#1e293b" />
          <path d="M40 37 L46 37 M54 37 L60 37" strokeWidth="3" stroke="#ef4444" />
          <circle cx="50" cy="37" r="1.5" fill="#38bdf8" stroke="none" />
          <circle cx="50" cy="37" r="5" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
          <rect x="33" y="47" width="34" height="12" rx="2" fill="#0f172a" />
          <text x="50" y="55" textAnchor="middle" fontSize="6" fill="#22d3ee" stroke="none" fontFamily="monospace">LCD CONNECTED</text>
        </svg>
      )
    },
    {
      name: "Fiber Stripper (Miller)",
      localName: "Tang Pengupas Core",
      function: "Alat pengupas khusus untuk mengupas selongsong isolasi kabel primer (outer jacket), buffer coating (pelindung berwarna), hingga menyisakan lapisan kaca tipis (core & cladding) berukuran diameter 125 mikron tanpa menggores atau mematahkannya.",
      caution: "Ada 3 mata pisau ukurannya berbeda. Pengupasan serat tipis wajib menggunakan lubang terkecil paling ujung agar core kaca tidak patah.",
      specs: "Sizes: 3-hole mechanism (1.6-3mm jacket -> 900μm buffer -> 250μm coating -> 125μm glass)",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M25 60 C35 45, 45 40, 50 40 C45 40, 35 35, 25 20 M75 60 C65 45, 55 40, 50 40" />
          <circle cx="50" cy="40" r="2.5" fill="#1e293b" />
          <path d="M49 34 L51 34 M48 31 L52 31 M47 28 L53 28" />
          <path d="M20 65 L35 55 M80 65 L65 55" strokeWidth="4" />
        </svg>
      )
    },
    {
      name: "Fiber Cleaver",
      localName: "Alat Pemotong Core Kaca",
      function: "Alat mekanis presisi tinggi untuk memotong ujung core kaca serat optik yang sudah dikupas dan dibersihkan dari coatingnya. Pemotong cleaver menghasilkan sudut potong siku sempurna (hampir 90 derajat) agar sambungan fusi tidak memantulkan laser.",
      caution: "Jangan menyentuh mata pisau silinder baja di dalam cleaver. Pemotong ini sangat tajam dan presisi micro-inch.",
      specs: "Cleave angle: <0.5 degrees, Blade lifetime: 48,000 cleaves, Fiber diameter: 125μm",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="30" y="25" width="40" height="30" rx="3" fill="#020617" />
          <rect x="35" y="15" width="30" height="10" rx="2" fill="#1e293b" />
          <circle cx="50" cy="40" r="6" fill="#1e293b" stroke="#ef4444" />
          <path d="M44 40 L56 40" strokeWidth="1.5" />
          <path d="M50 15 L50 25" />
        </svg>
      )
    },
    {
      name: "OPM (Optical Power Meter)",
      localName: "Alat Ukur Intensitas Cahaya",
      function: "Alat pengukur kekuatan daya sinyal optik yang merambat di dalam kabel fiber optik, ditampilkan dalam satuan dBm (daya logaritmik relatif terhadap 1 miliwatt) atau dB (redaman). Digunakan untuk validasi kualitas penerimaan sinyal pelanggan.",
      caution: "Lindungi sensor fotodioda OPM dari debu atau cairan. Selalu pasang penutup karet jika dilepas dari port adaptor.",
      specs: "Wavelength range: 850 - 1625 nm, Measurement range: -70 to +10 dBm, Unit: dBm, dB, mW",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="35" y="10" width="30" height="60" rx="5" fill="#020617" />
          <rect x="40" y="18" width="20" height="15" rx="1" fill="#0f172a" />
          <text x="50" y="27" textAnchor="middle" fontSize="6" fill="#10b981" stroke="none" fontFamily="monospace">-19.50 dBm</text>
          <circle cx="50" cy="40" r="3" fill="#1e293b" />
          <circle cx="45" cy="48" r="2.5" fill="#1e293b" />
          <circle cx="55" cy="48" r="2.5" fill="#1e293b" />
          <circle cx="50" cy="56" r="2.5" fill="#1e293b" />
        </svg>
      )
    },
    {
      name: "VFL (Visual Fault Locator)",
      localName: "Senter Laser Merah",
      function: "Alat pengirim cahaya laser visible (terlihat) warna merah terang dengan panjang gelombang 650nm. Sangat berguna untuk menguji kontinuitas kabel core secara visual, serta melacak kebocoran laser akibat pembengkokan tajam (macrobend) atau core retak.",
      caution: "Jangan menatap langsung ke sumber cahaya laser merah VFL karena dapat melukai mata secara serius dalam sekejap.",
      specs: "Wavelength: 650nm, Output power: 10 - 30 mW, Laser class: Class IIIb, Range: 10-15 KM",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="42" y="15" width="16" height="50" rx="3" fill="#020617" />
          <path d="M50 15 L50 5" stroke="#f43f5e" strokeWidth="3" />
          <path d="M50 5 L44 8 M50 5 L56 8" stroke="#f43f5e" strokeWidth="2" />
          <rect x="46" y="25" width="8" height="8" fill="#1e293b" />
        </svg>
      )
    },
    {
      name: "Protection Sleeve",
      localName: "Selongsong Pelindung Sambungan",
      function: "Tabung plastic kecil menyusut panas (heat shrink tubing) yang di dalamnya disisipi sebatang silinder baja kaku. Digunakan untuk membungkus area sambungan core serat kaca pasca fusion splicing, melindunginya dari pembelokan atau kelembaban udara luar.",
      caution: "Harus dipasang dimasukkan ke salah satu ujung core fiber SEBELUM fusi atau pengelasan silinder dilepaskan.",
      specs: "Length: 60mm / 40mm, Steel diameter: 1.0 - 1.5mm, Material: Polyolefin cross-linked",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="36" width="60" height="8" rx="2" fill="#020617" strokeDasharray="3,1" />
          <line x1="15" y1="40" x2="85" y2="40" stroke="#10b981" strokeWidth="1" />
          <rect x="25" y="39" width="50" height="2" fill="#94a3b8" stroke="none" />
        </svg>
      )
    },
    {
      name: "OTDR",
      localName: "Optical Time Domain Reflectometer",
      function: "Instrumen optoelektronik diagnostik komprehensif yang menginjeksikan pulsa laser cahaya ke dalam jaringan serat optik dan menganalisis pantulan balik. Berfungsi mengidentifikasi sambungan bermasalah, bengkokan, redaman konektor, dan titik patah fisik.",
      caution: "TIDAK Boleh dinyalakan pada kabel serat optik yang masih aktif dialiri laser internet dari OLT atau ONT aktif.",
      specs: "Dynamic range: 32 - 45 dB, Wavelength: 1310/1495/1550nm, Event dead-zone: <1m",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="15" width="60" height="50" rx="3" fill="#020617" />
          <rect x="25" y="22" width="40" height="25" fill="#0f172a" />
          <path d="M28 42 L35 42 L42 27 L46 45 L58 45 L62 47" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="71" cy="27" r="2.5" fill="#1e293b" />
          <circle cx="71" cy="35" r="2.5" fill="#1e293b" />
          <circle cx="71" cy="43" r="2.5" fill="#1e293b" />
          <circle cx="71" cy="51" r="2.5" fill="#1e293b" />
        </svg>
      )
    },
    {
      name: "Drop Cable (1-Core)",
      localName: "Kabel Udara Dropping",
      function: "Kabel udara drop core bertipe G.657 yang merupakan kabel penghubung dari Optical Distribution Point (ODP) di tiang menuju ke rumah pelanggan (Roset). Memiliki kawat penggantung baja kaku (messenger wire) sebagai penyangga mekanis penarik tegangan tiang.",
      caution: "Meskipun tipe G.657 tahan tekukan (bend-insensitive), pembengkokan kabel drop dengan diameter ditekuk kurang dari 3 cm dapat patah permanen.",
      specs: "Core type: Single-mode ITU-T G.657A, Messenger material: Steel wire, Jacket: LSZH (Low Smoke Zero Halogen)",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="40" r="15" fill="#020617" />
          <circle cx="42" cy="40" r="4" fill="#94a3b8" stroke="none" />
          <circle cx="58" cy="40" r="4" fill="#94a3b8" stroke="none" />
          <circle cx="50" cy="33" r="2" fill="#ef4444" stroke="none" />
          <circle cx="50" cy="47" r="1" fill="#38bdf8" stroke="none" />
        </svg>
      )
    },
    {
      name: "ODP",
      localName: "Optical Distribution Point",
      function: "Kotak distribusi luar ruangan (biasanya dipasang di tiang telepon atau dinding) yang menampung unit PLC splitter pembagi sinyal optis dari kabel distribusi utama, didistribusikan ke konektor drop cable pelanggan.",
      caution: "ODP dilarang dibiarkan terbuka setelah pekerjaan instalasi selesai agar tidak kemasukan sarang semut atau cipratan air hujan.",
      specs: "Capacity: 8 or 16 ports, Splitter ratio: 1:8 / 1:16 PLC, Protection rating: IP65 weather proof",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="30" y="15" width="40" height="50" rx="3" fill="#020617" />
          <path d="M30 25 L70 25 M30 35 L70 35" strokeWidth="1" />
          <circle cx="40" cy="45" r="2" fill="#10b981" stroke="none" />
          <circle cx="50" cy="45" r="2" fill="#10b981" stroke="none" />
          <circle cx="60" cy="45" r="2" fill="#10b981" stroke="none" />
          <circle cx="40" cy="55" r="2" fill="#10b981" stroke="none" />
          <circle cx="50" cy="55" r="2" fill="#10b981" stroke="none" />
          <circle cx="60" cy="55" r="2" fill="#10b981" stroke="none" />
        </svg>
      )
    },
    {
      name: "Roset Optik",
      localName: "Kotak Terminasi Pelanggan",
      function: "Kotak terminasi akhir (outlet box) berukuran kecil yang dipasang pada dinding di dalam rumah pelanggan yang berfungsi untuk menghubungkan kabel drop- core dengan perangkat modem/ONU (ONT) melalui kabel patchcord.",
      caution: "Sering menjadi titik kerusakan jika connector di dalam roset kotor atau tertekuk tajam oleh perabotan warga.",
      specs: "Capacity: 1 - 2 SC-APC port, Install type: Wall mounted indoor, Size: 86mm x 86mm",
      svg: (
        <svg viewBox="0 0 100 80" className="w-full h-full text-cyan-400 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="32" y="20" width="36" height="40" rx="4" fill="#020617" />
          <rect x="42" y="55" width="16" height="10" rx="1" fill="#1e293b" />
          <path d="M42 60 L58 60" stroke="#22d3ee" strokeWidth="2" />
          <circle cx="50" cy="35" r="6" stroke="#94a3b8" />
        </svg>
      )
    }
  ];

  const handleSelectTool = (idx: number) => {
    setSelectedTool(idx);
    setViewedTools(prev => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    const updated = [...answers];
    updated[qIdx] = optIdx;
    setAnswers(updated);
  };

  const checkQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);
    const isCorrect = answers[0] === 0 && answers[1] === 2 && answers[2] === 1;
    setQuizSuccess(isCorrect);
  };

  const totalViewed = viewedTools.filter(Boolean).length;
  const isTheoryEligible = totalViewed >= 5 && quizSuccess;

  // --- Simulator Actions ---
  
  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    e.dataTransfer.setData("toolId", toolId);
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    setIsDraggingOver(zoneId);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(null);
  };

  const handleDrop = (e: React.DragEvent, targetZone: string) => {
    e.preventDefault();
    setIsDraggingOver(null);
    const draggedToolId = e.dataTransfer.getData("toolId");

    if (targetZone === "cable" && draggedToolId === "miller-stripper") {
      triggerStripAction();
    } else if (targetZone === "cleaver" && draggedToolId === "stripped-fiber") {
      triggerLoadCleaverAction();
    }
  };

  // Click-to-Apply Actions (For accessibility & fallback mobile frames)
  const triggerStripAction = () => {
    setIsStripped(true);
    setSimStep(2); // shows animation and moves to next step
    
    // Auto progress to Step 3 (bare core ready) after 1.8 seconds of fun visual animation
    setTimeout(() => {
      setSimStep(3);
    }, 1800);
  };

  const triggerLoadCleaverAction = () => {
    setIsLoadedInCleaver(true);
    setSimStep(4); // gauge active
  };

  // Perform active Cleave cut
  const triggerCleaveCut = () => {
    setIsSpanning(false);
    
    // Determine precision based on gaugeValue
    // Center of gauge is 50. High precision is 40 - 60
    const distanceToCenter = Math.abs(gaugeValue - 50);
    
    if (distanceToCenter <= 9) {
      // SUCCESS! High precision
      const deviationAngle = parseFloat((0.1 + (distanceToCenter / 20) * 0.3).toFixed(2));
      setCleavedAngle(deviationAngle);
      setCleaveResult("SUCCESS");
      setSimCompleted(true);
      setSimStep(5);
    } else {
      // FAILED! Cacat
      const badAngle = parseFloat((1.2 + distanceToCenter / 10).toFixed(1));
      setCleavedAngle(badAngle);
      setCleaveResult("FAILED");
      setSimStep(5);
    }
  };

  const handleRestartCleaving = () => {
    setCleaveResult(null);
    setCleavedAngle(null);
    setIsSpanning(true);
    setGaugeValue(15);
    setSimStep(4); // go back to calibrating
  };

  const handleResetEntireSimulator = () => {
    setSimStep(1);
    setIsStripped(false);
    setIsLoadedInCleaver(false);
    setIsSpanning(true);
    setGaugeValue(15);
    setCleavedAngle(null);
    setCleaveResult(null);
    setIsDraggingOver(null);
  };

  // Overall check for completion
  const isEligibleToComplete = isCompleted || simCompleted || isTheoryEligible;

  return (
    <div id="module1-screen" className="flex flex-col h-full w-full p-4 text-white bg-slate-950 relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2.5 mb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <button
            id="btn-m1-back"
            onClick={onBack}
            className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          
          <span className="text-[10px] text-slate-500 font-mono tracking-widest hidden sm:inline">|</span>
          
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400 animate-pulse-slow" />
            <span>Modul I: Stripping & Cleaving Core</span>
          </h3>
        </div>

        {/* Tab Switcher - Elegantly Designed */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-0.5 rounded-lg border border-slate-850">
          <button
            id="tab-practice-btn"
            onClick={() => setActiveTab(ActiveTab.PRACTICE)}
            className={`px-3 py-1 text-[10.5px] rounded-md font-mono flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === ActiveTab.PRACTICE
                ? "bg-cyan-650 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Lab Praktik</span>
          </button>

          <button
            id="tab-theory-btn"
            onClick={() => setActiveTab(ActiveTab.THEORY)}
            className={`px-3 py-1 text-[10.5px] rounded-md font-mono flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === ActiveTab.THEORY
                ? "bg-cyan-650 text-white shadow-sm font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Review Alat & Kuis</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Workspace area - aspect constraint adjusted dynamically */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-2">
        
        {/* =========================================================================
             LAB PRAKTIK TAB (The interactive simulation requested by user)
            ========================================================================= */}
        {activeTab === ActiveTab.PRACTICE && (
          <div className="space-y-3">
            
            {/* Top Instructional banner */}
            <div className="bg-slate-900 border border-slate-850 px-3.5 py-2.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-inner">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono tracking-wider font-bold text-cyan-400 uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                  PANDUAN PRAKTIK MANDIRI
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  Langkah 1 dari 4: Kupas dan Potong Core Fiber Optik dengan Presisi!
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {simCompleted && (
                  <div className="bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10.5px] text-emerald-400 font-mono animate-bounce-slow">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-900/20" />
                    <span>SELESAI ✓</span>
                  </div>
                )}
                
                <button
                  onClick={handleResetEntireSimulator}
                  title="Reset Simulator"
                  className="p-1.5 px-3 rounded bg-slate-950 border border-slate-800 hover:border-slate-750 hover:bg-slate-900 transition-colors cursor-pointer text-[10.5px] font-mono text-slate-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Mulai Ulang</span>
                </button>
              </div>
            </div>

            {/* Simulated Stage & Utilities */}
            <div id="sim-workspace" className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              
              {/* Left Toolbox Rack (Tools container) */}
              <div className="md:col-span-3 bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block mb-2 pb-1 border-b border-slate-850">
                    KOTAK PERALATAN
                  </span>

                  {/* MILLER STRIPPER TOOL (Draggable on step 1) */}
                  <div className="space-y-2">
                    <div
                      id="stripper-drag"
                      draggable={simStep === 1}
                      onDragStart={(e) => handleDragStart(e, "miller-stripper")}
                      className={`relative rounded-lg p-2 border flex flex-col items-center justify-center transition-all ${
                        simStep === 1
                          ? "bg-slate-950/80 border-cyan-500/60 hover:bg-slate-900 cursor-grab active:cursor-grabbing hover:shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                          : "bg-slate-900/20 border-slate-900 text-slate-500 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {/* Visual instructions for drag */}
                      {simStep === 1 && (
                        <span className="absolute top-1 right-1 text-[8px] px-1 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-md animate-pulse">
                          DRAG ME
                        </span>
                      )}
                      
                      <div className="w-12 h-12 text-yellow-500 flex items-center justify-center">
                        <svg viewBox="0 0 100 80" className="w-full h-full fill-none stroke-current" strokeWidth="3" strokeLinecap="round">
                          <rect x="20" y="55" width="22" height="15" rx="3" fill="#facc15" stroke="none" />
                          <rect x="58" y="55" width="22" height="15" rx="3" fill="#facc15" stroke="none" />
                          <path d="M30 55 L35 40 M70 55 L65 40" stroke="#facc15" strokeWidth="4" />
                          <path d="M35 40 L45 32 L47 36 L35 40" fill="#334155" />
                          <path d="M65 40 L55 32 L53 36 L65 40" fill="#334155" />
                          <circle cx="50" cy="35" r="4" fill="#0f172a" />
                        </svg>
                      </div>

                      <strong className="text-[10px] text-yellow-400 font-mono block mt-1">Stripper Miller</strong>
                      <span className="text-[8.5px] text-slate-400 text-center font-sans tracking-tight">Kupas isolasi buffer</span>

                      {/* Click Fallback for Step 1 */}
                      {simStep === 1 && (
                        <button
                          onClick={triggerStripAction}
                          className="w-full mt-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 font-mono text-[9px] rounded border border-cyan-800 tracking-wide transition-all uppercase cursor-pointer"
                        >
                          Klik Kupas Kabel
                        </button>
                      )}
                    </div>

                    {/* CORE GLASS FIBER (Draggable on step 3) */}
                    <div
                      id="fiber-drag"
                      draggable={simStep === 3}
                      onDragStart={(e) => handleDragStart(e, "stripped-fiber")}
                      className={`relative rounded-lg p-2 border flex flex-col items-center justify-center transition-all ${
                        simStep === 3
                          ? "bg-slate-950/80 border-amber-500/60 hover:bg-slate-900 cursor-grab active:cursor-grabbing hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          : "bg-slate-900/20 border-slate-900 text-slate-500 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {simStep === 3 && (
                        <span className="absolute top-1 right-1 text-[8px] px-1 bg-amber-950 border border-amber-800 text-amber-400 rounded-md animate-pulse">
                          DRAG ME
                        </span>
                      )}

                      <div className="w-14 h-10 flex items-center justify-center">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full relative overflow-visible">
                          <div className="absolute right-0 top-0 h-1.5 w-6 bg-cyan-400 opacity-60 rounded-r-full"></div>
                          {/* Fine glass cladding */}
                          <div className="absolute -right-5 top-[1.5px] w-5 h-0.5 bg-amber-300 animate-pulse"></div>
                        </div>
                      </div>

                      <strong className="text-[10px] text-amber-400 font-mono block">Core Kaca Kupas</strong>
                      <span className="text-[8.5px] text-slate-400 text-center font-sans">Glass Cladding diameter 125μm</span>

                      {/* Click Fallback for Step 3 */}
                      {simStep === 3 && (
                        <button
                          onClick={triggerLoadCleaverAction}
                          className="w-full mt-2 py-1 bg-amber-950 hover:bg-amber-900 text-amber-400 font-mono text-[9px] rounded border border-amber-800 tracking-wide transition-all uppercase cursor-pointer"
                        >
                          Slot ke Cleaver
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-500 leading-normal border-t border-slate-850 pt-2 shrink-0">
                  ⚠️ Tips: Gunakan mouse drag untuk menggeser alat ke target, atau tekan tombol pintasan yang disediakan.
                </div>
              </div>

              {/* Center Stage Panel (Interaction Area) */}
              <div className="md:col-span-9 bg-slate-900/20 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
                
                {/* Dynamically Render steps */}
                <div className="flex-1 flex flex-col justify-center">
                  
                  {/* STEP 1: Dropping target for Stripper */}
                  {simStep === 1 && (
                    <div 
                      id="cable-target"
                      onDragOver={(e) => handleDragOver(e, "cable")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "cable")}
                      className={`h-[155px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all relative ${
                        isDraggingOver === "cable" 
                          ? "border-cyan-400 bg-cyan-950/20 scale-[1.01]" 
                          : "border-slate-800 bg-slate-950/40"
                      }`}
                    >
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                        <span>TARGET KUPAS (BUMI DROP CABLE)</span>
                      </div>

                      {/* Kabel drop core illustration SVG */}
                      <div className="w-[180px] h-[75px] relative pointer-events-none select-none flex items-center justify-center">
                        <svg viewBox="0 0 100 40" className="w-full h-full text-slate-600 stroke-current" fill="none" strokeWidth="2">
                          {/* Messenger wire */}
                          <line x1="0" y1="12" x2="100" y2="12" stroke="#475569" strokeWidth="2" />
                          {/* Inner cable body */}
                          <rect x="0" y="16" width="100" height="12" fill="#0f172a" stroke="#1e293b" />
                          {/* Clamping center */}
                          <line x1="0" y1="22" x2="100" y2="22" stroke="#d97706" strokeWidth="1" />
                        </svg>
                      </div>

                      <p className="text-[10.5px] text-slate-350 text-center mt-2">
                        Geser tab <strong className="text-cyan-400">Stripper Miller</strong> dari Kotak Peralatan ke sini untuk mengupas selongsong primer kabel udara.
                      </p>
                    </div>
                  )}

                  {/* STEP 2: Stripping animation state */}
                  {simStep === 2 && (
                    <div className="h-[155px] bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cyan-950/10 pointer-events-none"></div>

                      {/* Stripping sparks and physical change */}
                      <div className="flex items-center gap-1.5 relative">
                        {/* Peeling motion illustration */}
                        <div className="w-32 h-6 bg-slate-800 rounded-l relative flex items-center">
                          {/* Sheath */}
                          <div className="absolute right-0 top-0 bottom-0 w-8 bg-cyan-500 rounded-r opacity-90 animate-pulse"></div>
                          <span className="text-[9px] font-mono text-cyan-200 uppercase tracking-widest pl-2">PEELING</span>
                        </div>
                        {/* Blade */}
                        <div className="w-10 h-10 border-l border-r border-cyan-400 rounded-full animate-spin flex items-center justify-center bg-slate-900/60 shrink-0">
                          <Scissors className="w-5 h-5 text-cyan-400" />
                        </div>
                        {/* Bare fiber sliding out under laser sparks */}
                        <div className="w-24 h-0.5 bg-amber-400 relative">
                          <div className="absolute right-0 -top-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping"></div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400 font-mono animate-pulse">
                        <Zap className="w-4 h-4 fill-cyan-400 animate-bounce" />
                        <span>MENGUPAS SELONGSONG KABEL (BUFFER & COATING)...</span>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Exposed core - ready to Cleave */}
                  {simStep === 3 && (
                    <div 
                      id="cleaver-target"
                      onDragOver={(e) => handleDragOver(e, "cleaver")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "cleaver")}
                      className={`h-[155px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all relative ${
                        isDraggingOver === "cleaver" 
                          ? "border-amber-400 bg-amber-950/20 scale-[1.01]" 
                          : "border-slate-800 bg-slate-950/40"
                      }`}
                    >
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                        <span>TARGET PEMOTONGAN (VIRTUAL CLEAVER)</span>
                      </div>

                      {/* Cable showing bare fiber ready */}
                      <div className="space-y-3 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-0.5">
                          {/* Cables sheath */}
                          <div className="w-16 h-4 bg-slate-800 border border-slate-755 rounded-l relative flex items-center">
                            <div className="absolute right-0 h-4 w-3 bg-yellow-600"></div>
                          </div>
                          {/* Golden glass cladding exposed */}
                          <div className="w-14 h-0.5 bg-cyan-400 relative">
                            <span className="absolute -right-16 -top-2 text-[8px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900 px-1 rounded">
                              Core: 125μm
                            </span>
                          </div>
                        </div>

                        <p className="text-[10.5px] text-slate-350 text-center max-w-md">
                          Kulit kabel berhasil terkelupas! Sekarang geser <strong className="text-amber-400">Core Kaca Kupas</strong> dari Box Alat untuk diletakkan ke dalam slot <strong className="text-cyan-400">Virtual Cleaver</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Cleaver calibration precision swing game */}
                  {simStep === 4 && (
                    <div className="h-[155px] bg-slate-950/60 border border-slate-905 rounded-xl p-3 flex flex-col justify-between items-center relative">
                      <div className="absolute top-1.5 left-2.5 flex items-center gap-1 text-[9px] font-mono text-slate-450">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>KALIBRASI TEKANAN PISAU CLEAVER DIAL</span>
                      </div>

                      <div className="w-full text-center space-y-1 pt-1.5">
                        <strong className="text-[11px] block text-cyan-300 font-mono">Latih Ketepatan Sudut Potong Siku 90°!</strong>
                        <p className="text-[9.5px] text-slate-400">Ketuk <strong>POTONG</strong> pada saat jarum indikasian tepat berada di area tengah berwarna <strong>HIJAU</strong>.</p>
                      </div>

                      {/* real-time Oscillating needle CSS */}
                      <div className="w-full max-w-sm space-y-2 py-1">
                        
                        {/* Gauge container bar */}
                        <div className="h-6 bg-slate-900 border border-slate-800 rounded-md relative flex items-center overflow-hidden">
                          {/* Warning left side */}
                          <div className="absolute left-0 top-0 bottom-0 w-[40%] bg-gradient-to-r from-red-950/40 to-yellow-950/20"></div>
                          {/* Green Zone (Perfect cut target) */}
                          <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-emerald-500/20 border-l border-r border-emerald-400 flex items-center justify-center font-bold text-[8.5px] text-emerald-400 font-mono tracking-wider">
                            TARGET HIJAU
                          </div>
                          {/* Warning right side */}
                          <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-gradient-to-l from-red-950/40 to-yellow-950/20"></div>

                          {/* Needle Indicator */}
                          <div 
                            className="absolute top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] transition-all ease-linear"
                            style={{ left: `${gaugeValue}%` }}
                          >
                            <div className="w-3 h-3 bg-cyan-300 rounded-full -ml-[3px] -mt-1 border border-white"></div>
                          </div>
                        </div>

                        {/* Dial stats */}
                        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 px-1">
                          <span>Sudut Miring &lt;0.5° (SOP)</span>
                          <span className={`${gaugeValue >= 40 && gaugeValue <= 60 ? "text-emerald-400 font-extrabold" : "text-amber-500"}`}>
                            {gaugeValue >= 40 && gaugeValue <= 60 ? "PRESTASI OPTIMAL SIKU!" : "Sudut Bergeser/Miring"}
                          </span>
                          <span>Batas Toleransi</span>
                        </div>
                      </div>

                      {/* Interactive click cut */}
                      <button
                        onClick={triggerCleaveCut}
                        className="w-full max-w-sm py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer shadow-md active:scale-98"
                      >
                        ⚡ POTONG SEKARANG ⚡
                      </button>
                    </div>
                  )}

                  {/* STEP 5: Cleaving result diagnostic output */}
                  {simStep === 5 && (
                    <div className="h-[155px] bg-slate-950/60 border border-slate-905 rounded-xl p-4 flex flex-col justify-between items-center relative">
                      
                      {cleaveResult === "SUCCESS" ? (
                        <div className="text-center space-y-2 flex-1 flex flex-col justify-center items-center">
                          <div className="w-10 h-10 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                            <Check className="w-5 h-5 text-emerald-400" />
                          </div>
                          
                          <div className="space-y-1">
                            <h5 className="text-xs sm:text-sm font-bold text-emerald-400">
                              SUKSES: Potongan Presisi 90 derajat!
                            </h5>
                            <p className="text-[10px] text-slate-400 leading-snug font-mono">
                              Sudut deviasi pemotongan: <strong className="text-cyan-400">{cleavedAngle}°</strong> (Lolos Standar Industri/SOP &lt; 0.5 derajat).
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2 flex-1 flex flex-col justify-center items-center">
                          <div className="w-10 h-10 bg-rose-950 border border-rose-500 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-rose-450 font-black text-lg">!</span>
                          </div>

                          <div className="space-y-1">
                            <h5 className="text-xs sm:text-sm font-bold text-rose-400 uppercase">
                              GAGAL: Sudut potongan cacat, ulangi!
                            </h5>
                            <p className="text-[10px] text-slate-400 leading-snug font-mono">
                              Ujung kaca miring / retak mikro. Sudut deviasi: <strong className="text-rose-500">{cleavedAngle}°</strong> (Melebihi batas standard aman &lt; 0.5 derajat).
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Bottom control feedback */}
                      <div className="w-full flex justify-center gap-3 border-t border-slate-900 pt-2 shrink-0">
                        {cleaveResult === "SUCCESS" ? (
                          <div className="space-y-1 flex flex-col items-center">
                            <span className="text-[9.5px] text-slate-400">Ujung serat kaca datar siku siap dipasang protektor & disambung.</span>
                            <button
                              onClick={() => {
                                // triggers state component complete
                                onComplete();
                              }}
                              className="px-6 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] transition-all cursor-pointer shadow active:scale-98"
                            >
                              Selesaikan Modul & Rekam Hasil Belajar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={handleRestartCleaving}
                            className="px-5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-350 rounded font-bold text-[11px] border border-rose-800 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Kupas Sisa Serat & Pemotongan Ulang</span>
                          </button>
                        )}
                      </div>

                    </div>
                  )}

                </div>

                {/* Progress Indicators footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-850/80 flex justify-between items-center text-[9.5px] font-mono text-slate-500 shrink-0">
                  <div className="flex gap-4">
                    <span className={simStep >= 1 ? "text-cyan-400 font-bold" : ""}>1. Kupas (Miller)</span>
                    <span className={simStep >= 3 ? "text-amber-400 font-bold" : ""}>2. Glass Core</span>
                    <span className={simStep >= 4 ? "text-cyan-300 font-bold" : ""}>3. Slot Cleaver</span>
                    <span className={simStep >= 5 ? "text-emerald-400 font-bold" : ""}>4. Hasil Potong</span>
                  </div>

                  <button
                    onClick={handleResetEntireSimulator}
                    className="text-stone-450 hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus Stage</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =========================================================================
             THEORY & ENCYCLOPEDIA TAB (The tool review we previously had)
            ========================================================================= */}
        {activeTab === ActiveTab.THEORY && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
            
            {/* Left column: List of 10 tools */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider pl-1">
                Tekan Alat untuk Review (Min. 5):
              </span>
              
              <div className="space-y-1 overflow-y-auto max-h-[260px] lg:max-h-[380px] pr-1">
                {tools.map((t, idx) => (
                  <button
                    key={idx}
                    id={`tool-item-${idx}`}
                    onClick={() => handleSelectTool(idx)}
                    className={`w-full text-left p-2. rounded-lg border text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      selectedTool === idx
                        ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                        : viewedTools[idx]
                          ? "bg-slate-900/40 border-slate-850 text-slate-300 hover:border-slate-800"
                          : "bg-slate-900/80 border-slate-900 text-slate-450 hover:border-slate-800"
                    }`}
                  >
                    <span className="truncate">{idx + 1}. {t.name}</span>
                    {viewedTools[idx] && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Center column: Tool details display panel */}
            <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between max-h-[265px] lg:max-h-[385px]">
              <div className="space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2.5">
                  <div className="w-14 h-14 bg-slate-950 p-1 border border-slate-800 rounded-lg shrink-0 flex items-center justify-center">
                    {tools[selectedTool].svg}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-cyan-400">{tools[selectedTool].name}</h4>
                    <p className="text-xs text-slate-405 font-mono italic">{tools[selectedTool].localName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-bold font-mono text-[10px] text-slate-450 uppercase flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> FUNGSI INSTRUKSIONAL:
                    </span>
                    <p className="text-slate-300 text-[10.5px] leading-normal">{tools[selectedTool].function}</p>
                  </div>

                  <div className="p-2 bg-rose-950/20 border border-rose-900/30 rounded-lg font-mono text-[9px] text-amber-200">
                    <strong className="text-rose-400">PERINGATAN K3LH:</strong> {tools[selectedTool].caution}
                  </div>

                  <div className="font-mono text-[9px] text-slate-500">
                    SPESIFIKASI: {tools[selectedTool].specs}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60 text-right">
                Kemajuan Review: <span className="text-cyan-400 font-bold">{totalViewed} dari 10 Alat</span>
              </div>
            </div>

            {/* Right column: Quick matcher challenge */}
            <div id="m1-quick-quiz" className="md:col-span-3 bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between max-h-[265px] lg:max-h-[385px]">
              <form onSubmit={checkQuiz} className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <span className="font-mono text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-900 px-2 py-0.5 rounded uppercase block w-max">
                    UJI PENGETAHUAN KILAT
                  </span>
                  <p className="text-[10px] text-slate-401">Hubungkan alat kerja ke definisinya:</p>

                  {/* Question 1 */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-300 block">1. Lebur core kaca permanent?</label>
                    <select
                      value={answers[0]}
                      onChange={(e) => handleSelectAnswer(0, parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-[10px] text-slate-300 font-mono"
                    >
                      <option value={-1}>- Pilih Alat -</option>
                      <option value={0}>Fusion Splicer</option>
                      <option value={1}>Optical Power Meter</option>
                      <option value={2}>Fiber Cleaver</option>
                    </select>
                  </div>

                  {/* Question 2 */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-300 block">2. Memotong core tegak lurus 90°?</label>
                    <select
                      value={answers[1]}
                      onChange={(e) => handleSelectAnswer(1, parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-855 rounded px-2 py-1 text-[10px] text-slate-300 font-mono"
                    >
                      <option value={-1}>- Pilih Alat -</option>
                      <option value={0}>Miller Stripper</option>
                      <option value={1}>Visual Fault Locator</option>
                      <option value={2}>Fiber Cleaver</option>
                    </select>
                  </div>

                  {/* Question 3 */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-slate-300 block">3. Redaman daya optik (dBm)?</label>
                    <select
                      value={answers[2]}
                      onChange={(e) => handleSelectAnswer(2, parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-855 rounded px-2 py-1 text-[10px] text-slate-300 font-mono"
                    >
                      <option value={-1}>- Pilih Alat -</option>
                      <option value={0}>OTDR</option>
                      <option value={1}>OPM (Power Meter)</option>
                      <option value={2}>Protection Sleeve</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  {quizSubmitted && (
                    <p className={`text-[10px] font-mono mb-2 text-center py-1 rounded ${
                      quizSuccess ? "text-emerald-400 bg-emerald-950/20" : "text-rose-450 bg-rose-950/20"
                    }`}>
                      {quizSuccess ? "Sukses! Jawaban Benar ✓" : "Salah, silakan periksa lagi!"}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold py-1.5 rounded text-[10px] font-mono transition-colors cursor-pointer"
                  >
                    Periksa Pemahaman
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* Selesaikan Modul control bar */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-900 flex justify-between items-center bg-slate-950 shrink-0">
        <p className="text-[10px] text-slate-500 font-mono max-w-md hidden sm:block">
          {activeTab === ActiveTab.PRACTICE 
            ? "Instruksi: Selesaikan pemotongan presisi 90 derajat siku pada meter pengukur untuk membuka tanda kelulusan Modul I." 
            : "Instruksi: Selesaikan minimal 5 review alat di panel kiri dan selesaikan tantangan kuis pemahaman kilat."}
        </p>

        <button
          id="btn-complete-m1"
          onClick={onComplete}
          disabled={!isEligibleToComplete}
          className={`py-2 px-5 rounded-lg text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer ${
            isEligibleToComplete
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-98"
              : "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          <Award className="w-4 h-4 text-emerald-300" />
          <span>{isCompleted ? "Tuntas! Selesai" : "Selesaikan & Rekam Modul"}</span>
        </button>
      </div>

    </div>
  );
}
