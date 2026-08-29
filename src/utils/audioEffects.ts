// Web Audio API Synthesizer and Audio Effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play Siri-like pleasant activation chime (double rising chime)
 */
export function playActivationChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.23);
  } catch (e) {
    console.warn("Audio chime failed:", e);
  }
}

/**
 * Play success/confirmation tone
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {
    console.warn("Audio chime failed:", e);
  }
}

/**
 * Play timer completion alarm chime
 */
export function playTimerAlarmTone() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const startTime = now + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, startTime);
      osc.frequency.setValueAtTime(1046.5, startTime + 0.08);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.17);
    }
  } catch (e) {
    console.warn("Alarm tone failed:", e);
  }
}

/**
 * Play PCM Audio from Gemini TTS
 */
export async function playPcmAudio(base64Audio: string, sampleRate = 24000): Promise<void> {
  const binaryString = window.atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  const ctx = getAudioContext();
  const audioBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Array);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);

  return new Promise((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
}

/**
 * Ambient Synthesizer for Music/Media playback demo
 */
class AmbientSynthesizer {
  private isPlaying = false;
  private intervalId: any = null;
  private currentGenre = "lofi";

  start(genre = "lofi") {
    if (this.isPlaying) this.stop();
    this.isPlaying = true;
    this.currentGenre = genre;

    const chords: Record<string, number[][]> = {
      lofi: [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 349.23], // G7
      ],
      jazz: [
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [196.00, 246.94, 293.66, 349.23], // G7
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
      ],
      synthwave: [
        [130.81, 196.00, 261.63, 329.63],
        [146.83, 220.00, 293.66, 349.23],
        [164.81, 246.94, 329.63, 392.00],
      ],
      ambient: [
        [196.00, 293.66, 392.00, 587.33],
        [220.00, 329.63, 440.00, 659.25],
      ],
    };

    const chordList = chords[genre.toLowerCase()] || chords.lofi;
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isPlaying) return;
      try {
        const ctx = getAudioContext();
        const chord = chordList[chordIdx % chordList.length];
        chordIdx++;

        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = genre === "synthwave" ? "sawtooth" : "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1200, ctx.currentTime);

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.04 / (i + 1), ctx.currentTime + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 3.0);
        });
      } catch (e) {
        console.warn("Synth play error:", e);
      }
    };

    playChord();
    this.intervalId = setInterval(playChord, 3000);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getStatus() {
    return this.isPlaying;
  }
}

export const musicSynth = new AmbientSynthesizer();
