/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppScreen, StudentInfo, ModuleProgress } from "./types";
import WelcomeScreen from "./components/WelcomeScreen";
import K3LHGuide from "./components/K3LHGuide";
import Dashboard from "./components/Dashboard";
import Module1 from "./components/Module1";
import Module2 from "./components/Module2";
import Module3 from "./components/Module3";
import Evaluation from "./components/Evaluation";
import CreatorCredits from "./components/CreatorCredits";
import TeacherPanel from "./components/TeacherPanel";
import { Smartphone, HelpCircle, Laptop, Volume2, VolumeX, Music, Wind } from "lucide-react";
import { audioSynth } from "./utils/audio";

export default function App() {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.WELCOME);

  // Student Info
  const [student, setStudent] = useState<StudentInfo>({
    name: "",
    classRoom: "X TJKT 1",
    joinedAt: ""
  });

  // Module Progress & Scores
  const [progress, setProgress] = useState<ModuleProgress>({
    m1Completed: false,
    m2Completed: false,
    m3Completed: false,
    quizCompleted: false,
    quizScore: -1
  });

  // Custom high-fidelity modal state to prevent iframe-blocked window.confirm glitches
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Synchronization key to force reload roster on back transitions
  const [teacherUpdateTrigger, setTeacherUpdateTrigger] = useState<number>(0);

  // Session hijacking state
  const [isSessionHijacked, setIsSessionHijacked] = useState<boolean>(false);

  // Audio Control states, integrated with the procedurally synthesized Web Audio system
  const [soundSfx, setSoundSfx] = useState<boolean>(true);
  const [soundHum, setSoundHum] = useState<boolean>(false);
  const [soundMusic, setSoundMusic] = useState<boolean>(true); // Let's default music to true to make the lab feel cozy right away!

  // Toggle helpers
  const toggleSfx = () => {
    const next = !soundSfx;
    setSoundSfx(next);
    audioSynth.setSoundEnabled(next);
  };

  const toggleHum = () => {
    const next = !soundHum;
    setSoundHum(next);
    audioSynth.setHumEnabled(next);
  };

  const toggleMusic = () => {
    const next = !soundMusic;
    setSoundMusic(next);
    audioSynth.setMusicEnabled(next);
  };

  // Sync state to synthesizer on change
  useEffect(() => {
    audioSynth.setSoundEnabled(soundSfx);
    audioSynth.setHumEnabled(soundHum);
    audioSynth.setMusicEnabled(soundMusic);
  }, [soundSfx, soundHum, soundMusic]);

  // Audio Bootstrapper & Mechanical click sound hook on physical user interaction
  useEffect(() => {
    const startAudioOnInteraction = () => {
      audioSynth.startAmbientHum();
      if (soundMusic) {
        audioSynth.startAmbientMusic();
      }
      document.removeEventListener("click", startAudioOnInteraction);
      document.removeEventListener("keydown", startAudioOnInteraction);
    };

    document.addEventListener("click", startAudioOnInteraction);
    document.addEventListener("keydown", startAudioOnInteraction);

    // Dynamic mechanical click listener for structural tags
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" || 
        target.closest("button") || 
        target.tagName === "A" || 
        target.closest("a") || 
        target.classList.contains("clickable-tile") ||
        target.closest(".clickable-tile")
      ) {
        audioSynth.playClick();
      }
    };

    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", startAudioOnInteraction);
      document.removeEventListener("keydown", startAudioOnInteraction);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [soundMusic]);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedStudent = localStorage.getItem("ftth_student");
      if (savedStudent) {
        const studentObj = JSON.parse(savedStudent);
        // Retroactively backport a session token for older mock test cases
        if (!studentObj.sessionToken) {
          studentObj.sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem("ftth_student", JSON.stringify(studentObj));
        }
        setStudent(studentObj);
        // Set their active session registry entry on load
        try {
          const dbKey = `${studentObj.name}_${studentObj.classRoom}`;
          const sessionsStr = localStorage.getItem("ftth_active_sessions") || "{}";
          const sessions = JSON.parse(sessionsStr);
          sessions[dbKey] = {
            lastActive: Date.now(),
            token: studentObj.sessionToken
          };
          localStorage.setItem("ftth_active_sessions", JSON.stringify(sessions));
        } catch(e){}

        // If student exists, let them land directly in the dashboard or welcome with pre-fill
        setCurrentScreen(AppScreen.DASHBOARD);
      }

      const savedProgress = localStorage.getItem("ftth_progress");
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (e) {
      console.error("Gagal memuat cache lokal:", e);
    }
  }, []);

  // Session heartbeat loop and takeover checker
  useEffect(() => {
    if (!student || !student.name || !student.sessionToken) {
      setIsSessionHijacked(false);
      return;
    }

    const dbKey = `${student.name}_${student.classRoom}`;

    const checkAndSendHeartbeat = () => {
      try {
        const sessionsStr = localStorage.getItem("ftth_active_sessions") || "{}";
        const sessions = JSON.parse(sessionsStr);

        // If another session was activated with a different token, or if it was cleared
        if (sessions[dbKey]) {
          if (sessions[dbKey].token !== student.sessionToken) {
            setIsSessionHijacked(true);
            return;
          }
        } else {
          // Cleared or deleted by teacher / reset
          setIsSessionHijacked(true);
          return;
        }

        // We are the valid owner! Update our heartbeat timestamp
        sessions[dbKey] = {
          lastActive: Date.now(),
          token: student.sessionToken
        };
        localStorage.setItem("ftth_active_sessions", JSON.stringify(sessions));
      } catch (e) {
        console.error("Gagal update heartbeat:", e);
      }
    };

    // Run first heartbeat right away
    checkAndSendHeartbeat();

    // Check/refresh every 4 seconds
    const intervalId = setInterval(checkAndSendHeartbeat, 4500);

    return () => clearInterval(intervalId);
  }, [student]);

  // Save changes to student info and synchronize progress database
  const handleStartLab = (info: StudentInfo) => {
    setStudent(info);
    localStorage.setItem("ftth_student", JSON.stringify(info));

    // Retrieve previous progress for this student if any
    const dbKey = `${info.name}_${info.classRoom}`;
    let loadedProgress = {
      m1Completed: false,
      m2Completed: false,
      m3Completed: false,
      quizCompleted: false,
      quizScore: -1
    };
    try {
      const allStr = localStorage.getItem("ftth_all_students_progress");
      if (allStr) {
        const db = JSON.parse(allStr);
        if (db[dbKey]) {
          loadedProgress = db[dbKey];
        }
      }
    } catch (e) {
      console.error("Gagal membaca db progress:", e);
    }

    setProgress(loadedProgress);
    localStorage.setItem("ftth_progress", JSON.stringify(loadedProgress));
    
    // Auto insert/update into progress database
    try {
      const allStr = localStorage.getItem("ftth_all_students_progress") || "{}";
      const db = JSON.parse(allStr);
      db[dbKey] = loadedProgress;
      localStorage.setItem("ftth_all_students_progress", JSON.stringify(db));
    } catch(e){}

    setCurrentScreen(AppScreen.K3LH);
  };

  const syncProgressToDB = (updated: ModuleProgress) => {
    setProgress(updated);
    localStorage.setItem("ftth_progress", JSON.stringify(updated));

    if (student && student.name) {
      try {
        const dbKey = `${student.name}_${student.classRoom}`;
        const allStr = localStorage.getItem("ftth_all_students_progress") || "{}";
        const db = JSON.parse(allStr);
        db[dbKey] = updated;
        localStorage.setItem("ftth_all_students_progress", JSON.stringify(db));
      } catch (e) {
        console.error("Gagal sync progress ke db:", e);
      }
    }
  };

  // Mark specific modules as completed
  const handleCompleteModule1 = () => {
    const updated = { ...progress, m1Completed: true };
    syncProgressToDB(updated);
    setCurrentScreen(AppScreen.DASHBOARD);
  };

  const handleCompleteModule2 = () => {
    const updated = { ...progress, m2Completed: true };
    syncProgressToDB(updated);
    setCurrentScreen(AppScreen.DASHBOARD);
  };

  const handleCompleteModule3 = () => {
    const updated = { ...progress, m3Completed: true };
    syncProgressToDB(updated);
    setCurrentScreen(AppScreen.DASHBOARD);
  };

  const handleSetQuizScore = (score: number) => {
    const updated = {
      ...progress,
      quizCompleted: score >= 0,
      quizScore: score
    };
    syncProgressToDB(updated);
  };

  const handleResetProgress = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    const clearedProgress = {
      m1Completed: false,
      m2Completed: false,
      m3Completed: false,
      quizCompleted: false,
      quizScore: -1
    };

    // Release the active session locker
    if (student && student.name) {
      try {
        const dbKey = `${student.name}_${student.classRoom}`;
        const sessionsStr = localStorage.getItem("ftth_active_sessions") || "{}";
        const sessions = JSON.parse(sessionsStr);
        delete sessions[dbKey];
        localStorage.setItem("ftth_active_sessions", JSON.stringify(sessions));
      } catch (e) {}
    }

    setProgress(clearedProgress);
    localStorage.removeItem("ftth_progress");
    localStorage.removeItem("ftth_student");
    setStudent({ name: "", classRoom: "X TJKT 1", joinedAt: "", sessionToken: "" });
    setShowLogoutModal(false);
    setCurrentScreen(AppScreen.WELCOME);
  };

  return (
    <div id="application-container" className="h-screen w-full bg-slate-950 flex flex-col p-0 sm:p-1 md:p-2.5 text-slate-100 font-sans overflow-hidden">
      
      {/* Immersive Responsive Full Viewport Workspace Casing */}
      <div 
        id="virtual-lab-casing"
        className="w-full h-full flex-1 bg-slate-950 md:border md:border-slate-900 rounded-none sm:rounded-2xl shadow-[0_25px_60px_rgba(2,6,23,0.95)] relative flex flex-col overflow-hidden box-cyan transition-all duration-300"
      >
        {/* Anti-AI Slop Title margin header */}
        <div className="bg-slate-950/90 border-b border-slate-900/60 px-4 py-2.5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-slate-500">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-slow"></span>
            <span>SYSTEM DIRECT LINK // FTTH-VIRTUALAB v1.2</span>
          </div>

          <div className="flex items-center gap-4">
            {/* PROCEDURAL WEB AUDIO SYNTH CONTROL SUITE */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 rounded-lg px-2 py-0.5 text-[8.5px] font-mono">
              <span className="text-slate-500 hidden md:inline mr-1 uppercase tracking-wider font-bold">AUDIO:</span>
              
              <button
                type="button"
                onClick={toggleSfx}
                title={soundSfx ? "Mute Efek Suara (Klik, Pop, Alarm)" : "Aktifkan Efek Suara"}
                className={`p-1 rounded flex items-center gap-0.5 font-bold transition-all cursor-pointer ${
                  soundSfx ? "text-cyan-400 bg-cyan-950/40" : "text-slate-600 hover:text-slate-450"
                }`}
              >
                {soundSfx ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3" />}
                <span>SFX</span>
              </button>

              <button
                type="button"
                onClick={toggleHum}
                title={soundHum ? "Matikan Dengung Kipas Lab" : "Aktifkan Dengung Kipas Lab"}
                className={`p-1 rounded flex items-center gap-0.5 font-bold transition-all cursor-pointer ${
                  soundHum ? "text-emerald-400 bg-emerald-950/40" : "text-slate-600 hover:text-slate-450"
                }`}
              >
                <Wind className="w-3 h-3" />
                <span>KIPAS</span>
              </button>

              <button
                type="button"
                onClick={toggleMusic}
                title={soundMusic ? "Matikan Musik Latar Tenang" : "Aktifkan Musik Latar Tenang"}
                className={`p-1 rounded flex items-center gap-0.5 font-bold transition-all cursor-pointer ${
                  soundMusic ? "text-amber-400 bg-amber-950/40" : "text-slate-600 hover:text-slate-450"
                }`}
              >
                <Music className="w-3 h-3 text-amber-400" />
                <span>MUSIK</span>
              </button>
            </div>

            <button 
              onClick={() => setCurrentScreen(AppScreen.CREATOR)} 
              title="Credits & Licensing"
              className="p-1 rounded hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer text-slate-500 hover:text-cyan-400 font-mono text-[9.5px] flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kredit</span>
            </button>
            
            <div className="flex gap-1.5 pl-2 border-l border-slate-900">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600/30 border border-rose-500/10"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600/30 border border-amber-500/10"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/30 border border-emerald-500/10"></span>
            </div>
          </div>
        </div>

        {/* Dynamic Inner views router based on conditional state */}
        <div className="flex-1 min-h-0 bg-slate-950">
          {currentScreen === AppScreen.WELCOME && (
            <WelcomeScreen 
              key={teacherUpdateTrigger}
              onStart={handleStartLab} 
              onGoToTeacherPanel={() => setCurrentScreen(AppScreen.TEACHER)}
              savedName={student.name}
              savedClass={student.classRoom}
            />
          )}

          {currentScreen === AppScreen.TEACHER && (
            <TeacherPanel 
              onBack={() => setCurrentScreen(AppScreen.WELCOME)}
              onRefreshData={() => setTeacherUpdateTrigger(prev => prev + 1)}
            />
          )}

          {currentScreen === AppScreen.K3LH && (
            <K3LHGuide 
              studentName={student.name}
              onContinue={() => setCurrentScreen(AppScreen.DASHBOARD)}
            />
          )}

          {currentScreen === AppScreen.DASHBOARD && (
            <Dashboard 
              studentName={student.name}
              studentClass={student.classRoom}
              progress={progress}
              joinedAt={student.joinedAt}
              onSelectScreen={(screen) => setCurrentScreen(screen)}
              onResetProgress={handleResetProgress}
            />
          )}

          {currentScreen === AppScreen.MODULE1 && (
            <Module1 
              onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
              onComplete={handleCompleteModule1}
              isCompleted={progress.m1Completed}
            />
          )}

          {currentScreen === AppScreen.MODULE2 && (
            <Module2 
              onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
              onComplete={handleCompleteModule2}
              isCompleted={progress.m2Completed}
            />
          )}

          {currentScreen === AppScreen.MODULE3 && (
            <Module3 
              onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
              onComplete={handleCompleteModule3}
              isCompleted={progress.m3Completed}
            />
          )}

          {currentScreen === AppScreen.EVALUATION && (
            <Evaluation 
              onBack={() => setCurrentScreen(AppScreen.DASHBOARD)}
              studentName={student.name}
              studentClass={student.classRoom}
              savedScore={progress.quizScore}
              onSetScore={handleSetQuizScore}
            />
          )}

          {currentScreen === AppScreen.CREATOR && (
            <CreatorCredits 
              onBack={() => setCurrentScreen(student.name ? AppScreen.DASHBOARD : AppScreen.WELCOME)}
            />
          )}
        </div>

        {/* Custom High-Tech Interactive Logout Confirmation Modal (Works inside standard iFrames) */}
        {showLogoutModal && (
          <div 
            id="logout-confirmation-modal" 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-[0_15px_40px_rgba(244,63,94,0.15)] text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full border border-rose-500/20 bg-rose-950/20 flex items-center justify-center animate-pulse">
                <span className="text-rose-500 text-lg font-bold font-mono">!</span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">
                  KELUAR (LOGOUT) SESI AKTIF
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Apakah Anda ingin keluar dari laboratorium? Seluruh hasil belajar Anda akan dihapus dari komputer agar siswa berikutnya dapat memulai lembar kerja baru.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1.5">
                <button
                  id="btn-cancel-logout"
                  onClick={() => setShowLogoutModal(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-logout"
                  onClick={handleConfirmLogout}
                  className="py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Stolen / Lock Hijack Modal Warning */}
        {isSessionHijacked && (
          <div 
            id="session-hijacked-modal"
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          >
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(244,63,94,0.15)] text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full border border-rose-500/20 bg-rose-950/30 flex items-center justify-center">
                <span className="text-rose-500 text-lg font-bold font-mono">⚠️</span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-rose-400 uppercase tracking-widest font-mono">
                  SESI DIKUNCI / DINONAKTIFKAN
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Sesi praktikum atas nama <strong className="text-cyan-400 font-mono">{student.name}</strong> ({student.classRoom}) telah terputus karena terdeteksi masuk di perangkat/browser lain, atau rilis paksa diluncurkan oleh Guru Pengajar.
                </p>
              </div>

              <button
                id="btn-dismiss-hijacked"
                onClick={() => {
                  try {
                    localStorage.removeItem("ftth_student");
                    localStorage.removeItem("ftth_progress");
                  } catch(e){}
                  setStudent({ name: "", classRoom: "X TJKT 1", joinedAt: "", sessionToken: "" });
                  setIsSessionHijacked(false);
                  setCurrentScreen(AppScreen.WELCOME);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Kembali Ke Registrasi
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
