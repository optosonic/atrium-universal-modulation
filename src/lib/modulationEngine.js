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
    subtypes: ['8-step', '16-step', 'euclidean'],
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
  'cs_width': {
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
    displayFormat: (v) => v.toFixed(2),
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/width',
  },
  'cs_eq_freq': {
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
    displayFormat: (v) => `${Math.round(v)} Hz`,
    hasAutomation: true,
    midiCC: 74,
    oscAddress: '/atrium/cs1/eq/low/freq',
  },
  'cs_eq_gain': {
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
    displayFormat: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} dB`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/eq/low/gain',
  },
  'cs_comp_thresh': {
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
    displayFormat: (v) => `${v.toFixed(1)} dB`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/comp/thresh',
  },
  'cs_in_trim': {
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
    displayFormat: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} dB`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/in_trim',
  },
  'cs_pan': {
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
    displayFormat: (v) => (Math.abs(v) < 2 ? 'C' : v < 0 ? `L${Math.round(Math.abs(v))}` : `R${Math.round(v)}`),
    hasAutomation: false,
    midiCC: 10,
    oscAddress: '/atrium/cs1/pan',
  },
  'cs_comp_mix': {
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
    displayFormat: (v) => `${Math.round(v)}%`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/cs1/comp/mix',
  },
  'rev_decay': {
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
    displayFormat: (v) => `${v.toFixed(1)}s`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/reverb/decay',
  },
  'rev_shimmer': {
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
    displayFormat: (v) => `${Math.round(v)}%`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/reverb/shimmer',
  },
  'inst_cutoff': {
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
    displayFormat: (v) => (v >= 1000 ? `${(v / 1000).toFixed(2)}k` : `${Math.round(v)}Hz`),
    hasAutomation: true,
    midiCC: 71,
    oscAddress: '/atrium/inst1/cutoff',
  },
  'orbit_rotation': {
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
    displayFormat: (v) => `${Math.round(v)}°`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/orbit/rotation',
  },
  'particle_intensity': {
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
    displayFormat: (v) => `${Math.round(v)}%`,
    hasAutomation: false,
    midiCC: null,
    oscAddress: '/atrium/particles/intensity',
  },
  'mixer_pan': {
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
    displayFormat: (v) => (Math.abs(v) < 2 ? 'C' : v < 0 ? `L${Math.round(Math.abs(v))}` : `R${Math.round(v)}`),
    hasAutomation: true,
    midiCC: null,
    oscAddress: '/atrium/mixer/ch1/pan',
  },
  'mixer_vol': {
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
    syncRate: '1/16',
    tempoSync: true,
    depth: 0.85,
    phase: 0,
    offset: 0,
    smoothing: 0.15,
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

// Sync division multipliers relative to 120 BPM (2 beats/sec)
const SYNC_RATES = {
  '1/1': 0.5,
  '1/2': 1.0,
  '1/4': 2.0,
  '1/8': 4.0,
  '1/16': 8.0,
  '1/4T': 3.0,
  '1/8D': 2.66,
};

// Pseudo-random deterministic noise helper
function pseudoNoise(x, seed = 1) {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

/**
 * Evaluates a modulator's instantaneous output in range [-1, 1] (or [0, 1] if unipolar)
 * at a given time `t` (in seconds) and `bpm`.
 */
export function evaluateModulator(mod, t, bpm = 120) {
  if (!mod || !mod.enabled) return 0;

  const tempoScale = bpm / 120;
  const freq = mod.tempoSync
    ? (SYNC_RATES[mod.syncRate] || 1.0) * tempoScale
    : mod.rate;

  const phaseOffset = ((mod.phase || 0) / 360);
  const cyclePos = ((t * freq + phaseOffset) % 1 + 1) % 1; // 0..1 within cycle
  const rad = cyclePos * Math.PI * 2;

  let raw = 0; // -1 to +1

  switch (mod.type) {
    case 'LFO': {
      switch (mod.subtype) {
        case 'sine':
          raw = Math.sin(rad);
          break;
        case 'triangle':
          raw = 1 - 4 * Math.abs(Math.round(cyclePos - 0.25) - (cyclePos - 0.25));
          break;
        case 'saw':
          raw = 2 * cyclePos - 1;
          break;
        case 'square':
          raw = cyclePos < 0.5 ? 1 : -1;
          break;
        case 'pulse':
          raw = cyclePos < 0.22 ? 1 : -1;
          break;
        case 'custom':
          raw = Math.sin(rad) * 0.65 + Math.sin(rad * 3) * 0.35;
          break;
        default:
          raw = Math.sin(rad);
      }
      break;
    }

    case 'RANDOM': {
      const stepIndex = Math.floor(t * freq * 2 + phaseOffset * 10);
      const frac = (t * freq * 2 + phaseOffset * 10) - stepIndex;
      const v0 = pseudoNoise(stepIndex, 13);
      const v1 = pseudoNoise(stepIndex + 1, 13);

      if (mod.subtype === 'stepped' || mod.subtype === 's&h') {
        const smoothAmt = mod.subtype === 's&h' ? 0 : (mod.smoothing || 0) * 0.5;
        if (smoothAmt > 0.01 && frac > 1 - smoothAmt) {
          const blend = (frac - (1 - smoothAmt)) / smoothAmt;
          raw = v0 + (v1 - v0) * blend;
        } else {
          raw = v0;
        }
      } else {
        // smooth cosine interpolation
        const mu2 = (1 - Math.cos(frac * Math.PI)) / 2;
        raw = v0 * (1 - mu2) + v1 * mu2;
      }
      break;
    }

    case 'ENVELOPE': {
      const { a = 0.2, d = 0.3, s = 0.5, r = 0.3 } = mod.adsr || {};
      const total = a + d + 0.25 + r;
      const normA = a / total;
      const normD = d / total;
      const normHold = 0.25 / total;

      let env = 0; // 0..1
      if (cyclePos < normA) {
        env = cyclePos / Math.max(0.01, normA);
      } else if (cyclePos < normA + normD) {
        const p = (cyclePos - normA) / Math.max(0.01, normD);
        env = 1 - (1 - s) * p;
      } else if (cyclePos < normA + normD + normHold) {
        env = s;
      } else {
        const p = (cyclePos - (normA + normD + normHold)) / Math.max(0.01, 1 - (normA + normD + normHold));
        env = s * (1 - Math.min(1, p));
      }
      raw = env * 2 - 1;
      break;
    }

    case 'STEP': {
      const steps = mod.steps && mod.steps.length ? mod.steps : [0.8, 0.2, 0.6, -0.4, 0.9, -0.2, 0.5, -0.7];
      const idx = Math.floor(cyclePos * steps.length) % steps.length;
      const nextIdx = (idx + 1) % steps.length;
      const stepFrac = (cyclePos * steps.length) % 1;
      const glide = mod.smoothing || 0;
      const s0 = steps[idx];
      const s1 = steps[nextIdx];
      raw = glide > 0.02 ? s0 + (s1 - s0) * Math.pow(stepFrac, 1 / (glide * 3 + 0.2)) : s0;
      break;
    }

    case 'FOLLOWER': {
      // Simulated audio drum/synth envelope reactive stream
      const beatPhase = ((t * (bpm / 60) * 2) % 1 + 1) % 1;
      const transient = Math.exp(-beatPhase * 6.5);
      const ripple = Math.abs(Math.sin(t * 17.3)) * 0.35;
      const envVal = Math.min(1, transient * 0.85 + ripple);
      raw = envVal * 2 - 1;
      break;
    }

    case 'CURVE': {
      const pts = mod.curvePoints && mod.curvePoints.length >= 2
        ? mod.curvePoints
        : [0, 0.8, -0.5, 0.9, -0.7, 0];
      const scaled = cyclePos * (pts.length - 1);
      const i = Math.floor(scaled);
      const f = scaled - i;
      const p0 = pts[Math.min(i, pts.length - 1)];
      const p1 = pts[Math.min(i + 1, pts.length - 1)];
      // Smooth Hermite interpolation
      const smoothF = f * f * (3 - 2 * f);
      raw = p0 + (p1 - p0) * smoothF;
      break;
    }

    case 'MACRO': {
      const mv = mod.macroValue !== undefined ? mod.macroValue : 0.5;
      raw = mv * 2 - 1;
      break;
    }

    case 'FUNCTION': {
      if (mod.subtype === 'chaos-logistic') {
        raw = Math.sin(rad * 1.5) * Math.cos(rad * 3.1 + Math.sin(rad));
      } else if (mod.subtype === 'harmonic-fold') {
        const x = Math.sin(rad) * 1.8;
        raw = x > 1 ? 2 - x : x < -1 ? -2 - x : x;
      } else {
        raw = Math.sin(rad) * Math.cos(2 * rad);
      }
      break;
    }

    default:
      raw = Math.sin(rad);
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
 * Computes simulated base automation offset for parameters that have automation lanes active
 */
export function evaluateAutomationOffset(param, t, bpm = 120) {
  if (!param.hasAutomation) return 0;
  // Subtle slow automation curve so user can see Base + Automation + Modulation coexisting
  const barPhase = ((t * (bpm / 60) * 0.125) % 1 + 1) % 1;
  const span = param.max - param.min;
  if (param.id === 'cs_eq_freq') {
    return Math.sin(barPhase * Math.PI * 2) * span * 0.08;
  }
  if (param.id === 'inst_cutoff') {
    return Math.cos(barPhase * Math.PI * 2) * span * 0.1;
  }
  return Math.sin(barPhase * Math.PI * 2) * span * 0.05;
}

/**
 * Computes the complete live parameter state:
 * - baseValue
 * - automatedValue (base + lane automation)
 * - modulatedValue (final clamped value within min/max)
 * - activeModContributions (array of { assignment, modulator, deltaNorm })
 */
export function computeParameterLiveState(param, assignments, modulatorsMap, t, bpm = 120, automationEnabled = true) {
  const span = param.max - param.min;
  const autoDelta = automationEnabled ? evaluateAutomationOffset(param, t, bpm) : 0;
  const automatedValue = Math.max(param.min, Math.min(param.max, param.baseValue + autoDelta));

  let totalModOffset = 0;
  const contributions = [];

  for (const asgn of assignments) {
    if (asgn.parameterId !== param.id || !asgn.enabled) continue;
    const mod = modulatorsMap[asgn.modulatorId];
    if (!mod || !mod.enabled) continue;

    let modSignal = evaluateModulator(mod, t, bpm);
    if (asgn.invert) {
      modSignal = asgn.polarity === 'unipolar' ? 1 - modSignal : -modSignal;
    }
    if (asgn.polarity === 'unipolar' && mod.polarity !== 'unipolar') {
      modSignal = (modSignal + 1) * 0.5;
    }

    const effectiveSignal = modSignal * asgn.depth + (asgn.offset || 0);
    const paramDelta = effectiveSignal * span * 0.5;
    totalModOffset += paramDelta;

    contributions.push({
      assignment: asgn,
      modulator: mod,
      signal: modSignal,
      paramDelta,
      color: mod.color,
    });
  }

  // Clamp within assignment bounds if single assignment specifies min/max, or global param min/max
  let finalVal = automatedValue + totalModOffset;
  if (contributions.length === 1) {
    const a = contributions[0].assignment;
    const low = Math.min(a.min ?? param.min, a.max ?? param.max);
    const high = Math.max(a.min ?? param.min, a.max ?? param.max);
    finalVal = Math.max(low, Math.min(high, finalVal));
  } else {
    finalVal = Math.max(param.min, Math.min(param.max, finalVal));
  }

  return {
    baseValue: param.baseValue,
    automatedValue,
    modulatedValue: finalVal,
    normBase: (param.baseValue - param.min) / span,
    normAuto: (automatedValue - param.min) / span,
    normLive: (finalVal - param.min) / span,
    contributions,
  };
}