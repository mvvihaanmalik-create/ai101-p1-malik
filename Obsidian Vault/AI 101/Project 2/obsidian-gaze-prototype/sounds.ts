// Generated Web Audio only. No remote audio, files, or music.
let ctx: AudioContext | null = null;
let dry: GainNode | null = null;
let reverb: ConvolverNode | null = null;

function getCtx(): AudioContext | null {
  try {
    if (ctx) return ctx;
    ctx = new AudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.16;
    masterGain.connect(ctx.destination);

    dry = ctx.createGain();
    dry.connect(masterGain);

    reverb = ctx.createConvolver();
    const length = Math.floor(ctx.sampleRate * 0.16);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const samples = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const decay = (1 - i / length) ** 2;
        samples[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.07;
    reverb.connect(wet);
    wet.connect(masterGain);
    return ctx;
  } catch {
    // Sound is optional; image processing must still work if audio is blocked.
    ctx = null;
    dry = null;
    reverb = null;
    return null;
  }
}

function resume(): void {
  if (ctx?.state === 'suspended') void ctx.resume().catch(() => undefined);
}

function noiseBurst(at: number, frequency: number, q: number, duration: number, volume: number): void {
  const audio = getCtx();
  if (!audio || !dry || !reverb) return;
  const length = Math.max(1, Math.ceil(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) samples[i] = Math.random() * 2 - 1;

  const source = audio.createBufferSource();
  source.buffer = buffer;
  const bandpass = audio.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = frequency;
  bandpass.Q.value = q;
  const envelope = audio.createGain();
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.linearRampToValueAtTime(volume, at + 0.003);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(bandpass);
  bandpass.connect(envelope);
  envelope.connect(dry);
  envelope.connect(reverb);
  source.start(at);
  source.stop(at + duration);
  source.onended = () => {
    source.disconnect();
    bandpass.disconnect();
    envelope.disconnect();
  };
}

export function playShutter(): void {
  const audio = getCtx();
  if (!audio) return;
  resume();
  const start = audio.currentTime + 0.005;
  noiseBurst(start, 2200, 0.7, 0.024, 1.1);
  noiseBurst(start + 0.034, 2200, 0.7, 0.024, 0.75);
}

export function playFilmWind(): void {
  const audio = getCtx();
  if (!audio) return;
  resume();
  const start = audio.currentTime + 0.005;
  const levels = [0.32, 0.45, 0.38, 0.42, 0.35, 0.28];
  levels.forEach((level, i) => {
    const jitter = (Math.random() - 0.5) * 0.008;
    noiseBurst(start + i * 0.034 + jitter, 2400, 1.2, 0.018, level);
  });
}
