import React, { useState } from "react";
import { AppScreen, StudentInfo } from "../types";
import { Play, ShieldAlert, Award, FileText, Cpu } from "lucide-react";

interface WelcomeScreenProps {
  key?: any;
  onStart: (info: StudentInfo) => void;
  onGoToTeacherPanel: () => void;
  savedName?: string;
  savedClass?: string;
}

export default function WelcomeScreen({ onStart, onGoToTeacherPanel, savedName = "", savedClass = "X TJKT 1" }: WelcomeScreenProps) {
  // Load custom Rombel DB
  const [rombelDB, setRombelDB] = useState<{ [key: string]: string[] }>(() => {
    const saved = localStorage.getItem("ftth_rombel_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      "X TJKT 1": ["Adi Saputra", "Budi Hermawan", "Citra Kirana", "Dian Sastrowardoyo", "Eko Prasetyo"],
      "X TJKT 2": ["Farhan Alamsyah", "Gita Gutawa", "Hendra Wijaya", "Indah Permatasari", "Joko Widodo"],
      "X TJKT 3": ["Kiki Amelia", "Lutfi Syahputra", "Mega Utami", "Naufal Rabbani", "Oki Setiana"],
      "XI TJKT": ["Siska Ambarwati", "Taufik Hidayat", "Umar bin Khattab", "Vina Panduwinata"],
      "XII TJKT": ["Wahid Hasyim", "Xania Lovata", "Yusuf Mansur", "Zaskia Adya Mecca"]
    };
  });

  const [classRoom, setClassRoom] = useState(savedClass);
  const [name, setName] = useState(savedName || "__CHOOSE__");
  const [isManualInput, setIsManualInput] = useState(() => {
    // If there's a saved name, allow manual input edit mode directly, else force rosters
    if (savedName) return true;
    return false;
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMess, setErrorMess] = useState("");

  // Ensure all students have passcodes pre-seeded
  React.useEffect(() => {
    try {
      const savedPasses = localStorage.getItem("ftth_student_passcodes");
      let passcodes: { [key: string]: string } = {};
      if (savedPasses) {
        passcodes = JSON.parse(savedPasses);
      }
      let updated = false;
      Object.entries(rombelDB).forEach(([cName, students]) => {
        if (Array.isArray(students)) {
          (students as string[]).forEach(sName => {
            const key = `${sName}_${cName}`;
            if (!passcodes[key]) {
              const code = Math.floor(1000 + Math.random() * 9000).toString();
              passcodes[key] = code;
              updated = true;
            }
          });
        }
      });
      if (updated) {
        localStorage.setItem("ftth_student_passcodes", JSON.stringify(passcodes));
      }
    } catch (e) {
      console.error(e);
    }
  }, [rombelDB]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === "__CHOOSE__") {
      setErrorMess("Harap pilih nama Anda atau masukkan manual untuk kelulusan!");
      return;
    }

    const trimmedName = name.trim();
    const dbKey = `${trimmedName}_${classRoom}`;

    // 1. Check if another student is currently logged in (active on another device/browser sharing localStorage)
    try {
      const sessionsStr = localStorage.getItem("ftth_active_sessions") || "{}";
      const sessions = JSON.parse(sessionsStr);
      if (sessions[dbKey]) {
        const lastActive = sessions[dbKey].lastActive;
        const now = Date.now();
        // If they had active heartbeat in the last 15 seconds, and it is NOT our local station's saved session
        const currentLocalStr = localStorage.getItem("ftth_student");
        let isOurLocalSession = false;
        if (currentLocalStr) {
          const localS = JSON.parse(currentLocalStr);
          if (localS.name === trimmedName && localS.classRoom === classRoom && localS.sessionToken === sessions[dbKey].token) {
            isOurLocalSession = true;
          }
        }

        if (!isOurLocalSession && (now - lastActive < 15000)) {
          setErrorMess("Akses Ditolak: Nama ini SEDANG BELAJAR aktif di perangkat/komputer lab lain! Minta Guru untuk Rilis Kunci.");
          return;
        }
      }
    } catch (e) {}

    // 2. Validate passcode
    try {
      const savedPasses = localStorage.getItem("ftth_student_passcodes");
      let passcodes: { [key: string]: string } = {};
      if (savedPasses) {
        passcodes = JSON.parse(savedPasses);
      }

      const currentRoster = rombelDB[classRoom] || [];
      const isRegistered = currentRoster.includes(trimmedName);

      if (isRegistered) {
        const expectedPassed = passcodes[dbKey] || "1234";
        if (passwordInput.trim() !== expectedPassed) {
          setErrorMess("Sandi Masuk Salah! Silakan tanyakan sandi 4-digit unik Anda kepada Guru Pengajar.");
          return;
        }
      } else {
        // Unregistered manual input, let them use teacher PIN "1234" to register automatically
        if (passwordInput.trim() !== "1234") {
          setErrorMess("Nama tidak terdaftar di Roster! Gunakan Sandi Pendaftaran '1234' untuk mendaftar baru di kelas ini.");
          return;
        }
        // Save them to roster!
        const updatedRoster = [...currentRoster, trimmedName];
        const updatedDB = { ...rombelDB, [classRoom]: updatedRoster };
        setRombelDB(updatedDB);
        localStorage.setItem("ftth_rombel_db", JSON.stringify(updatedDB));
        
        // Save passive credentials
        passcodes[dbKey] = "1234";
        localStorage.setItem("ftth_student_passcodes", JSON.stringify(passcodes));
      }
    } catch (e) {}

    setErrorMess("");
    // Get current local time
    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    
    // Create random session token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Set active session registry immediately so heartbeat can take over
    try {
      const sessionsStr = localStorage.getItem("ftth_active_sessions") || "{}";
      const sessions = JSON.parse(sessionsStr);
      sessions[dbKey] = {
        lastActive: Date.now(),
        token: token
      };
      localStorage.setItem("ftth_active_sessions", JSON.stringify(sessions));
    } catch(e){}

    onStart({
      name: trimmedName,
      classRoom: classRoom,
      joinedAt: formattedDate,
      sessionToken: token
    });
  };

  // Switch classRoom and reset name selection accordingly
  const handleClassChange = (selectedClass: string) => {
    setClassRoom(selectedClass);
    const roster = rombelDB[selectedClass] || [];
    if (roster.length > 0) {
      setName(roster[0]);
      setIsManualInput(false);
    } else {
      setName("");
      setIsManualInput(true);
    }
  };

  const currentRoster = rombelDB[classRoom] || [];

  return (
    <div id="welcome-screen" className="flex flex-col md:flex-row items-center justify-between h-full w-full gap-6 p-4 md:p-8 text-white relative overflow-hidden bg-slate-950">
      {/* Background Decorative SVG Fiber Optic Core */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="100" cy="100" r="80" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" />
          <circle cx="100" cy="100" r="50" stroke="#06b6d4" strokeWidth="1" />
          <circle cx="100" cy="100" r="10" stroke="#f43f5e" strokeWidth="2" />
          <path d="M100 10 L100 190 M10 100 L190 100" stroke="#1e293b" strokeWidth="1" />
          <path d="M36 36 L164 164 M36 164 L164 36" stroke="#1e293b" strokeWidth="1" />
        </svg>
      </div>

      {/* Decorative Grid Line Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      {/* Left side: Hero Text details */}
      <div className="flex-1 space-y-5 z-10 max-w-lg">
        <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-800/60 rounded-full px-3 py-1 font-mono text-xs text-cyan-400 font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Cpu className="w-3.5 h-3.5 animate-spin-slow" />
          Lab Maya • Jurusan TJKT Fase E
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          FTTH <span className="text-cyan-400 cyan-glow bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">VirtuaLab</span>
        </h1>
        
        <p className="text-sm md:text-base text-slate-350 leading-relaxed">
          Platform laboratorium virtual interaktif yang dirancang khusus untuk memandu siswa SMK Jurusan 
          <strong> Teknik Jaringan Komputer dan Telekomunikasi (TJKT)</strong> memahami instalasi, K3LH, penyambungan 
          <em> (splicing)</em>, dan pengukuran redaman kabel fiber optic berstandar industri secara aman dan mendalam.
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs md:text-sm text-slate-400 pt-2 border-t border-slate-900">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>K3LH Interaktif (Laser Protection & Shard Safety)</span>
          </div>
          <div className="flex items-start gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Fusi Core 125μm Splicing Simulator</span>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Troubleshoot Redaman GPON dengan OPM & VFL</span>
          </div>
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>E-Sertifikat Kelulusan Uji Kompetensi Maya</span>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="w-full md:w-[380px] z-10">
        <form 
          id="welcome-form"
          onSubmit={handleSubmit} 
          className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 box-cyan relative backdrop-blur-md"
        >
          {/* Inner ambient glow */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

          <h3 className="text-lg font-bold text-cyan-400 mb-1 flex items-center gap-2">
            Pendaftaran Operator Lab
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Pilih rombel dan nama Anda untuk memulai praktikum dan mencetak sertifikasi kelulusan.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="student-class" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Kelas / Rombel
              </label>
              <select
                id="student-class"
                value={classRoom}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer font-mono"
              >
                {Object.keys(rombelDB).map((rKey) => (
                  <option key={rKey} value={rKey}>{rKey}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="student-name" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Nama Lengkap Siswa
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsManualInput(!isManualInput);
                    setName("");
                  }}
                  className="text-[10px] text-cyan-500 hover:underline font-mono cursor-pointer"
                >
                  {isManualInput ? "✓ Pilih Otomatis" : "✎ Ketik Manual"}
                </button>
              </div>

              {!isManualInput && currentRoster.length > 0 ? (
                /* Auto Student Name dropdown */
                <select
                  id="student-name-select"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer font-sans"
                >
                  <option value="__CHOOSE__" disabled={name !== "" && name !== "__CHOOSE__"}>-- Pilih Nama Anda --</option>
                  {currentRoster.map((sName) => (
                    <option key={sName} value={sName}>{sName}</option>
                  ))}
                </select>
              ) : (
                /* Text Input manual as fallback */
                <input
                  id="student-name"
                  type="text"
                  value={name === "__CHOOSE__" ? "" : name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ketik nama lengkap Anda..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
                  maxLength={40}
                />
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 flex-wrap">
                <label htmlFor="student-password" className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Password Masuk Siswa
                </label>
                <span className="text-[10px] text-amber-500 font-sans italic">didapat dari Guru Pengajar</span>
              </div>
              <input
                id="student-password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value.replace(/\D/g, "").substring(0, 4))}
                placeholder="Masukkan 4-digit sandi..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-yellow-400 font-mono tracking-widest text-center focus:outline-none focus:border-cyan-500/50 transition-all placeholder:tracking-normal placeholder:font-sans"
                maxLength={4}
                required
              />
            </div>

            {errorMess && (
              <div className="bg-rose-950/50 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-200 mt-2 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMess}</span>
              </div>
            )}

            <button
              id="btn-start-lab"
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-98 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-sans group cursor-pointer text-sm"
            >
              <span>Mulai Praktikum Maya</span>
              <Play className="w-4 h-4 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="mt-4 pt-1 flex flex-col gap-1.5 border-t border-slate-800/40">
            <button
              type="button"
              onClick={onGoToTeacherPanel}
              className="w-full text-center hover:text-cyan-400 text-slate-500 font-mono text-[9px] py-1.5 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-dashed border-slate-850 hover:border-cyan-950 transition-all cursor-pointer"
            >
              ⚙ PANEL GURU & INSTRUKTUR (ROSTER / KUIS)
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono px-1">
              <span>MODUL AJAR: FASE E-SMK</span>
              <span>EDISI REVISI 2026</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
