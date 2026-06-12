/**
 * FTTH Virtual Lab Web Audio API Synthesizer & Sound Manager
 * Provides 100% reliable local synthesis of:
 * 1. Mechanical clicks
 * 2. Pop drag/drop confirmation sounds
 * 3. Splicer high voltage discharge arc sparks
 * 4. Continuous server fan computer hum noise
 * 5. Calm instrumental background ambient music generator (generates gentle random chord pad notes dynamically)
 */

class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = false; // Off by default as per standard browser policies, can be toggled by user!
  private humEnabled: boolean = false; // Continuous drone closed by default now!

  // Nodes for loopable channels
  private humNode: OscillatorNode | null = null;
  private humFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;

  private musicIntervalId: any = null;
  private activeNotes: AudioScheduledSourceNode[] = [];
  private masterMusicGain: GainNode | null = null;

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  setHumEnabled(enabled: boolean) {
    this.humEnabled = enabled;
    if (enabled) {
      this.startAmbientHum();
    } else {
      this.stopAmbientHum();
    }
  }

  isHumEnabled(): boolean {
    return this.humEnabled;
  }

  // --- Sound Effects (Synthesized on the fly) ---

  playClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }

  playPop() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }

  playAlarm() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      
      // Pulse alarm sound (2 beeps)
      for (let i = 0; i < 2; i++) {
        const t = ctx.currentTime + i * 0.22;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.setValueAtTime(120, t + 0.15);

        gain.gain.setValueAtTime(0.07, t);
        gain.gain.setValueAtTime(0.07, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.19);
      }
    } catch (e) {}
  }

  playSplice() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.initContext();
      const duration = 1.6;
      const now = ctx.currentTime;

      // 1. Arc discharge high-voltage crackle (Spark noise using a quick oscillation of square/triangle waves)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(80, now);
      
      // Frequency rumble representing electrical arcs
      for (let i = 0; i < 30; i++) {
        osc.frequency.setValueAtTime(70 + Math.random() * 250, now + (duration * i / 30));
      }

      // 2. High-pass noisiness representing crackling
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(800, now);
      bandpass.Q.setValueAtTime(3.0, now);

      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);

      // Play a laser-like sweep alongside the arc
      const laserOsc = ctx.createOscillator();
      const laserGain = ctx.createGain();
      laserOsc.type = "sine";
      laserOsc.frequency.setValueAtTime(1800, now);
      laserOsc.frequency.exponentialRampToValueAtTime(100, now + 1.2);

      laserGain.gain.setValueAtTime(0.05, now);
      laserGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      laserOsc.connect(laserGain);
      laserGain.connect(ctx.destination);

      laserOsc.start(now);
      laserOsc.stop(now + 1.3);

    } catch (e) {}
  }

  // --- Background Ambiences (Continuous Nodes) ---

  startAmbientHum() {
    if (!this.humEnabled) return;
    try {
      const ctx = this.initContext();
      if (this.humNode) return; // Already running

      // 1. Low server hum oscillator at 55Hz (A1) and harmonic 110Hz
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(55, ctx.currentTime);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(110, ctx.currentTime);

      // Filter out high frequencies to make it a deep cozy humming
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(120, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Low background volume

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      this.humNode = osc1; // reference first oscillator to stop it later
      this.humFilter = filter;
      this.humGain = gainNode;

      // Keep reference to both oscillators for stopping
      (this.humNode as any).osc2 = osc2;
    } catch (e) {
      console.error(e);
    }
  }

  stopAmbientHum() {
    try {
      if (this.humNode) {
        this.humNode.stop();
        if ((this.humNode as any).osc2) {
          (this.humNode as any).osc2.stop();
        }
        this.humNode = null;
        this.humGain = null;
        this.humFilter = null;
      }
    } catch (e) {}
  }

  // --- Calm Ambient Instrumental Music loop (Procedural Synth) ---
  // We periodically play peaceful synthesized notes to fit "Musik: Musik latar instrumental bernada tenang"

  startAmbientMusic() {
    if (!this.musicEnabled) return;
    try {
      const ctx = this.initContext();
      if (this.musicIntervalId) return;

      this.masterMusicGain = ctx.createGain();
      this.masterMusicGain.gain.setValueAtTime(0.22, ctx.currentTime); // Louder, clearly audible premium master gain
      this.masterMusicGain.connect(ctx.destination);

      // Cyberpunk / exciting virtual lab chords (Am, F, C, G)
      const chords = [
        { name: "Am", root: 110.00, notes: [220.00, 261.63, 329.63, 440.00, 523.25] }, // A2 -> A3, C4, E4, A4, C5
        { name: "F",  root: 87.31,  notes: [174.61, 220.00, 261.63, 349.23, 440.00] }, // F2 -> F3, A3, C4, F4, A4
        { name: "C",  root: 130.81, notes: [261.63, 329.63, 392.00, 523.25, 659.25] }, // C3 -> C4, E4, G4, C5, E5
        { name: "G",  root: 98.00,  notes: [196.00, 246.94, 293.66, 392.00, 493.88] }  // G2 -> G3, B3, D4, G4, B4
      ];

      let step = 0;

      const playSequencerStep = () => {
        if (!this.musicEnabled || !this.masterMusicGain) return;
        try {
          const now = ctx.currentTime;
          
          // 8 steps per chord, 4 chords total = 32 steps loop
          const chordIndex = Math.floor((step % 32) / 8);
          const chord = chords[chordIndex];
          const subStep = step % 8; // 0 to 7

          // 1. PLAY BASS DRUM / LINE (Deeps, warm feel, every alternative beat)
          if (subStep % 2 === 0) {
            const bassOsc = ctx.createOscillator();
            const bassGain = ctx.createGain();
            
            bassOsc.type = "triangle";
            bassOsc.frequency.setValueAtTime(chord.root, now);
            
            bassGain.gain.setValueAtTime(0, now);
            bassGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            
            bassOsc.connect(bassGain);
            bassGain.connect(this.masterMusicGain);
            
            bassOsc.start(now);
            bassOsc.stop(now + 0.25);
            this.activeNotes.push(bassOsc);
          }

          // 2. PLAY DYNAMIC CHORD PAD BACKING (played slowly on the first step of each chord block to fill space)
          if (subStep === 0) {
            // Stack 3 notes of the chord for a beautiful synthesizer pad
            const padNotes = [chord.notes[0], chord.notes[1], chord.notes[2]];
            padNotes.forEach((freq, idx) => {
              const padOsc = ctx.createOscillator();
              const padGain = ctx.createGain();
              
              padOsc.type = "sine";
              padOsc.frequency.setValueAtTime(freq, now);
              
              // Slow attack and fade-out to act as a warm background organ/pad
              const padAttack = 0.4;
              const padSustain = 1.0;
              const padRelease = 0.5;
              const padDuration = padAttack + padSustain + padRelease;
              
              padGain.gain.setValueAtTime(0, now);
              padGain.gain.linearRampToValueAtTime(0.03, now + padAttack);
              padGain.gain.setValueAtTime(0.03, now + padAttack + padSustain);
              padGain.gain.exponentialRampToValueAtTime(0.001, now + padDuration);
              
              padOsc.connect(padGain);
              padGain.connect(this.masterMusicGain!);
              
              padOsc.start(now);
              padOsc.stop(now + padDuration);
              this.activeNotes.push(padOsc);
            });
          }

          // 3. PLAY LIVELY MELODIC LEAD PLUCK (bouncy synthesizer arpeggio, every beat)
          const noteIndex = [0, 1, 2, 3, 4, 3, 2, 1][subStep];
          const leadFreq = chord.notes[noteIndex];

          const leadOsc = ctx.createOscillator();
          const leadGain = ctx.createGain();

          leadOsc.type = "sine";
          leadOsc.frequency.setValueAtTime(leadFreq, now);

          // Add subtle pitch glide sweep to make it super retro and sleek!
          if (subStep === 3 || subStep === 7) {
            leadOsc.frequency.exponentialRampToValueAtTime(leadFreq * 1.5, now + 0.16);
          }

          leadGain.gain.setValueAtTime(0, now);
          leadGain.gain.linearRampToValueAtTime(0.09, now + 0.015);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          leadOsc.connect(leadGain);
          leadGain.connect(this.masterMusicGain);

          leadOsc.start(now);
          leadOsc.stop(now + 0.2);
          this.activeNotes.push(leadOsc);

          // 4. SECONDARY METALLIC HIGH TIKS (for modern high-excitement vibe, on steps 1 and 5)
          if (subStep === 2 || subStep === 6) {
            const tickOsc = ctx.createOscillator();
            const tickGain = ctx.createGain();
            tickOsc.type = "sine";
            // High slide chime
            tickOsc.frequency.setValueAtTime(12000, now);
            tickGain.gain.setValueAtTime(0, now);
            tickGain.gain.linearRampToValueAtTime(0.012, now + 0.01);
            tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            tickOsc.connect(tickGain);
            tickGain.connect(this.masterMusicGain);
            tickOsc.start(now);
            tickOsc.stop(now + 0.05);
            this.activeNotes.push(tickOsc);
          }

          step++;

          // Periodically clean up old notes reference array (keep memory low)
          if (this.activeNotes.length > 40) {
            this.activeNotes = this.activeNotes.slice(-16);
          }

        } catch (e) {}
      };

      // Play immediately, then schedules every 230ms (perfect high-energy tempo of 130 BPM)
      playSequencerStep();
      this.musicIntervalId = setInterval(playSequencerStep, 230);
      
    } catch (e) {
      console.error(e);
    }
  }

  stopAmbientMusic() {
    try {
      if (this.musicIntervalId) {
        clearInterval(this.musicIntervalId);
        this.musicIntervalId = null;
      }
      this.activeNotes.forEach(node => {
        try {
          node.stop();
        } catch (e) {}
      });
      this.activeNotes = [];
      if (this.masterMusicGain) {
        this.masterMusicGain.disconnect();
        this.masterMusicGain = null;
      }
    } catch (e) {}
  }
}

export const audioSynth = new AudioSynthManager();
