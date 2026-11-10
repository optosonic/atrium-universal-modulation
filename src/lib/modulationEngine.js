// Universal Modulation Engine & Parameter Definitions for Atrium 0.9 Prototype

export const MOD_COLORS = [
  '#38bdf8', // Cyan (LFO 1 default)
  '#f472b6', // Pink (Hydroswarm style)
  '#34d399', // Emerald
  '#fbbf24', // Amber
  '#a78bfa', // Violet
  '#fb7185', // Rose
  '#2dd4bf', // Teal
  '#f97316', // Orange
];

export const MODULATOR_TYPES = [
  {
    type: 'LFO',
    label: 'LFO',
    shortDesc: 'Low Frequency Oscillator',
    subtypes: ['sine', 'triangle', 'saw', 'square', 'pulse', 'custom'],
    defaultSubtype: 'sine',
  },
  {
    type: 'RANDOM',
    label: 'RANDOM',
    shortDesc: 'Stochastic & S&H Generator',
    subtypes: ['smooth', 'stepped', 's&h'],
    defaultSubtype: 'smooth',
  },
  {
    type: 'ENVELOPE',
    label: 'ENVELOPE',
    shortDesc: 'Looping Multistage / ADSR',
    subtypes: ['looping', 'adsr', 'perc'],
    defaultSubtype: 'looping',
  },
  {
    type: 'STEP',
    label: 'STEP',
    shortDesc: 'Rhythmic Step Sequencer',
    subtypes: ['8-step', '16-step', '32-step', 'euclidean'],
    defaultSubtype: '8-step',
  },
  {
    type: 'FOLLOWER',
    label: 'FOLLOWER',
    shortDesc: 'Audio-Reactive Envelope',
    subtypes: ['transient', 'rms', 'sub-band'],
    defaultSubtype: 'rms',
  },
  {
    type: 'CURVE',
    label: 'CURVE',
    shortDesc: 'Drawable Breakpoint Wave',
    subtypes: ['freeform', 'exponential', 's-curve'],
    defaultSubtype: 'freeform',
  },
  {
    type: 'MACRO',
    label: 'MACRO',
    shortDesc: 'Multi-Parameter Master Dial',
    subtypes: ['linear', 'bipolar', 'quantized'],
    defaultSubtype: 'linear',
  },
  {
    type: 'FUNCTION',
    label: 'FUNCTION',
    shortDesc: 'Mathematical & Logic Wave',
    subtypes: ['sin(x)*cos(2x)', 'chaos-logistic', 'harmonic-fold'],
    defaultSubtype: 'sin(x)*cos(2x)',
  },
];

export const INITIAL_PARAMETERS = {
  cs_width: {
    id: 'cs_width',
    name: 'Width',
    shortName: 'WIDTH',
    group: 'Channel Strip',
    plugin: 'Channel Strip Mk II',
    min: 0,
    max: 2,
    step: 0.01,
    baseValue: 1.0,
    unit: '',
    scale: 'linear',
    displayFormat: (v) => v.toFixed(2),
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/width',
  },
  cs_eq_freq: {
    id: 'cs_eq_freq',
    name: 'EQ Frequency',
    shortName: 'FREQ',
    group: 'EQ',
    plugin: 'Channel Strip Mk II',
    min: 20,
    max: 2000,
    step: 1,
    baseValue: 180,
    unit: 'Hz',
    scale: 'log',
    displayFormat: (v) => `${Math.round(v)} Hz`,
    hasAutomation: true,
    midiCC: 74,
    oscAddress: '/atrium/cs1/eq/low/freq',
  },
  cs_eq_gain: {
    id: 'cs_eq_gain',
    name: 'EQ Gain',
    shortName: 'GAIN',
    group: 'EQ',
    plugin: 'Channel Strip Mk II',
    min: -15,
    max: 15,
    step: 0.1,
    baseValue: 2.5,
    unit: 'dB',
    scale: 'linear',
    displayFormat: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} dB`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/eq/low/gain',
  },
  cs_comp_thresh: {
    id: 'cs_comp_thresh',
    name: 'Comp Threshold',
    shortName: 'THRESH',
    group: 'Channel Strip',
    plugin: 'Channel Strip Mk II',
    min: -40,
    max: 0,
    step: 0.5,
    baseValue: -14.0,
    unit: 'dB',
    scale: 'linear',
    displayFormat: (v) => `${v.toFixed(1)} dB`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/comp/thresh',
  },
  cs_in_trim: {
    id: 'cs_in_trim',
    name: 'Input Trim',
    shortName: 'IN TRIM',
    group: 'Channel Strip',
    plugin: 'Channel Strip Mk II',
    min: -20,
    max: 20,
    step: 0.1,
    baseValue: 0.0,
    unit: 'dB',
    scale: 'linear',
    displayFormat: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} dB`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/in_trim',
  },
  cs_pan: {
    id: 'cs_pan',
    name: 'Channel Pan',
    shortName: 'PAN',
    group: 'Channel Strip',
    plugin: 'Channel Strip Mk II',
    min: -100,
    max: 100,
    step: 1,
    baseValue: 0,
    unit: '',
    scale: 'linear',
    displayFormat: (v) =>
      Math.abs(v) < 2 ? 'C' : v < 0 ? `L${Math.round(Math.abs(v))}` : `R${Math.round(v)}`,
    hasAutomation: false,
    midiCC: 10,
    oscAddress: '/atrium/cs1/pan',
  },
  cs_comp_mix: {
    id: 'cs_comp_mix',
    name: 'Comp Mix',
    shortName: 'MIX',
    group: 'Channel Strip',
    plugin: 'Channel Strip Mk II',
    min: 0,
    max: 100,
    step: 1,
    baseValue: 100,
    unit: '%',
    scale: 'linear',
    displayFormat: (v) => `${Math.round(v)}%`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/comp/mix',
  },
  rev_decay: {
    id: 'rev_decay',
    name: 'Decay',
    shortName: 'DECAY',
    group: 'Reverb',
    plugin: 'HydroHall Reverb',
    min: 0.2,
    max: 12.0,
    step: 0.1,
    baseValue: 4.2,
    unit: 's',
    scale: 'linear',
    displayFormat: (v) => `${v.toFixed(1)}s`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/reverb/decay',
  },
  rev_shimmer: {
    id: 'rev_shimmer',
    name: 'Shimmer',
    shortName: 'SHIMMER',
    group: 'Reverb',
    plugin: 'HydroHall Reverb',
    min: 0,
    max: 100,
    step: 1,
    baseValue: 48,
    unit: '%',
    scale: 'linear',
    displayFormat: (v) => `${Math.round(v)}%`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/reverb/shimmer',
  },
  inst_cutoff: {
    id: 'inst_cutoff',
    name: 'Filter Cutoff',
    shortName: 'CUTOFF',
    group: 'Instrument',
    plugin: 'Spher8 Synth',
    min: 40,
    max: 16000,
    step: 10,
    baseValue: 2400,
    unit: 'Hz',
    scale: 'log',
    displayFormat: (v) => (v >= 1000 ? `${(v / 1000).toFixed(2)}k` : `${Math.round(v)}Hz`),
    hasAutomation: true,
    midiCC: 71,
    oscAddress: '/atrium/inst1/cutoff',
  },
  orbit_rotation: {
    id: 'orbit_rotation',
    name: 'Rotation',
    shortName: 'ROTATION',
    group: 'Orbit',
    plugin: '3D Orbit Stage',
    min: -180,
    max: 180,
    step: 1,
    baseValue: 0,
    unit: '°',
    scale: 'linear',
    displayFormat: (v) => `${Math.round(v)}°`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/orbit/rotation',
  },
  particle_intensity: {
    id: 'particle_intensity',
    name: 'Intensity',
    shortName: 'INTENSITY',
    group: 'Particles',
    plugin: 'HydroSwarm Particles',
    min: 0,
    max: 100,
    step: 1,
    baseValue: 64,
    unit: '%',
    scale: 'linear',
    displayFormat: (v) => `${Math.round(v)}%`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/particles/intensity',
  },
  mixer_pan: {
    id: 'mixer_pan',
    name: 'Mixer Pan',
    shortName: 'MIX PAN',
    group: 'Mixer',
    plugin: 'Track 1 Mixer',
    min: -100,
    max: 100,
    step: 1,
    baseValue: -12,
    unit: '',
    scale: 'linear',
    displayFormat: (v) =>
      Math.abs(v) < 2 ? 'C' : v < 0 ? `L${Math.round(Math.abs(v))}` : `R${Math.round(v)}`,
    hasAutomation: true,
    midiCC: null,
    oscAddress: '/atrium/mixer/ch1/pan',
  },
  mixer_vol: {
    id: 'mixer_vol',
    name: 'Track Volume',
    shortName: 'VOL',
    group: 'Mixer',
    plugin: 'Track 1 Mixer',
    min: -48,
    max: 6,
    step: 0.1,
    baseValue: 0.0,
    unit: 'dB',
    scale: 'linear',
    displayFormat: (v) => `${v.toFixed(1)} dB`,
    hasAutomation: true,
    midiCC: 7,
    oscAddress: '/atrium/mixer/ch1/vol',
  },
};

export const INITIAL_MODULATORS = [
  {
    id: 'mod_lfo_1',
    name: 'LFO 1',
    type: 'LFO',
    subtype: 'sine',
    rate: 0.85, // Hz
    syncRate: '1/4',
    tempoSync: false,
    depth: 1.0,
    phase: 0,
    offset: 0,
    smoothing: 0.1,
    polarity: 'bipolar', // 'bipolar' | 'unipolar'
    enabled: true,
    color: '#38bdf8', // Cyan
    steps: [0.8, 0.3, -0.5, 0.9, -0.2, 0.6, -0.8, 0.4],
    curvePoints: [0, 0.7, -0.4, 0.9, 0.1, -0.8, 0],
    macroValue: 0.5,
    adsr: { a: 0.18, d: 0.32, s: 0.55, r: 0.28 },
  },
  {
    id: 'mod_rnd_1',
    name: 'RANDOM 1',
    type: 'RANDOM',
    subtype: 'smooth',
    rate: 1.4,
    syncRate: '1/8',
    tempoSync: false,
    depth: 0.9,
    phase: 45,
    offset: 0,
    smoothing: 0.65,
    polarity: 'bipolar',
    enabled: true,
    color: '#f472b6', // Pink
    steps: [0.5, -0.5, 0.2, -0.8, 0.9, 0.1, -0.4, 0.7],
    curvePoints: [0, 0.4, -0.6, 0.8, -0.2, 0],
    macroValue: 0.5,
    adsr: { a: 0.2, d: 0.3, s: 0.5, r: 0.3 },
  },
  {
    id: 'mod_lfo_2',
    name: 'LFO 2',
    type: 'LFO',
    subtype: 'triangle',
    rate: 0.35,
    syncRate: '1/2',
    tempoSync: true,
    depth: 1.0,
    phase: 90,
    offset: 0,
    smoothing: 0.0,
    polarity: 'bipolar',
    enabled: true,
    color: '#34d399', // Emerald
    steps: [1, 0.5, 0, -0.5, -1, -0.5, 0, 0.5],
    curvePoints: [-1, 0, 1, 0, -1],
    macroValue: 0.5,
    adsr: { a: 0.1, d: 0.4, s: 0.6, r: 0.2 },
  },
  {
    id: 'mod_step_1',
    name: 'STEP 1',
    type: 'STEP',
    subtype: '8-step',
    rate: 2.0,
    syncRate: '1/4',
    tempoSync: true,
    depth: 0.85,
    phase: 0,
    offset: 0,
    smoothing: 0.0,
    polarity: 'unipolar',
    enabled: true,
    color: '#fbbf24', // Amber
    steps: [0.9, 0.2, 0.65, 0.1, 1.0, 0.4, 0.8, 0.3],
    curvePoints: [0, 0.5, 1, 0.5, 0],
    macroValue: 0.6,
    adsr: { a: 0.1, d: 0.2, s: 0.7, r: 0.2 },
  },
];

export const INITIAL_ASSIGNMENTS = [
  {
    id: 'asgn_1',
    modulatorId: 'mod_lfo_1',
    parameterId: 'cs_width',
    depth: 0.62,
    min: 0.15,
    max: 1.85,
    polarity: 'bipolar',
    offset: 0.0,
    invert: false,
    smoothing: 0.1,
    enabled: true,
  },
  {
    id: 'asgn_2',
    modulatorId: 'mod_lfo_1',
    parameterId: 'cs_eq_freq',
    depth: 0.45,
    min: 40,
    max: 1200,
    polarity: 'bipolar',
    offset: 0.0,
    invert: false,
    smoothing: 0.15,
    enabled: true,
  },
  {
    id: 'asgn_3',
    modulatorId: 'mod_rnd_1',
    parameterId: 'rev_decay',
    depth: 0.4,
    min: 1.0,
    max: 10.5,
    polarity: 'bipolar',
    offset: 0.05,
    invert: false,
    smoothing: 0.5,
    enabled: true,
  },
  {
    id: 'asgn_4',
    modulatorId: 'mod_lfo_2',
    parameterId: 'orbit_rotation',
    depth: 0.75,
    min: -180,
    max: 180,
    polarity: 'bipolar',
    offset: 0.0,
    invert: false,
    smoothing: 0.05,
    enabled: true,
  },
  {
    id: 'asgn_5',
    modulatorId: 'mod_step_1',
    parameterId: 'particle_intensity',
    depth: 0.5,
    min: 20,
    max: 100,
    polarity: 'unipolar',
    offset: 0.0,
    invert: false,
    smoothing: 0.2,
    enabled: true,
  },
];

// Exact musical duration in quarter-note beats for each sync division (4/4 time)
export const DIVISION_BEATS = {
  '4/1': 16.0,   // 4 bars (16 beats = 8.0s at 120 BPM)
  '2/1': 8.0,    // 2 bars (8 beats = 4.0s at 120 BPM)
  '1/1': 4.0,    // 1 bar (4 beats = 2.0s at 120 BPM)
  '1/2': 2.0,    // Half note (2 beats = 1.0s at 120 BPM)
  '1/4': 1.0,    // Quarter note (1 beat = 0.5s at 120 BPM)
  '1/8': 0.5,    // Eighth note (1/2 beat = 0.25s at 120 BPM)
  '1/16': 0.25,  // Sixteenth note (1/4 beat = 0.125s at 120 BPM)
  '1/4T': 2 / 3, // Quarter-note triplet
  '1/8D': 0.75,  // Dotted eighth note
};

/**
 * Converts a parameter value into normalized [0, 1] perceptual position.
 * Respects logarithmic scaling for frequency parameters (e.g. EQ Frequency, Filter Cutoff).
 */
export function valueToNorm(param, value) {
  const clamped = Math.max(param.min, Math.min(param.max, value));
  if (param.scale === 'log' && param.min > 0 && param.max > param.min) {
    return Math.log(clamped / param.min) / Math.log(param.max / param.min);
  }
  const span = param.max - param.min;
  return span > 0 ? (clamped - param.min) / span : 0;
}

/**
 * Converts a normalized [0, 1] position back into parameter units.
 * Respects logarithmic scaling for frequency parameters.
 */
export function normToValue(param, norm) {
  const clampedNorm = Math.max(0, Math.min(1, norm));
  if (param.scale === 'log' && param.min > 0 && param.max > param.min) {
    return param.min * Math.pow(param.max / param.min, clampedNorm);
  }
  return param.min + clampedNorm * (param.max - param.min);
}

/**
 * Helper to compute the current active step position for a STEP modulator
 */
export function getStepProgress(mod, t, bpm = 120) {
  const steps =
    mod.steps && mod.steps.length
      ? mod.steps
      : [0.8, 0.2, 0.6, -0.4, 0.9, -0.2, 0.5, -0.7];
  const beatsPerSec = (bpm || 120) / 60;
  const beatsPerStep = DIVISION_BEATS[mod.syncRate] || 1.0;
  const stepsPerSec = mod.tempoSync ? beatsPerSec / beatsPerStep : mod.rate;
  const phaseSteps = ((mod.phase || 0) / 360) * steps.length;
  const totalStepsElapsed = t * stepsPerSec + phaseSteps;
  const wrappedStepPos = ((totalStepsElapsed % steps.length) + steps.length) % steps.length;
  const idx = Math.floor(wrappedStepPos);
  const nextIdx = (idx + 1) % steps.length;
  const stepFrac = wrappedStepPos - idx;
  return { steps, idx, nextIdx, stepFrac };
}

// Pseudo-random deterministic noise helper
function pseudoNoise(x, seed = 1) {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

/**
 * Evaluates raw un-smoothed waveform in [-1, 1] at cyclePos (0..1) and time `t`
 */
function evaluateRawWave(mod, cyclePos, t, freq, phaseOffset, bpm) {
  const rad = cyclePos * Math.PI * 2;

  switch (mod.type) {
    case 'LFO': {
      switch (mod.subtype) {
        case 'sine':
          return Math.sin(rad);
        case 'triangle':
          return 1 - 4 * Math.abs(Math.round(cyclePos - 0.25) - (cyclePos - 0.25));
        case 'saw':
          return 2 * cyclePos - 1;
        case 'square':
          return cyclePos < 0.5 ? 1 : -1;
        case 'pulse':
          return cyclePos < 0.22 ? 1 : -1;
        case 'custom':
          return Math.sin(rad) * 0.65 + Math.sin(rad * 3) * 0.35;
        default:
          return Math.sin(rad);
      }
    }

    case 'RANDOM': {
      const stepIndex = Math.floor(t * freq + phaseOffset * 10);
      const frac = t * freq + phaseOffset * 10 - stepIndex;
      const v0 = pseudoNoise(stepIndex, 13);
      const v1 = pseudoNoise(stepIndex + 1, 13);

      if (mod.subtype === 'stepped' || mod.subtype === 's&h') {
        const smoothAmt = mod.subtype === 's&h' ? 0 : (mod.smoothing || 0) * 0.85;
        if (smoothAmt > 0.01 && frac > 1 - smoothAmt) {
          const blend = (frac - (1 - smoothAmt)) / smoothAmt;
          const mu = (1 - Math.cos(blend * Math.PI)) * 0.5;
          return v0 + (v1 - v0) * mu;
        }
        return v0;
      } else {
        // smooth cosine interpolation
        const mu2 = (1 - Math.cos(frac * Math.PI)) / 2;
        return v0 * (1 - mu2) + v1 * mu2;
      }
    }

    case 'ENVELOPE': {
      const { a = 0.2, d = 0.3, s = 0.5, r = 0.3 } = mod.adsr || {};

      // Distinct behavior for 'looping' vs triggered 'adsr' vs one-shot 'perc'
      if (mod.subtype === 'perc') {
        // Triggered percussive envelope: fast attack, exponential decay, rest until next trigger
        const attackPortion = Math.max(0.015, Math.min(0.25, a * 0.3));
        const decayRate = 3.5 + (1 - Math.max(0.05, d)) * 10;
        let env = 0;
        if (cyclePos < attackPortion) {
          env = cyclePos / attackPortion;
        } else if (cyclePos < 0.78) {
          const p = (cyclePos - attackPortion) / (0.78 - attackPortion);
          env = Math.exp(-p * decayRate);
        } else {
          env = 0; // Gate closed rest interval before next trigger
        }
        return env * 2 - 1;
      }

      if (mod.subtype === 'adsr') {
        // Triggered gate ADSR: Gate is open for 0..0.62 of cycle, then releases to 0 and rests at 0
        const gateLen = 0.62;
        const aLen = Math.min(gateLen * 0.45, Math.max(0.02, a * 0.4));
        const dLen = Math.min(gateLen - aLen, Math.max(0.02, d * 0.4));
        const rLen = Math.min(0.36, Math.max(0.03, r * 0.35));
        let env = 0;
        if (cyclePos < aLen) {
          env = cyclePos / aLen;
        } else if (cyclePos < aLen + dLen) {
          const p = (cyclePos - aLen) / dLen;
          env = 1 - (1 - s) * p;
        } else if (cyclePos < gateLen) {
          env = s;
        } else if (cyclePos < gateLen + rLen) {
          const p = (cyclePos - gateLen) / rLen;
          env = s * (1 - p);
        } else {
          env = 0; // Rest at zero until next note trigger
        }
        return env * 2 - 1;
      }

      // Default 'looping': continuous multistage loop without rest gap
      const total = Math.max(0.05, a + d + 0.2 + r);
      const normA = a / total;
      const normD = d / total;
      const normHold = 0.2 / total;

      let env = 0; // 0..1
      if (cyclePos < normA) {
        env = cyclePos / Math.max(0.01, normA);
      } else if (cyclePos < normA + normD) {
        const p = (cyclePos - normA) / Math.max(0.01, normD);
        env = 1 - (1 - s) * p;
      } else if (cyclePos < normA + normD + normHold) {
        env = s;
      } else {
        const p =
          (cyclePos - (normA + normD + normHold)) /
          Math.max(0.01, 1 - (normA + normD + normHold));
        env = s * (1 - Math.min(1, p));
      }
      return env * 2 - 1;
    }

    case 'STEP': {
      const { steps, idx, nextIdx, stepFrac } = getStepProgress(mod, t, bpm);
      const glide = mod.smoothing || 0;
      const s0 = steps[idx];
      const s1 = steps[nextIdx];
      if (glide <= 0.02) return s0;
      // Smooth S-curve glide proportional to smoothing parameter
      const glideStart = 1 - glide;
      if (stepFrac < glideStart) return s0;
      const f = (stepFrac - glideStart) / Math.max(0.01, glide);
      const smoothF = f * f * (3 - 2 * f);
      return s0 + (s1 - s0) * smoothF;
    }

    case 'FOLLOWER': {
      const beatPhase = (((t * (bpm / 60) * 2) % 1) + 1) % 1;
      const transient = Math.exp(-beatPhase * (mod.subtype === 'transient' ? 9.0 : 5.0));
      const ripple =
        mod.subtype === 'sub-band'
          ? Math.abs(Math.sin(t * 7.5)) * 0.45
          : Math.abs(Math.sin(t * 17.3)) * 0.35;
      const envVal = Math.min(1, transient * 0.85 + ripple);
      return envVal * 2 - 1;
    }

    case 'CURVE': {
      const pts =
        mod.curvePoints && mod.curvePoints.length >= 2
          ? mod.curvePoints
          : [0, 0.8, -0.5, 0.9, -0.7, 0];
      const scaled = cyclePos * (pts.length - 1);
      const i = Math.floor(scaled);
      const f = scaled - i;
      const p0 = pts[Math.min(i, pts.length - 1)];
      const p1 = pts[Math.min(i + 1, pts.length - 1)];
      let interpF = f;
      if (mod.subtype === 'exponential') {
        interpF = f * f;
      } else if (mod.subtype === 's-curve') {
        interpF = f * f * (3 - 2 * f);
      } else {
        // freeform
        interpF = f * f * (3 - 2 * f);
      }
      return p0 + (p1 - p0) * interpF;
    }

    case 'MACRO': {
      const mv = mod.macroValue !== undefined ? mod.macroValue : 0.5;
      if (mod.subtype === 'quantized') {
        const q = Math.round(mv * 8) / 8;
        return q * 2 - 1;
      }
      return mv * 2 - 1;
    }

    case 'FUNCTION': {
      if (mod.subtype === 'chaos-logistic') {
        return Math.sin(rad * 1.5) * Math.cos(rad * 3.1 + Math.sin(rad));
      } else if (mod.subtype === 'harmonic-fold') {
        const x = Math.sin(rad) * 1.8;
        return x > 1 ? 2 - x : x < -1 ? -2 - x : x;
      } else {
        return Math.sin(rad) * Math.cos(2 * rad);
      }
    }

    default:
      return Math.sin(rad);
  }
}

/**
 * Evaluates a modulator's instantaneous output in range [-1, 1] (or [0, 1] if unipolar)
 * at a given time `t` (in seconds) and `bpm`.
 * Applies temporal smoothing kernel when `mod.smoothing > 0` or `extraSmoothing > 0`.
 */
export function evaluateModulator(mod, t, bpm = 120, extraSmoothing = 0) {
  if (!mod || !mod.enabled) return 0;

  const beatsPerSec = (bpm || 120) / 60;
  const beatsPerCycle = DIVISION_BEATS[mod.syncRate] || 4.0;
  const freq = mod.tempoSync ? beatsPerSec / beatsPerCycle : mod.rate;
  const phaseOffset = (mod.phase || 0) / 360;

  const totalSmooth = Math.min(1, (mod.smoothing || 0) * 0.7 + (extraSmoothing || 0) * 0.7);

  let raw = 0;
  // Apply multi-tap temporal low-pass filter for continuous waveforms when smoothing > 0
  if (totalSmooth > 0.03 && mod.type !== 'STEP' && mod.type !== 'MACRO') {
    const windowCycle = totalSmooth * 0.22; // up to 22% of a cycle smoothing window
    const taps = [-2, -1, 0, 1, 2];
    const weights = [0.12, 0.24, 0.28, 0.24, 0.12];
    for (let k = 0; k < taps.length; k++) {
      const dtCycle = (taps[k] / 2) * windowCycle;
      const tTap = t + dtCycle / Math.max(0.1, freq);
      const cpTap = (((tTap * freq + phaseOffset) % 1) + 1) % 1;
      raw += weights[k] * evaluateRawWave(mod, cpTap, tTap, freq, phaseOffset, bpm);
    }
  } else {
    const cyclePos = (((t * freq + phaseOffset) % 1) + 1) % 1;
    raw = evaluateRawWave(mod, cyclePos, t, freq, phaseOffset, bpm);
  }

  // Apply modulator depth & offset
  let val = raw * (mod.depth ?? 1.0) + (mod.offset ?? 0);
  val = Math.max(-1, Math.min(1, val));

  if (mod.polarity === 'unipolar') {
    return (val + 1) * 0.5; // 0..1
  }
  return val; // -1..1
}

/**
 * Computes simulated base automation offset (in normalized [0, 1] perceptual space)
 * for parameters that have automation lanes active
 */
export function evaluateAutomationNormOffset(param, t, bpm = 120) {
  if (!param.hasAutomation) return 0;
  const barPhase = (((t * (bpm / 60) * 0.125) % 1) + 1) % 1;
  if (param.id === 'cs_eq_freq') {
    return Math.sin(barPhase * Math.PI * 2) * 0.08;
  }
  if (param.id === 'inst_cutoff') {
    return Math.cos(barPhase * Math.PI * 2) * 0.1;
  }
  return Math.sin(barPhase * Math.PI * 2) * 0.05;
}

/**
 * Computes the complete live parameter state in perceptual (linear or logarithmic) space:
 * - baseValue, automatedValue, modulatedValue
 * - normBase, normAuto, normLive (0..1)
 * - normRangeMin, normRangeMax (0..1 excursion bounds across active modulators)
 * - contributions: [{ assignment, modulator, signal, normDelta, normMin, normMax, color }]
 */
export function computeParameterLiveState(
  param,
  assignments,
  modulatorsMap,
  t,
  bpm = 120,
  automationEnabled = true
) {
  const normBase = valueToNorm(param, param.baseValue);
  const autoNormDelta = automationEnabled ? evaluateAutomationNormOffset(param, t, bpm) : 0;
  const normAuto = Math.max(0, Math.min(1, normBase + autoNormDelta));
  const automatedValue = normToValue(param, normAuto);

  let totalNormOffset = 0;
  let minPossibleOffset = 0;
  let maxPossibleOffset = 0;
  const contributions = [];

  for (const asgn of assignments) {
    if (asgn.parameterId !== param.id || !asgn.enabled) continue;
    const mod = modulatorsMap[asgn.modulatorId];
    if (!mod || !mod.enabled) continue;

    // Assignment min/max bounds mapped into perceptual [0, 1] space
    const lowVal = Math.min(asgn.min ?? param.min, asgn.max ?? param.max);
    const highVal = Math.max(asgn.min ?? param.min, asgn.max ?? param.max);
    const normLow = valueToNorm(param, lowVal);
    const normHigh = valueToNorm(param, highVal);
    const normSpan = Math.max(0, normHigh - normLow);

    // Evaluate modulator with per-assignment smoothing included
    const rawModOut = evaluateModulator(mod, t, bpm, asgn.smoothing || 0);
    // Normalize modulator signal to bipolar [-1, 1] first
    let bipolarSig = mod.polarity === 'unipolar' ? rawModOut * 2 - 1 : rawModOut;
    if (asgn.invert) {
      bipolarSig = -bipolarSig;
    }

    let effectiveNormDelta = 0;
    let deltaMin = 0;
    let deltaMax = 0;
    const modAmp = Math.min(1, Math.max(0, mod.depth ?? 1.0));

    if (asgn.polarity === 'unipolar') {
      // Unipolar assignment: excursion moves in [0..1] * depth * normSpan
      const uniSig = (bipolarSig + 1) * 0.5; // 0..1
      effectiveNormDelta = (uniSig * asgn.depth + (asgn.offset || 0)) * normSpan;
      const d0 = (asgn.offset || 0) * normSpan;
      const d1 = (modAmp * asgn.depth + (asgn.offset || 0)) * normSpan;
      deltaMin = Math.min(d0, d1);
      deltaMax = Math.max(d0, d1);
    } else {
      // Bipolar assignment: excursion moves in [-0.5..+0.5] * depth * normSpan around center
      effectiveNormDelta = (bipolarSig * asgn.depth * 0.5 + (asgn.offset || 0)) * normSpan;
      const dNeg = (-modAmp * asgn.depth * 0.5 + (asgn.offset || 0)) * normSpan;
      const dPos = (modAmp * asgn.depth * 0.5 + (asgn.offset || 0)) * normSpan;
      deltaMin = Math.min(dNeg, dPos);
      deltaMax = Math.max(dNeg, dPos);
    }

    // Clamp individual contribution preview bounds to assignment [normLow, normHigh]
    const contribNormMin = Math.max(normLow, Math.min(normHigh, normAuto + deltaMin));
    const contribNormMax = Math.max(normLow, Math.min(normHigh, normAuto + deltaMax));
    const contribNormLive = Math.max(
      normLow,
      Math.min(normHigh, normAuto + effectiveNormDelta)
    );

    totalNormOffset += effectiveNormDelta;
    minPossibleOffset += deltaMin;
    maxPossibleOffset += deltaMax;

    contributions.push({
      assignment: asgn,
      modulator: mod,
      signal: bipolarSig,
      normDelta: effectiveNormDelta,
      normMin: contribNormMin,
      normMax: contribNormMax,
      normLive: contribNormLive,
      normLow,
      normHigh,
      color: mod.color,
    });
  }

  let normLive = normAuto + totalNormOffset;
  let normRangeMin = normAuto + minPossibleOffset;
  let normRangeMax = normAuto + maxPossibleOffset;

  if (contributions.length === 1) {
    const { normLow, normHigh } = contributions[0];
    normLive = Math.max(normLow, Math.min(normHigh, normLive));
    normRangeMin = Math.max(normLow, Math.min(normHigh, normRangeMin));
    normRangeMax = Math.max(normLow, Math.min(normHigh, normRangeMax));
  } else {
    normLive = Math.max(0, Math.min(1, normLive));
    normRangeMin = Math.max(0, Math.min(1, normRangeMin));
    normRangeMax = Math.max(0, Math.min(1, normRangeMax));
  }

  const finalVal = normToValue(param, normLive);

  return {
    baseValue: param.baseValue,
    automatedValue,
    modulatedValue: finalVal,
    normBase,
    normAuto,
    normLive,
    normRangeMin,
    normRangeMax,
    rangeMinValue: normToValue(param, normRangeMin),
    rangeMaxValue: normToValue(param, normRangeMax),
    contributions,
  };
}