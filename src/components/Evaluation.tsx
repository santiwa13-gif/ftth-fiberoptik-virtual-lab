import React, { useState } from "react";
import { AppScreen, QuizQuestion } from "../types";
import { ArrowLeft, Award, CheckCircle, XCircle, RefreshCw, Printer, ShieldCheck } from "lucide-react";

interface EvaluationProps {
  onBack: () => void;
  onSetScore: (score: number) => void;
  studentName: string;
  studentClass: string;
  savedScore?: number;
}

// Default initial question pool
const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    question: "Manakah tindakan K3LH yang paling tepat untuk mengamankan sisa patahan core kaca (glass shards) mikro setelah proses pengupasan dan pemotongan?",
    options: [
      "A. Menyeka patahan menggunakan jari tangan kosong lalu membuangnya ke tempat sampah umum.",
      "B. Meniup sisa patahan dari meja kerja agar terbang jatuh bebas ke lantai lab.",
      "C. Mengambil serpihan tajam kaca memakai lem isolasi (tape) dan menyimpannya di wadah pembuangan tertutup (disposal vessel).",
      "D. Menyiram meja kerja dengan air mengalir langsung agar serpihan terlarut ke selokan."
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

export default function Evaluation({ 
  onBack, 
  onSetScore, 
  studentName, 
  studentClass,
  savedScore = -1
}: EvaluationProps) {
  const [questions] = useState<QuizQuestion[]>(() => {
    const saved = localStorage.getItem("ftth_custom_questions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_QUESTIONS;
  });

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(() => {
    const saved = localStorage.getItem("ftth_custom_questions");
    let len = 5;
    if (saved) {
      try {
        len = JSON.parse(saved).length;
      } catch (e) {}
    }
    return Array(len).fill(-1);
  });
  const [submitted, setSubmitted] = useState(savedScore >= 0);
  const [score, setScore] = useState(savedScore >= 0 ? savedScore : 0);

  const handleSelectOption = (optIdx: number) => {
    const updated = [...selectedAnswers];
    updated[currentQuestion] = optIdx;
    setSelectedAnswers(updated);
    
    // Play instant sound feedback
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.value = 520;
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (_) {}
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Calculate total score
    let correctCount = 0;
    selectedAnswers.forEach((ans, idx) => {
      if (idx < questions.length && ans === questions[idx].correctAnswer) {
        correctCount += 1;
      }
    });
    const finalScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    setScore(finalScore);
    setSubmitted(true);
    onSetScore(finalScore);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(Array(questions.length).fill(-1));
    setSubmitted(false);
    setScore(0);
    onSetScore(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  const passingGrade = 80;
  const isPassed = score >= passingGrade;

  return (
    <div id="evaluation-screen" className="flex flex-col h-full w-full p-4 text-white bg-slate-950 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            id="btn-eval-back"
            onClick={onBack}
            className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 transition-colors text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest hidden sm:inline">|</span>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Uji Kompetensi Keahlian TJKT (FTTH VirtuaLab)
          </h3>
        </div>

        <div className="text-xs font-mono bg-slate-900 px-2 rounded border border-slate-850 text-slate-400">
          Ujian: <strong className="text-cyan-400">{submitted ? "Selesai Evaluasi" : `Pertanyaan ${currentQuestion + 1} dari ${questions.length}`}</strong>
        </div>
      </div>

      {/* Main Container screen */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col justify-center pb-2">
        {!submitted ? (
          /* Active Quiz Interface */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            
            {/* Left Box: Active Question & Choices */}
            <div className="md:col-span-8 bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[235px] lg:min-h-[340px]">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-900 px-2.5 py-0.5 rounded tracking-wide uppercase">
                    SOAL PILIHAN GANDA • NO. {currentQuestion + 1}
                  </span>
                  
                  {/* Step indicator required by user */}
                  <span className="text-[9.5px] font-mono text-cyan-500 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-900 animate-pulse-slow">
                    Langkah 4 dari 4: Uji Kompetensi Teori & Prosedur
                  </span>
                </div>
                
                <h4 className="font-semibold text-xs sm:text-sm text-slate-100 leading-relaxed md:max-h-[70px] overflow-y-auto">
                  {questions[currentQuestion].question}
                </h4>
              </div>

              {/* Multiple Choice Options List */}
              <div id="quiz-options-list" className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {questions[currentQuestion].options.map((opt, oIdx) => {
                  const isChose = selectedAnswers[currentQuestion] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      id={`option-btn-${oIdx}`}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-2.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                        isChose 
                          ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.1)]" 
                          : "bg-slate-950/80 border-slate-900 text-slate-350 hover:border-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Steps control bar */}
              <div className="flex justify-between items-center border-t border-slate-850 pt-2.5 mt-2">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className={`py-1 px-3 rounded font-mono text-[10px] cursor-pointer ${
                    currentQuestion === 0 ? "text-slate-700 bg-transparent cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  &larr; Prev
                </button>

                <div className="flex items-center gap-1">
                  {selectedAnswers.map((ans, idx) => (
                    <span 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full ${
                        idx === currentQuestion 
                          ? "bg-cyan-400 animate-ping" 
                          : ans !== -1 
                            ? "bg-emerald-500" 
                            : "bg-slate-800"
                      }`}
                    ></span>
                  ))}
                </div>

                {currentQuestion < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={selectedAnswers[currentQuestion] === -1}
                    className={`py-1 px-3 rounded font-mono text-[10px] cursor-pointer ${
                      selectedAnswers[currentQuestion] === -1 
                        ? "text-slate-650 bg-slate-900/40 border border-slate-850 cursor-not-allowed" 
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    }`}
                  >
                    Next &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswers.some(x => x === -1)}
                    className={`py-1.5 px-4 rounded-lg text-[10px] font-bold font-sans cursor-pointer transition-all ${
                      selectedAnswers.some(x => x === -1)
                        ? "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                    }`}
                  >
                    Submit Jawaban
                  </button>
                )}
              </div>

            </div>

            {/* Right Box: Vocational guidance tips */}
            <div className="md:col-span-4 bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[235px] lg:min-h-[340px]">
              <div className="space-y-3.5">
                <span className="text-[10px] font-mono text-slate-450 uppercase pl-0.5">PETUNJUK KKM JURUSAN</span>
                
                <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-lg text-[11px] leading-relaxed text-cyan-200">
                  <h5 className="font-bold flex items-center gap-1.5 mb-1 text-cyan-300">
                    <ShieldCheck className="w-4 h-4" /> Syarat Kelulusan Lab Maya
                  </h5>
                  Minimal kelulusan penguasaan teori adalah <strong>Skor {passingGrade}%</strong> (Menjawab benar minimal 4 dari 5 soal).
                  Gunakan pengetahuan K3LH, teknik potong Cleaver, batas redaman fusi, dan analisa OTDR yang didapat sepanjang praktikum simulasi.
                </div>
              </div>

              <div className="font-mono text-[9px] text-slate-500 leading-tight">
                SMK TEKNIK JARINGAN KOMPUTER & TELEKOMUNIKASI FASE E. 
                <br />UJI KOMPETENSI TEORI & PROSEDUR STANDARD INDUSTRI.
              </div>
            </div>

          </div>
        ) : (
          /* Result & E-Certificate Print Interface */
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 p-1">
            
            {/* Left box: Score summary details */}
            <div className="w-full md:w-[300px] bg-slate-900/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between min-h-[235px] lg:min-h-[340px] shrink-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-[10px] font-mono text-slate-450 font-bold">LATIHAN SELESAI</span>
                  <span className="text-[10px] font-mono text-slate-505 font-bold">KKM: 80%</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isPassed ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-450"}`}>
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-200">Format Evaluasi Teori</h4>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isPassed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-450"
                    }`}>
                      {isPassed ? "KOMPETEN (LULUS)" : "BELUM KOMPETEN (REMEDIAL)"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-center">
                  <span className="text-[8px] font-mono text-slate-500 block">TOTAL SKOR AKHIR</span>
                  <strong className={`text-2xl font-black font-mono block ${isPassed ? "text-emerald-400" : "text-rose-450"}`}>
                    {score}%
                  </strong>
                </div>

                {/* Scoreboard contextual feedback based on threshold */}
                <p className="text-[10px] text-slate-350 text-center leading-normal font-semibold p-1.5 bg-slate-950/40 rounded border border-slate-850/50">
                  {isPassed 
                    ? "Selamat! Anda Kompeten dan Siap Praktik di Lab Fisik!" 
                    : "Nilai belum memenuhi standar. Silakan eksplorasi kembali modul lab maya untuk mendalami materi."}
                </p>
              </div>

              <div className="flex gap-2 shrink-0 pt-2 mt-2 border-t border-slate-850">
                <button
                  onClick={resetQuiz}
                  className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-350 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ulangi Ujian</span>
                </button>
              </div>
            </div>

            {/* Right box: The Beautiful E-Certificate display card */}
            <div className="flex-1 w-full bg-white rounded-xl border border-slate-300 p-4 shadow-xl text-slate-900 flex flex-col justify-between min-h-[235px] lg:min-h-[340px] relative font-sans select-text [print-color-adjust:exact]">
              {/* Certificate subtle border patterns */}
              <div className="absolute inset-1.5 border border-dashed border-amber-500/30 rounded pointer-events-none z-0"></div>
              
              {/* Background watermark badge layout */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-[120px] h-[120px] fill-amber-700">
                  <polygon points="50,10 90,80 10,80" />
                </svg>
              </div>

              <div className="text-center space-y-1 z-10 shrink-0">
                <h3 className="font-mono text-[9px] font-extrabold tracking-widest text-amber-600 uppercase">
                  SERTIFIKAT KELULUSAN MAHASISWA LAB MAYA
                </h3>
                <h4 className="font-serif font-black text-xs md:text-sm text-slate-850 tracking-tight leading-none">
                  OPERATOR SERAT OPTIK & FTTH FASE E
                </h4>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-1"></div>
              </div>

              <div className="text-center space-y-1.5 z-10 py-1.5">
                <span className="text-[8px] font-serif text-slate-500 italic block leading-none">Diberikan secara sah kepada:</span>
                <strong className="text-sm md:text-base font-bold text-slate-950 border-b border-dashed border-slate-400 pb-0.5 px-4 block w-max mx-auto capitalize tracking-tight leading-none">
                  {studentName}
                </strong>
                <span className="text-[8.5px] text-slate-600 block leading-tight font-mono">
                  Siswa Kelas: <strong>{studentClass}</strong> • Nilai Kelulusan: <strong className="text-emerald-700">{score}%</strong>
                </span>
                <p className="text-[7.5px] text-slate-450 leading-relaxed max-w-md mx-auto italic">
                  Dinyatakan KOMPETEN dalam keselamatan kerja K3LH serat optik, memotong presisi memakai Cleaver, mengelas core kaca, serta mendiagnosis grafik redaman OTDR sesuai standar kurikulum TJKT.
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-slate-200 pt-2 z-10 shrink-0">
                {/* Stamp */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-[36px] h-[36px] rounded-full border-2 border-dashed flex flex-col justify-center items-center text-[7.5px] font-bold font-mono rotate-[-6deg] ${
                    isPassed ? "border-emerald-600 text-emerald-600" : "border-rose-600 text-rose-600"
                  }`}>
                    <span>OK PASS</span>
                    <span>{score}</span>
                  </div>
                  <div className="text-[7px] text-slate-400 font-mono leading-none">
                    <span>SEALED BY:</span>
                    <br />
                    <strong className="text-slate-600">FTTH VIRTUALAB</strong>
                  </div>
                </div>

                {/* Print button */}
                <button
                  id="btn-print-certificate"
                  onClick={handlePrint}
                  className="bg-slate-900 hover:bg-slate-800 text-white py-1 px-3.5 rounded text-[8.5px] font-bold flex items-center gap-1 hover:scale-[1.02] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Sertifikat (.PDF)</span>
                </button>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Selesaikan Modul control bar */}
      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center bg-slate-950 shrink-0">
        <p className="text-[10px] text-slate-500 font-mono">
          © FTTH VirtuaLab Indonesia. Kompetensi Kurikulum Merdeka Jurusan TJKT.
        </p>
        <button
          id="btn-eval-done"
          onClick={onBack}
          className="py-2 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold font-mono transition-colors border border-slate-805 cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </div>

    </div>
  );
}
