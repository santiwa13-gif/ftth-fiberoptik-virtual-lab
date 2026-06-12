import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Users, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  PlusCircle, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  BookOpen, 
  UserPlus,
  TrendingUp,
  RefreshCw,
  Search,
  Download,
  Award,
  AlertCircle
} from "lucide-react";
import { QuizQuestion, ModuleProgress } from "../types";

interface TeacherPanelProps {
  onBack: () => void;
  onRefreshData: () => void;
}

// Default initial question pool matching exactly what Evaluation.tsx had
const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    question: "Manakah tindakan K3LH yang paling tepat untuk mengamankan sisa patahan core kaca (glass shards) mikro setelah proses pengupasan dan pemotongan?",
    options: [
      "A. Menyeka patahan menggunakan jari tangan kosong lalu membuangnya ke tempat sampah umum.",
      "B. Meniup sisa patahan dari meja kerja agar terbang jatuh bebas ke lantai lab.",
      "C. Mengambil serpihan tajam kaca memakai lem isolasi (tape) dan menyimpannya di wadah pembuangan tertutup (disposal vessel).",
      "D. Saringan udara steril khusus."
    ],
    correctAnswer: 2,
    explanation: "Kepingan core kaca yang terpotong berdiameter mikro (125μm) mudah menusuk pori kulit secara tidak terlihat dan berbahaya jika masuk ke aliran darah. Menggunakan perekat isolasi adalah prosedur standar K3LH guna menangkap pecahan kaca steril."
  },
  {
    question: "Mengapa teknisi serat optik dilarang keras menatap langsung (eye projection) lubang transmitter laser atau ujung pigtail konektor yang aktif?",
    options: [
      "A. Karena cahaya laser berwarna biru terang menyilaukan pandangan mata.",
      "B. Sinar laser mengalirkan listrik bertegangan tinggi AC yang bisa menyengat wajah.",
      "C. Sinar laser inframerah (1310-1550nm) tidak terlihat oleh mata, namun berdaya tinggi dan dapat membakar sel retina mata secara permanen.",
      "D. Cahaya laser pigtail dapat menyebabkan karat cepat pada kacamata minus."
    ],
    correctAnswer: 2,
    explanation: "Panjang gelombang transmisi serat optik berada dalam spektrum inframerah tidak terlihat oleh retina manusia, tetapi energinya terkonsentrasi kuat dan mampu merusak saraf penglihatan secara langsung tanpa rasa sakit seketika."
  },
  {
    question: "Apa fungsi utama dari alat presisi bernama Fiber Cleaver dalam tahapan penyambungan serat optik?",
    options: [
      "A. Mengupas lapisan pembungkus buffer coating warna kuning terluar kabel.",
      "B. Memotong ujung kaca core secara presisi agar tegak lurus sempurna (<0.5°) sebelum dilebur fusi.",
      "C. Memanaskan selongsong protection sleeve agar mengecil mengikat sambungan.",
      "D. Melakukan tes kekuatan sinyal laser penerima ke modem pelanggan."
    ],
    correctAnswer: 1,
    explanation: "Fiber Cleaver bertugas memotong keretakan kaku pada core kaca murni secara tegak lurus 90 derajat. Sudut penampang potongan yang buruk akan mementalkan cahaya dan memicu redaman (loss) yang tinggi."
  },
  {
    question: "Berapakah nilai batas maksimal toleransi redaman sambungan (splice loss) per titik fusi pengelasan yang memenuhi standar keahlian industri?",
    options: [
      "A. Maksimal 3.00 dB per sambungan fusi.",
      "B. Maksimal 0.03 dB per sambungan fusi.",
      "C. Boleh bebas berapa saja asalkan kabel menyambung erat.",
      "D. Tepat mencapai 10 dB per sambungan fusi."
    ],
    correctAnswer: 1,
    explanation: "Standar penyambungan fusi industri modern (Telkom/TJKT) mensyaratkan splice loss hasil pengelasan maksimal 0.03 dB demi kelangsungan jaringan bebas hambatan."
  },
  {
    question: "Pada monitor grafik OTDR, penurunan level desibel sinyal di titik tertentu yang anjlok lurus ke bawah secara tajam tanpa adanya lonjakan refleksi (non-reflective event) menandakan terjadi...",
    options: [
      "A. Kejadian bending (tekukan tajam) pada rute kabel di kilometer tersebut.",
      "B. Kabel mengalami putus total atau pecah total (total fracture).",
      "C. Permukaan konektor pigtail sangat kotor berdebu di kilometer 0.",
      "D. Pengiriman daya transmitter laser yang melebihi batas spektral."
    ],
    correctAnswer: 0,
    explanation: "Penurunan level dB secara drastis tanpa adanya pulsa pantul visual (reflective peak) menandakan kebocoran foton cahaya keluar dinding core akibat kelengkungan kabel berlebih (bending)."
  }
];

export default function TeacherPanel({ onBack, onRefreshData }: TeacherPanelProps) {
  // Passcode gate for security
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Navigation tab state: roster (Rombel), analytics (Progess), quiz (Question bank)
  const [activeTab, setActiveTab] = useState<"roster" | "analytics" | "quiz">("analytics");

  // Rombel DB structure
  const [rombelDB, setRombelDB] = useState<{ [key: string]: string[] }>({});
  const [activeRombel, setActiveRombel] = useState<string>("X TJKT 1");
  const [rosterText, setRosterText] = useState<string>("");
  const [newRombelName, setNewRombelName] = useState<string>("");

  // All student results progression dictionary
  const [allStudentsProgress, setAllStudentsProgress] = useState<{ [key: string]: ModuleProgress }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [analyticsFilter, setAnalyticsFilter] = useState<string>("all");

  // Student passcode state and Active session locks
  const [studentPasscodes, setStudentPasscodes] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem("ftth_student_passcodes");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [activeSessions, setActiveSessions] = useState<{ [key: string]: { lastActive: number, token: string } }>(() => {
    try {
      const saved = localStorage.getItem("ftth_active_sessions");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Question editing
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // New Question Form state
  const [newQuestionText, setNewQuestionText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctKey, setCorrectKey] = useState<number>(0); // 0=A, 1=B, 2=C, 3=D
  const [explanation, setExplanation] = useState("");

  const [notification, setNotification] = useState("");

  // Dialog configuration to securely bypass browser popups block in iframe
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    isAlertOnly?: boolean;
    styleType?: "danger" | "warning" | "success" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Ya",
    cancelText: "Batal",
    onConfirm: () => {},
    isAlertOnly: false,
    styleType: "info"
  });

  const triggerAlert = (title: string, message: string, styleType: "danger" | "warning" | "success" | "info" = "warning") => {
    setDialog({
      isOpen: true,
      title,
      message,
      confirmText: "OK",
      isAlertOnly: true,
      styleType
    });
  };

  const triggerConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    confirmText = "Ya, Lanjutkan", 
    cancelText = "Batal",
    styleType: "danger" | "warning" | "info" = "danger"
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setDialog(prev => ({ ...prev, isOpen: false }));
      },
      isAlertOnly: false,
      styleType
    });
  };

  const refreshSessionsAndPasscodes = () => {
    try {
      const savedPasses = localStorage.getItem("ftth_student_passcodes");
      if (savedPasses) setStudentPasscodes(JSON.parse(savedPasses));

      const savedSessions = localStorage.getItem("ftth_active_sessions");
      if (savedSessions) setActiveSessions(JSON.parse(savedSessions));
    } catch (e) {}
  };

  const handleResetSinglePasscode = (studentName: string) => {
    try {
      const key = `${studentName}_${activeRombel}`;
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      const updated = { ...studentPasscodes, [key]: newCode };
      setStudentPasscodes(updated);
      localStorage.setItem("ftth_student_passcodes", JSON.stringify(updated));
      showToast(`✓ Sandi baru diterbitkan untuk ${studentName}: ${newCode}`);
    } catch (e) {}
  };

  const handleForceLogout = (studentName: string) => {
    try {
      const key = `${studentName}_${activeRombel}`;
      const updatedSessions = { ...activeSessions };
      delete updatedSessions[key];
      setActiveSessions(updatedSessions);
      localStorage.setItem("ftth_active_sessions", JSON.stringify(updatedSessions));
      showToast(`✓ Kunci sesi aktif ${studentName} berhasil dirilis.`);
    } catch (e) {}
  };

  const handleRandomizeAllPasscodes = () => {
    const students = rombelDB[activeRombel] || [];
    if (students.length === 0) return;
    
    triggerConfirm(
      "Acak Semua Sandi?",
      `Apakah Anda yakin ingin mengatur ulang pendaftaran dan mengacak sandi 4-digit untuk SEMUA ${students.length} siswa di Rombel ${activeRombel}? Siswa harus meminta sandi baru kepada Anda untuk masuk kembali.`,
      () => {
        const updatedPasscodes = { ...studentPasscodes };
        students.forEach(name => {
          const key = `${name}_${activeRombel}`;
          updatedPasscodes[key] = Math.floor(1000 + Math.random() * 9000).toString();
        });
        setStudentPasscodes(updatedPasscodes);
        localStorage.setItem("ftth_student_passcodes", JSON.stringify(updatedPasscodes));
        showToast(`✓ Berhasil mengacak ulang semua sandi di rombel ${activeRombel}!`);
      },
      "Ya, Acak Semua",
      "Batal",
      "warning"
    );
  };

  const loadAllProgress = () => {
    try {
      const allStr = localStorage.getItem("ftth_all_students_progress");
      if (allStr) {
        setAllStudentsProgress(JSON.parse(allStr));
      } else {
        setAllStudentsProgress({});
      }
    } catch (e) {
      setAllStudentsProgress({});
    }
    refreshSessionsAndPasscodes();
  };

  // Load configuration from local storage on mount
  useEffect(() => {
    // 1. Load Rombel
    const savedRombel = localStorage.getItem("ftth_rombel_db");
    if (savedRombel) {
      try {
        const parsed = JSON.parse(savedRombel);
        setRombelDB(parsed);
        const keys = Object.keys(parsed);
        if (keys.length > 0) {
          setActiveRombel(keys[0]);
          setRosterText(parsed[keys[0]].join("\n"));
        }
      } catch (e) {
        initializeDefaultRombel();
      }
    } else {
      initializeDefaultRombel();
    }

    // 2. Load custom/modified questions
    const savedQuestions = localStorage.getItem("ftth_custom_questions");
    if (savedQuestions) {
      try {
        setQuestions(JSON.parse(savedQuestions));
      } catch (e) {
        setQuestions(DEFAULT_QUESTIONS);
      }
    } else {
      setQuestions(DEFAULT_QUESTIONS);
      localStorage.setItem("ftth_custom_questions", JSON.stringify(DEFAULT_QUESTIONS));
    }

    // 3. Load all students progress & passcodes
    loadAllProgress();
  }, []);

  const initializeDefaultRombel = () => {
    const defaults = {
      "X TJKT 1": ["Adi Saputra", "Budi Hermawan", "Citra Kirana", "Dian Sastrowardoyo", "Eko Prasetyo"],
      "X TJKT 2": ["Farhan Alamsyah", "Gita Gutawa", "Hendra Wijaya", "Indah Permatasari", "Joko Widodo"],
      "X TJKT 3": ["Kiki Amelia", "Lutfi Syahputra", "Mega Utami", "Naufal Rabbani", "Oki Setiana"],
      "XI TJKT": ["Siska Ambarwati", "Taufik Hidayat", "Umar bin Khattab", "Vina Panduwinata"],
      "XII TJKT": ["Wahid Hasyim", "Xania Lovata", "Yusuf Mansur", "Zaskia Adya Mecca"]
    };
    setRombelDB(defaults);
    setActiveRombel("X TJKT 1");
    setRosterText(defaults["X TJKT 1"].join("\n"));
    localStorage.setItem("ftth_rombel_db", JSON.stringify(defaults));
  };

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  // Authenticate teacher
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234" || pinInput === "7890" || pinInput.toLowerCase() === "admin") {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("PIN Akses Salah! Gunakan PIN default: 1234");
    }
  };

  // Change active Rombel class to edit
  const handleSelectRombel = (className: string) => {
    setActiveRombel(className);
    if (rombelDB[className]) {
      setRosterText(rombelDB[className].join("\n"));
    } else {
      setRosterText("");
    }
  };

  // Save current student list text area
  const handleSaveRoster = () => {
    if (!activeRombel) return;
    const names = rosterText
      .split("\n")
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    const updated = {
      ...rombelDB,
      [activeRombel]: names
    };
    
    setRombelDB(updated);
    localStorage.setItem("ftth_rombel_db", JSON.stringify(updated));
    showToast(`✓ Roster ${activeRombel} berhasil diperbarui (${names.length} Siswa)`);
    onRefreshData();
  };

  // Create new class group
  const handleAddRombel = () => {
    const trimmed = newRombelName.trim();
    if (!trimmed) {
      triggerAlert("Nama Rombel Kosong", "Masukkan nama rombel baru!", "warning");
      return;
    }
    if (rombelDB[trimmed]) {
      triggerAlert("Rombel Ganda", "Rombel dengan nama tersebut sudah ada!", "warning");
      return;
    }

    const updated = {
      ...rombelDB,
      [trimmed]: ["Contoh Siswa 1"]
    };
    setRombelDB(updated);
    localStorage.setItem("ftth_rombel_db", JSON.stringify(updated));
    setActiveRombel(trimmed);
    setRosterText("Contoh Siswa 1");
    setNewRombelName("");
    showToast(`✓ Rombel '${trimmed}' berhasil dibuat!`);
    onRefreshData();
  };

  // Delete a class group
  const handleDeleteRombel = (className: string) => {
    if (Object.keys(rombelDB).length <= 1) {
      triggerAlert("Aksi Ditolak", "Harus ada minimal satu rombel kelas terdaftar!", "warning");
      return;
    }
    
    triggerConfirm(
      "Hapus Rombel?",
      `Apakah Anda yakin ingin menghapus Rombel '${className}' beserta seluruh daftar siswanya secara permanen?`,
      () => {
        const updated = { ...rombelDB };
        delete updated[className];
        setRombelDB(updated);
        localStorage.setItem("ftth_rombel_db", JSON.stringify(updated));
        
        const remainingKeys = Object.keys(updated);
        setActiveRombel(remainingKeys[0]);
        setRosterText(updated[remainingKeys[0]].join("\n"));
        showToast(`✓ Rombel ${className} dihapus.`);
        onRefreshData();
      },
      "Ya, Hapus Rombel",
      "Batal",
      "danger"
    );
  };

  // Save/Add evaluation question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      triggerAlert("Formulir Belum Lengkap", "Mohon lengkapi teks pertanyaan beserta 4 pilihan jawaban!", "warning");
      return;
    }

    const newQ: QuizQuestion = {
      question: newQuestionText.trim(),
      options: [
        `A. ${optA.trim()}`,
        `B. ${optB.trim()}`,
        `C. ${optC.trim()}`,
        `D. ${optD.trim()}`
      ],
      correctAnswer: correctKey,
      explanation: explanation.trim() || "Menguji pengetahuan teoritis serat optik."
    };

    const updated = [...questions, newQ];
    setQuestions(updated);
    localStorage.setItem("ftth_custom_questions", JSON.stringify(updated));
    
    // Clear form
    setNewQuestionText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectKey(0);
    setExplanation("");

    showToast(`✓ Soal #${updated.length} berhasil ditambahkan!`);
    onRefreshData();
  };

  // Delete dynamic question
  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 3) {
      triggerAlert("Batas Minimal Soal", "Harus disisakan minimal 3 soal agar kuis tetap berfungsi secara valid!", "warning");
      return;
    }
    triggerConfirm(
      "Hapus Soal Kuis?",
      `Apakah Anda yakin ingin menghapus Soal No. ${index + 1}?`,
      () => {
        const updated = questions.filter((_, idx) => idx !== index);
        setQuestions(updated);
        localStorage.setItem("ftth_custom_questions", JSON.stringify(updated));
        showToast("✓ Pertanyaan berhasil dihapus.");
        onRefreshData();
      },
      "Ya, Hapus",
      "Batal",
      "danger"
    );
  };

  // Reset questions to standard default initial set
  const handleResetQuestions = () => {
    triggerConfirm(
      "Restore Bank Soal?",
      "Ingin merestore bank soal instruksional ke 5 Soal utama kurikulum? Seluruh custom soal tambahan Anda akan terhapus.",
      () => {
        setQuestions(DEFAULT_QUESTIONS);
        localStorage.setItem("ftth_custom_questions", JSON.stringify(DEFAULT_QUESTIONS));
        showToast("✓ Bank soal berhasil di-reset ke standard K3LH & OTDR default.");
        onRefreshData();
      },
      "Ya, Setel Ulang",
      "Batal",
      "warning"
    );
  };

  // Reset entire database to default initial values
  const handleResetEverything = () => {
    triggerConfirm(
      "Format Seluruh Data?",
      "Apakah Anda yakin ingin mengembalikan seluruh database rombel dan kuis ke setelan pabrik laboratorium? Semua data baru Anda akan hilang.",
      () => {
        initializeDefaultRombel();
        setQuestions(DEFAULT_QUESTIONS);
        localStorage.setItem("ftth_custom_questions", JSON.stringify(DEFAULT_QUESTIONS));
        showToast("✓ Seluruh database lab berhasil di-setel ulang.");
        onRefreshData();
      },
      "Ya, Format Data",
      "Batal",
      "danger"
    );
  };

  const handleExportCSV = () => {
    const students = rombelDB[activeRombel] || [];
    if (students.length === 0) {
      triggerAlert("Ekspor Gagal", "Daftar siswa kosong pada rombel ini.", "warning");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Nama Lengkap,Kelas/Rombel,Materi 1 (K3LH & Kupas),Materi 2 (Splicer),Materi 3 (OTDR),Kompetensi Kuis (%),Analisis Hasil & Rekomendasi\n";

    students.forEach((name, idx) => {
      const dbKey = `${name}_${activeRombel}`;
      const prog = allStudentsProgress[dbKey] || {
        m1Completed: false,
        m2Completed: false,
        m3Completed: false,
        quizCompleted: false,
        quizScore: -1
      };

      const m1Str = prog.m1Completed ? "SELESAI" : "BELUM";
      const m2Str = prog.m2Completed ? "SELESAI" : "BELUM";
      const m3Str = prog.m3Completed ? "SELESAI" : "BELUM";
      const quizStr = prog.quizScore >= 0 ? `${prog.quizScore}%` : "BELUM UJIAN";

      let analysis = "Belum Mulai Praktikum";
      if (prog.m1Completed || prog.m2Completed || prog.m3Completed) {
        if (prog.quizScore >= 70) {
          analysis = "Sangat Baik - Kompeten Lulus";
        } else if (prog.quizScore >= 0) {
          analysis = "Remedial - Perlu Bimbingan Pengulangan Kuis";
        } else {
          analysis = "Sedang Belajar - Belum Ujian";
        }
      }

      csvContent += `${idx + 1},"${name}","${activeRombel}",${m1Str},${m2Str},${m3Str},${quizStr},"${analysis}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Praktikum_FTTH_${activeRombel.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Hasil Rombel ${activeRombel} diekspor ke CSV.`);
  };

  const handleResetStudentProgress = (studentName: string) => {
    triggerConfirm(
      "Reset Nilai & Progress?",
      `Apakah Anda yakin ingin menyetel ulang seluruh kemajuan belajar, modul, dan nilai kuis untuk siswa '${studentName}'? Hal ini akan menghapus log prestasinya secara permanen agar ia bisa mengulang dari awal.`,
      () => {
        const dbKey = `${studentName}_${activeRombel}`;
        const updated = { ...allStudentsProgress };
        delete updated[dbKey];
        setAllStudentsProgress(updated);
        localStorage.setItem("ftth_all_students_progress", JSON.stringify(updated));

        // ALSO if they are currently logged in under this name, wipe that progress cache too
        const currentStudentStr = localStorage.getItem("ftth_student");
        if (currentStudentStr) {
          try {
            const cur = JSON.parse(currentStudentStr);
            if (cur.name === studentName && cur.classRoom === activeRombel) {
              localStorage.removeItem("ftth_progress");
              localStorage.removeItem("ftth_student");
            }
          } catch(e){}
        }

        showToast(`✓ Progress ${studentName} telah disetel ulang.`);
        onRefreshData();
      },
      "Ya, Setel Ulang",
      "Batal",
      "warning"
    );
  };

  // Security Gate layout rendering if not authed
  if (!isAuthenticated) {
    return (
      <div id="teacher-gate-screen" className="flex flex-col items-center justify-center h-full w-full p-4 text-white bg-slate-950 font-mono">
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl w-full max-w-sm text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-850">
            <Lock className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Akses Portal Guru & Pengawas</h3>
            <p className="text-[10px] text-slate-500 font-sans leading-normal">
              Masukkan Kode PIN validator untuk mengkonfigurasi sistem rombel kelas, menyunting nama peserta otomatis, dan menyisipkan soal evaluasi kuis secara mandiri.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-1">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Masukkan PIN Akses Instruktur..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-center text-xs text-cyan-400 font-semibold focus:outline-none focus:border-cyan-500 transition-all placeholder:text-[10px]"
              autoFocus
            />
            {pinError && <p className="text-[9.5px] text-rose-455 font-sans font-bold text-rose-400">{pinError}</p>}
            
            <p className="text-[8.5px] text-slate-650 bg-slate-950/50 p-1.5 rounded text-center">
              Petunjuk: PIN Standard Instruktur Guru adalah <strong className="text-cyan-500">1234</strong>
            </p>

            <div className="flex gap-2 pt-1 font-sans">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-2 px-3 text-xs bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Active Authenticated Panel Layout
  return (
    <div id="teacher-panel-dashboard" className="flex flex-col h-full w-full p-4 text-white bg-slate-950 relative overflow-hidden">
      
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-cyan-900 border border-cyan-400/50 px-4 py-2 rounded-xl text-xs font-semibold text-white animate-bounce shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onBack}
            className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Keluar Panel</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest hidden sm:inline">|</span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5 font-mono">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>CONFI_SYSTEM // PANEL KENDALI GURU</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetEverything}
            title="Seka seluruh data & restore setelan dasar"
            className="px-2.5 py-1 text-[9px] font-mono rounded bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 flex items-center gap-1 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>FORMAT Pabrik</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Teacher Panel */}
      <div className="flex border-b border-slate-900 pb-2 mb-3 gap-2 shrink-0 select-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab("analytics");
            loadAllProgress();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
            activeTab === "analytics"
              ? "bg-cyan-950 text-cyan-400 border-cyan-800"
              : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>📊 1. Rekapan & Analisis Siswa</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("roster");
            loadAllProgress();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
            activeTab === "roster"
              ? "bg-cyan-950 text-cyan-400 border-cyan-800"
              : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>📋 2. Kelola Roster Kelas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("quiz");
            loadAllProgress();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
            activeTab === "quiz"
              ? "bg-cyan-950 text-cyan-400 border-cyan-800"
              : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>📝 3. Bank Soal Kuis</span>
        </button>
      </div>

      {/* Tab 1: DATA ANALYTICS & DIAGNOSTICS OF COMPLETED WORK */}
      {activeTab === "analytics" && (
        <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
          {/* Analytics Filters & Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/40 border border-slate-900 p-2.5 rounded-xl font-mono text-[10px]">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-slate-500 font-bold">Rombel:</label>
              <select
                value={activeRombel}
                onChange={(e) => setActiveRombel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-cyan-400 font-bold focus:outline-none cursor-pointer"
              >
                {Object.keys(rombelDB).map((klass) => (
                  <option key={klass} value={klass}>{klass}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa..."
                  className="bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-0.5 text-xs text-slate-200 focus:outline-none placeholder:text-[9.5px] placeholder:text-slate-700 w-[130px] sm:w-[160px]"
                />
              </div>

              <select
                value={analyticsFilter}
                onChange={(e) => setAnalyticsFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[9px] text-slate-400 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="kompeten">Lulus Kompeten (&gt;=70)</option>
                <option value="proses">Sedang Belajar</option>
                <option value="remedial">Butuh Remedial (&lt;70)</option>
                <option value="belummulai">Belum Mulai</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={loadAllProgress}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 cursor-pointer flex items-center gap-1 transition-all"
                title="Muat Ulang data"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-1.5 rounded bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-400 cursor-pointer flex items-center gap-1 font-bold transition-all"
                title="Unduh rekap nilai Rombel ke CSV/Excel"
              >
                <Download className="w-3 h-3" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>

          {/* Analytics Student Table */}
          <div className="flex-1 border border-slate-900 rounded-xl overflow-y-auto bg-slate-950/20 max-h-[225px] lg:max-h-[380px] pr-1">
            <table className="w-full text-left border-collapse table-auto">
              <thead className="bg-slate-950 sticky top-0 font-mono text-[9px] text-slate-500 uppercase border-b border-slate-900 z-10">
                <tr>
                  <th className="py-2 px-3 w-[6%]">No</th>
                  <th className="py-2 px-3 w-[32%]">Nama Lengkap & Status Analisis</th>
                  <th className="py-2 px-3 text-center w-[12%]">K3LH & M1</th>
                  <th className="py-2 px-3 text-center w-[12%]">Splice M2</th>
                  <th className="py-2 px-3 text-center w-[12%]">OTDR M3</th>
                  <th className="py-2 px-3 text-center w-[12%]">Kuis (%)</th>
                  <th className="py-2 px-3 text-center w-[14%]">Seka / Reset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-sans text-[11px] text-slate-300">
                {(() => {
                  const students = rombelDB[activeRombel] || [];
                  const filtered = students.filter(name => {
                    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
                    const dbKey = `${name}_${activeRombel}`;
                    const prog = allStudentsProgress[dbKey] || {
                      m1Completed: false,
                      m2Completed: false,
                      m3Completed: false,
                      quizCompleted: false,
                      quizScore: -1
                    };

                    if (analyticsFilter === "all") return matchesSearch;
                    
                    const isM1 = prog.m1Completed;
                    const isM2 = prog.m2Completed;
                    const isM3 = prog.m3Completed;
                    const isQuiz = prog.quizScore >= 0;
                    const hasStarted = isM1 || isM2 || isM3 || isQuiz;

                    if (analyticsFilter === "kompeten") {
                      return matchesSearch && isQuiz && prog.quizScore >= 70;
                    }
                    if (analyticsFilter === "remedial") {
                      return matchesSearch && isQuiz && prog.quizScore < 70;
                    }
                    if (analyticsFilter === "belummulai") {
                      return matchesSearch && !hasStarted;
                    }
                    if (analyticsFilter === "proses") {
                      return matchesSearch && hasStarted && (!isQuiz || prog.quizScore < 0);
                    }
                    return matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="py-10 text-center font-mono text-xs text-slate-600">
                          Tidak ada data belajar siswa dalam rombel ini.
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((name, idxOriginal) => {
                    const originIndex = students.indexOf(name);
                    const dbKey = `${name}_${activeRombel}`;
                    const prog = allStudentsProgress[dbKey] || {
                      m1Completed: false,
                      m2Completed: false,
                      m3Completed: false,
                      quizCompleted: false,
                      quizScore: -1
                    };

                    const quizStatusText = prog.quizScore >= 0 ? `${prog.quizScore}%` : "—";
                    const isCompetent = prog.quizScore >= 70;
                    const isRemedial = prog.quizScore >= 0 && prog.quizScore < 70;
                    const hasStarted = prog.m1Completed || prog.m2Completed || prog.m3Completed;

                    let statusBubble = (
                      <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold bg-slate-900 text-slate-500 border border-slate-800">
                        Belum Mulai Praktikum
                      </span>
                    );
                    if (isCompetent) {
                      statusBubble = (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-900/60">
                          Sangat Baik - Lulus Kompeten
                        </span>
                      );
                    } else if (isRemedial) {
                      statusBubble = (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold bg-rose-950/80 text-rose-455 text-rose-400 border border-rose-900/60">
                          Remedial - Perlu Bimbingan Ulang
                        </span>
                      );
                    } else if (hasStarted) {
                      statusBubble = (
                        <span className="px-2 py-0.5 rounded text-[8.5px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-900/60">
                          Proses Membaca Materi (Belum Kuis)
                        </span>
                      );
                    }

                    return (
                      <tr key={dbKey} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-2 px-3 font-mono text-slate-500 text-[10px]">{originIndex + 1}</td>
                        <td className="py-2 px-3 py-1.5 font-medium text-slate-100">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-200">{name}</span>
                              
                              {/* Passcode Badge */}
                              <span className="inline-flex items-center gap-1 bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 font-mono text-[9px] px-1.5 py-0.5 rounded select-none cursor-default" title="Password unik masuk praktikum">
                                🔑 <span className="font-bold">{studentPasscodes[dbKey] || "1234"}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleResetSinglePasscode(name)}
                                className="p-0.5 text-slate-600 hover:text-cyan-400 rounded hover:bg-slate-900 transition-all cursor-pointer"
                                title="Acak Sandi Baru untuk siswa ini"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                              </button>

                              {/* Active session lock indicators */}
                              {(() => {
                                const activeSes = activeSessions[dbKey];
                                const isOnline = activeSes && (Date.now() - activeSes.lastActive < 15000);
                                if (isOnline) {
                                  return (
                                    <span className="inline-flex items-center gap-1 bg-emerald-900/10 border border-emerald-550/20 text-emerald-400 text-[8.5px] px-1 py-0.5 rounded font-mono font-bold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                      AKTIF
                                      <button
                                        type="button"
                                        onClick={() => handleForceLogout(name)}
                                        className="ml-1 text-rose-455 text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
                                        title="Rilis Kunci (Logout pemaksaan sesi siswa ini)"
                                      >
                                        [Rilis Guru]
                                      </button>
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <div className="mt-0.5 flex items-center">
                              {statusBubble}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {prog.m1Completed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 font-bold font-mono text-[9px]" title="Selesai membaca">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 text-slate-750 border border-slate-900 font-bold font-mono text-[9px]" title="Belum dibuka">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {prog.m2Completed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 font-bold font-mono text-[9px]" title="Selesai membaca">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 text-slate-750 border border-slate-900 font-bold font-mono text-[9px]" title="Belum dibuka">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {prog.m3Completed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 font-bold font-mono text-[9px]" title="Selesai membaca">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 text-slate-750 border border-slate-900 font-bold font-mono text-[9px]" title="Belum dibuka">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center text-xs font-mono font-bold">
                          <span className={prog.quizScore >= 70 ? "text-emerald-400" : prog.quizScore >= 0 ? "text-red-400" : "text-slate-605"}>
                            {quizStatusText}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleResetStudentProgress(name)}
                            disabled={!hasStarted && prog.quizScore < 0}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              (!hasStarted && prog.quizScore < 0)
                                ? "text-slate-800 cursor-not-allowed"
                                : "text-slate-500 hover:text-cyan-400 hover:bg-slate-900"
                            }`}
                            title="Reset progres siswa"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: ROSTER CLASS & STUDENTS MAKER */}
      {activeTab === "roster" && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch min-h-0 overflow-y-auto max-h-[295px] lg:max-h-[420px] pr-1">
          {/* Left Column: List of class groups */}
          <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-col justify-between font-mono">
            <div className="space-y-2 flex-1 flex flex-col">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1 border-b border-slate-800 pb-1.5">
                <Users className="w-3.5 h-3.5" />
                Pilih Kelas (Rombel)
              </span>

              <div className="flex flex-wrap gap-1.5 py-1 overflow-y-auto max-h-[100px] lg:max-h-[180px]">
                {Object.keys(rombelDB).map((klass) => (
                  <div 
                    key={klass}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border ${
                      activeRombel === klass 
                        ? "bg-cyan-950 text-cyan-400 border-cyan-800" 
                        : "bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800 cursor-pointer"
                    }`}
                    onClick={() => handleSelectRombel(klass)}
                  >
                    <span className="truncate max-w-[85px]">{klass}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRombel(klass);
                      }}
                      className="p-0.5 text-slate-650 hover:text-red-400 hover:scale-110 cursor-pointer"
                      title="Hapus Kelas"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create new Rombel input block */}
            <div className="mt-2.5 pt-2 border-t border-slate-850 space-y-1.5">
              <span className="text-[8.5px] text-slate-500 block">Buat Kelas Baru (Rombel):</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newRombelName}
                  onChange={(e) => setNewRombelName(e.target.value)}
                  placeholder="Rombel ex: XII TJKT..."
                  className="flex-1 bg-slate-950 border border-slate-850 rounded py-1 px-2 text-[10px] text-slate-100 placeholder:text-slate-700"
                  maxLength={18}
                />
                <button
                  type="button"
                  onClick={handleAddRombel}
                  className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white cursor-pointer hover:text-cyan-400 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Names Textarea */}
          <div className="md:col-span-7 bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-col justify-between font-mono">
            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-[9px] text-cyan-400 font-bold mb-1.5 flex justify-between items-center bg-slate-950/20 p-1.5 rounded border border-slate-900">
                <span>Daftar Siswa {activeRombel} ({rombelDB[activeRombel]?.length || 0} Siswa):</span>
                <span className="text-slate-550 italic text-[8.5px]">1 nama per baris</span>
              </label>
              <textarea
                value={rosterText}
                onChange={(e) => setRosterText(e.target.value)}
                placeholder="Salin/Ketik daftar nama di sini..."
                className="flex-1 w-full bg-slate-950 border border-slate-900 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-800 font-sans resize-none placeholder:text-slate-700 min-h-[110px]"
              />
            </div>

            <div className="grid grid-cols-12 gap-2 mt-2.5">
              <button
                type="button"
                onClick={handleSaveRoster}
                className="col-span-8 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Nama Rombel {activeRombel}</span>
              </button>

              <button
                type="button"
                onClick={handleRandomizeAllPasscodes}
                className="col-span-4 py-1.5 rounded-lg bg-amber-600/25 hover:bg-amber-600 border border-amber-800/70 hover:border-amber-500 text-amber-400 hover:text-slate-950 shadow font-bold text-xs flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98] transition-all"
                title="Generasikan sandi baru acak untuk semua siswa di rombel ini"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acak Sandi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DYNAMIC EVALUATION KUIS QUESTION BUILDER */}
      {activeTab === "quiz" && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch min-h-0 overflow-y-auto max-h-[295px] lg:max-h-[420px] pr-1">
          {/* Left part: list of questions */}
          <div className="md:col-span-5 bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-col min-h-0 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-1.5 font-mono">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Daftar Soal ({questions.length})
                </span>
                <button
                  type="button"
                  onClick={handleResetQuestions}
                  className="text-[8.5px] text-amber-500 hover:text-amber-400 flex items-center gap-0.5 cursor-pointer"
                  title="Urungkan custom, reset ke default"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Setel Default</span>
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[190px] lg:max-h-[280px] pr-1">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-slate-955 bg-slate-950 border border-slate-900 rounded-lg p-2 flex items-start justify-between gap-1.5">
                    <div className="space-y-1 font-sans text-[10px] leading-snug">
                      <div className="font-mono text-[8.5px] text-slate-500 font-bold">
                        SOAL #{idx + 1}
                        <span className="ml-1.5 bg-cyan-950 border border-cyan-900/60 px-1 text-cyan-400 rounded text-[8px]">
                          KUNCI: {["A", "B", "C", "D"][q.correctAnswer]}
                        </span>
                      </div>
                      <p className="text-slate-200 line-clamp-1">{q.question}</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1 text-slate-600 hover:text-rose-455 hover:bg-rose-950/20 rounded cursor-pointer transition-colors shrink-0"
                      title="Hapus Pertanyaan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right part: Add question Form */}
          <div className="md:col-span-7 bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-col min-h-0 overflow-y-auto">
            <form onSubmit={handleAddQuestion} className="space-y-2">
              <span className="text-[9.5px] font-mono font-bold text-cyan-400 border-b border-slate-800 pb-1.5 block">
                Tambah Soal Kuis Pilihan Ganda Baru:
              </span>

              <div className="space-y-2 font-sans text-xs">
                {/* Question */}
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Ketik deskripsi pertanyaan baru..."
                  className="w-full bg-slate-950 border border-slate-900 rounded-lg p-2 text-xs text-white placeholder-slate-705 placeholder:text-slate-700 focus:outline-none focus:border-cyan-800"
                />

                {/* Grid ABCD Options */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="flex items-center bg-slate-950 border border-slate-900 rounded-lg p-1">
                    <span className="font-mono font-bold text-cyan-500 px-1 shrink-0 text-[10px]">A</span>
                    <input
                      type="text"
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      placeholder="Pilihan A..."
                      className="w-full bg-transparent focus:outline-none px-1 text-slate-200"
                    />
                  </div>
                  <div className="flex items-center bg-slate-950 border border-slate-900 rounded-lg p-1">
                    <span className="font-mono font-bold text-cyan-500 px-1 shrink-0 text-[10px]">B</span>
                    <input
                      type="text"
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      placeholder="Pilihan B..."
                      className="w-full bg-transparent focus:outline-none px-1 text-slate-200"
                    />
                  </div>
                  <div className="flex items-center bg-slate-950 border border-slate-900 rounded-lg p-1">
                    <span className="font-mono font-bold text-cyan-500 px-1 shrink-0 text-[10px]">C</span>
                    <input
                      type="text"
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      placeholder="Pilihan C..."
                      className="w-full bg-transparent focus:outline-none px-1 text-slate-200"
                    />
                  </div>
                  <div className="flex items-center bg-slate-950 border border-slate-900 rounded-lg p-1">
                    <span className="font-mono font-bold text-cyan-500 px-1 shrink-0 text-[10px]">D</span>
                    <input
                      type="text"
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      placeholder="Pilihan D..."
                      className="w-full bg-transparent focus:outline-none px-1 text-slate-200"
                    />
                  </div>
                </div>

                {/* Correct answer list selection and explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-0.5">
                  <div className="sm:col-span-4 flex items-center gap-1 bg-slate-950 border border-slate-900 rounded-lg px-2 py-1">
                    <span className="font-mono text-[9px] text-slate-500 uppercase tracking-tight">Kunci:</span>
                    <select
                      value={correctKey}
                      onChange={(e) => setCorrectKey(parseInt(e.target.value))}
                      className="flex-1 bg-transparent border-none text-cyan-400 font-bold font-mono focus:outline-none cursor-pointer text-[11px]"
                    >
                      <option value={0}>Opsi A</option>
                      <option value={1}>Opsi B</option>
                      <option value={2}>Opsi C</option>
                      <option value={3}>Opsi D</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Alasan pedagogis..."
                    className="sm:col-span-8 bg-slate-950 border border-slate-900 rounded-lg px-2 py-1 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-emerald-450 hover:text-emerald-400 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.99]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simpan & Sisipkan Pertanyaan Baru</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Control footer instruction */}
      <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between items-center bg-slate-950 shrink-0 font-mono text-[9.5px] text-slate-500">
        <div>
          *Seluruh modifikasi kelas, nama siswa, dan jumlah soal disimpan langsung ke memori internal browser (Local Storage) PC/Lab ini.
        </div>
        <div className="text-cyan-600">
          Ujian otomatis dikalibrasi ke (%) berdasarkan jumlah soal aktif.
        </div>
      </div>

      {/* High-fidelity Custom Dialog bypassing standard iframe-blocked alert/confirm pitfalls */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`bg-slate-900 border ${
            dialog.styleType === "danger" ? "border-rose-900/80" :
            dialog.styleType === "warning" ? "border-amber-850" :
            dialog.styleType === "success" ? "border-emerald-900/80" : "border-slate-800"
          } p-5 rounded-2xl w-full max-w-sm text-center shadow-2xl space-y-4`}>
            
            <div className="space-y-1">
              <h4 className={`text-sm font-bold uppercase tracking-wider ${
                dialog.styleType === "danger" ? "text-rose-400" :
                dialog.styleType === "warning" ? "text-amber-400" :
                dialog.styleType === "success" ? "text-emerald-400" : "text-cyan-400"
              }`}>
                {dialog.title}
              </h4>
              <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                {dialog.message}
              </p>
            </div>

            <div className="flex gap-2 pt-1 font-sans justify-center">
              {!dialog.isAlertOnly && (
                <button
                  type="button"
                  onClick={() => setDialog(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2 px-3 text-xs bg-slate-950 hover:bg-slate-805 hover:bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors cursor-pointer"
                >
                  {dialog.cancelText || "Batal"}
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  if (!dialog.isAlertOnly && dialog.onConfirm) {
                    dialog.onConfirm();
                  } else {
                    setDialog(prev => ({ ...prev, isOpen: false }));
                  }
                }}
                className={`py-2 px-4 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                  dialog.isAlertOnly ? "w-28 text-slate-955 bg-cyan-400 text-slate-950 hover:bg-cyan-300 mx-auto" : "flex-1"
                } ${
                  dialog.styleType === "danger" ? "bg-rose-600 hover:bg-rose-500 text-white" :
                  dialog.styleType === "warning" ? "bg-amber-600 hover:bg-amber-500 text-white" :
                  dialog.styleType === "success" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-slate-950"
                }`}
              >
                {dialog.confirmText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
