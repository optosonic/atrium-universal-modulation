export const CURSOR_HANDOFF_SPEC = `# ATRIUM — UNIVERSAL MODULATION SYSTEM · IMPLEMENTATION PROMPT FOR MAIN SOFTWARE

## 1. Objective & Non-Negotiable Constraints
Integrate the Universal Modulation System into the existing Atrium application so **any parameter anywhere** (Channel Strip, multi-band EQ, Compressor, Reverb, Synth Instrument, 3D Orbit Stage, HydroSwarm Particles, Mixer Vol/Pan) can be modulated in real time by multiple modulation sources.

**Strict Architectural & Visual Constraints:**
- **Do NOT redesign Atrium** or replace existing plugin/mixer layouts.
- **Integrate inside existing Atrium surfaces only:**
  1. Add \`MOD\` to the existing \`AUTO\` tab mode selector (\`VOL | PAN | GESTURE | MOD\`).
  2. Extend the existing parameter learn popup (\`LEARN <ParamName>\`) to include \`MIDI | OSC | MOD\` tabs.
  3. Add a non-invasive SVG modulation ring/arc and live indicator dot around existing knobs/sliders without altering knob geometry.
- **Coexistence Formula (Base + Automation + Modulation):**
  \`finalValue = clamp(baseValue + automationDelta + sum(assignmentDelta_i), min, max)\`
  Base parameter edits, timeline automation lanes (\`VOL\`, \`PAN\`, \`GESTURE\`), and live modulation must coexist simultaneously and non-destructively.

---

## 2. Files & Modules to Port / Integrate
1. \`src/lib/modulationEngine.js\` — Pure DSP/math evaluation engine, \`DIVISION_BEATS\` tempo-sync table, \`getStepProgress()\`, \`evaluateModulator()\`, and \`computeParameterLiveState()\`.
2. \`src/hooks/useModulationEngine.js\` — Centralized React state & 60fps \`requestAnimationFrame\` transport clock hook exposing the 3-prop control binding surface.
3. \`src/components/atrium/ModWorkspace.jsx\` — 3-column \`AUTO > MOD\` workspace (Modulator Library & Active Stack | Top-Justified Interactive Oscilloscope & Parameter Controls | Universal Routing Matrix).
4. \`src/components/atrium/StepSequencerOverlay.jsx\` — Multi-bar click-and-drag step painter with fast-sweep interpolation, \`RND\` / \`INV\` / \`CLR\` tools, and live active-step highlight.
5. \`src/components/atrium/ParameterLearnPopup.jsx\` — Extended \`MIDI | OSC | MOD\` inspector popover for per-parameter modulation assignments.
6. \`src/components/atrium/AtriumKnob.jsx\` — Reference rotary control implementation showing base value needle, automation ghost marker, live modulated excursion arc, and HTML5 drag-and-drop target handling.

---

## 3. Data Contracts

### Parameter Definition
\`\`\`ts
interface AtriumParameter {
  id: string;                 // Unique ID, e.g. 'cs_eq_lf_freq', 'cs_width', 'orbit_rotation'
  name: string;               // Disambiguated display name, e.g. 'LF Freq (80Hz)', 'Width'
  shortName: string;          // Compact knob label, e.g. 'LF FREQ', 'WIDTH'
  group: string;              // Module group, e.g. 'EQ Low', 'Channel Strip', 'Orbit'
  plugin: string;             // Host plugin name, e.g. 'Channel Strip Mk II'
  min: number;
  max: number;
  step: number;
  baseValue: number;
  unit: string;               // 'Hz' | 'dB' | '%' | 's' | '°' | ''
  displayFormat: (v: number) => string;
  hasAutomation: boolean;
  midiCC: number | null;
  oscAddress: string;
}
\`\`\`
> **Important:** Multi-band / multi-stage plugins (such as 4-band EQs) MUST register distinct parameter IDs and disambiguated names per band (\`EQ Low / LF Gain\`, \`EQ LMF / LMF Gain\`, \`EQ HMF / HMF Gain\`, \`EQ High / HF Gain\`) rather than generic duplicate labels.

### Modulator Source State
\`\`\`ts
interface Modulator {
  id: string;
  name: string;               // e.g. 'LFO 1', 'RANDOM 1', 'STEP 1'
  type: 'LFO' | 'RANDOM' | 'ENVELOPE' | 'STEP' | 'FOLLOWER' | 'CURVE' | 'MACRO' | 'FUNCTION';
  subtype: string;            // e.g. 'sine'|'triangle'|'saw'|'square'|'pulse'|'custom', '8-step'|'16-step'|'euclidean', etc.
  rate: number;               // Free rate in Hz (for STEP: steps per second)
  syncRate: '4/1' | '2/1' | '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/4T' | '1/8D';
  tempoSync: boolean;
  depth: number;              // 0..1 master modulator output scale
  phase: number;              // 0..360 degrees
  offset: number;             // -0.5..0.5 DC offset
  smoothing: number;          // 0..1 slew / step glide
  polarity: 'bipolar' | 'unipolar';
  enabled: boolean;
  color: string;              // Hex color token used for arcs, badges, and matrix borders
  steps: number[];            // Normalized step values in [-1, 1]
  curvePoints: number[];      // Normalized breakpoint values in [-1, 1]
  macroValue: number;         // 0..1 master dial for MACRO type
  adsr: { a: number; d: number; s: number; r: number };
}
\`\`\`

### Modulation Assignment (Many-to-Many Routing)
\`\`\`ts
interfaceModulationAssignment {
  id: string;
  modulatorId: string;
  parameterId: string;
  depth: number;              // -1..1 per-target bipolar depth
  min: number;                // Target clamp floor in parameter units
  max: number;                // Target clamp ceiling in parameter units
  polarity: 'bipolar' | 'unipolar';
  offset: number;             // -0.5..0.5 per-assignment offset
  invert: boolean;            // Phase inversion toggle
  smoothing: number;          // 0..1 per-assignment smoothing
  enabled: boolean;
}
\`\`\`

---

## 4. Exact Tempo-Sync & Signal Evaluation Math (\`modulationEngine.js\`)

Use exact quarter-note beat durations (\`DIVISION_BEATS\`) so tempo sync at any \`bpm\` is musically accurate:
\`\`\`js
export const DIVISION_BEATS = {
  '4/1': 16.0,   // 4 bars (16 beats = 8.0s at 120 BPM)
  '2/1': 8.0,    // 2 bars (8 beats = 4.0s at 120 BPM)
  '1/1': 4.0,    // 1 bar  (4 beats = 2.0s at 120 BPM)
  '1/2': 2.0,    // Half note (2 beats = 1.0s at 120 BPM)
  '1/4': 1.0,    // Quarter note (1 beat = 0.5s at 120 BPM)
  '1/8': 0.5,    // Eighth note (1/2 beat = 0.25s at 120 BPM)
  '1/16': 0.25,  // Sixteenth note (1/4 beat = 0.125s at 120 BPM)
  '1/4T': 2 / 3, // Quarter-note triplet
  '1/8D': 0.75,  // Dotted eighth note
};
\`\`\`
- **For Continuous Generators (\`LFO\`, \`ENVELOPE\`, \`CURVE\`, \`RANDOM\`, \`FUNCTION\`):**
  \`beatsPerSec = bpm / 60\`
  \`freq = mod.tempoSync ? beatsPerSec / DIVISION_BEATS[mod.syncRate] : mod.rate\`
  Do **not** multiply \`RANDOM\` or \`LFO\` frequencies by arbitrary extra scalars.
- **For Step Sequencers (\`STEP\` — 8, 16, or 32 Steps & Euclidean):**
  In \`tempoSync\` mode, \`syncRate\` defines the **per-step note division** (e.g. \`1/4\` = 1 beat per step = 2 steps/sec at 120 BPM; \`1/8\` = 0.5 beats per step = 4 steps/sec at 120 BPM; \`1/16\` = 0.25 beats per step = 8 steps/sec at 120 BPM). In free mode, \`mod.rate\` is integer steps per second (1..32 stp/s). Use \`getStepProgress(mod, t, bpm)\` for both audio/control evaluation and the UI step highlight so they never drift.

---

## 5. UI & Interaction Requirements

1. **Control Binding Surface (3 Props on Any Atrium Control):**
   Every modulatable control receives:
   - \`liveState = liveStates[param.id]\` (\`{ baseValue, automatedValue, modulatedValue, normBase, normAuto, normLive, contributions }\`)
   - \`onChangeBase(param.id, newValue)\`
   - \`onDropModulator(modulatorId, param.id)\`
   - Plus \`onOpenLearnPopup(param.id, anchorRect)\` on direct click (without vertical drag), right-click, or clicking the top-right badge.
   - Format all parameter paths across dropdowns, routing matrices, and popups using the scoped 3-part format: \`Plugin · Group · Name\` (via \`formatParameterScope(param)\`).
2. **Drag-and-Drop Patching Protocol:**
   - Modulator pills and the editor's \`DRAG TO TARGET\` handle set \`e.dataTransfer.setData('application/atrium-modulator', mod.id)\`.
   - Any knob, slider, or fader accepts drops with that MIME type and calls \`addAssignment(modulatorId, param.id)\`.
3. **Top-Justified Oscilloscope & Step Sequencer (\`ModWorkspace.jsx\`):**
   - Keep the unit/rate/depth readout and zoom controls (\`−\`, \`1.00x\`, \`+\`) in a **dedicated header bar above the canvas** and the vertical resize handle **below the canvas** so waveform peaks and troughs are never covered.
   - Support drag-on-wave to zoom time/amplitude and double-click to reset zoom.
   - When \`activeMod.type === 'STEP'\`, suppress the scrolling LFO waveform canvas and render \`<StepSequencerOverlay />\` directly so there is no distracting background wave behind the step bars.
   - \`<StepSequencerOverlay />\` must update immediately on \`mousedown\` and allow continuous horizontal + vertical drag-painting across all bars with linear interpolation between fast mouse samples.
4. **Extended \`MIDI | OSC | MOD\` Learn Popup (\`ParameterLearnPopup.jsx\`):**
   - Preserves existing \`MIDI\` CC learn and \`OSC\` address editing.
   - Adds the \`MOD\` tab showing live Base vs. Modulated value meter, quick \`+ Assign Modulator\` buttons, and per-assignment cards (Depth slider, Min/Max range sliders, Offset, Smoothing, Bipolar/Unipolar toggle, Invert toggle, Enable checkbox, and Delete button).

---

## 6. Verification & Acceptance Checklist
- [ ] Switching \`AUTO\` between \`VOL\`, \`PAN\`, \`GESTURE\`, and \`MOD\` preserves all modulators and active assignments.
- [ ] Dragging any modulator chip onto a Channel Strip, EQ, Reverb, Synth, Orbit, or Mixer knob immediately creates a route and renders the colored modulation arc.
- [ ] Assigning one modulator to multiple parameters allows independent depth, polarity, and min/max bounds per parameter.
- [ ] Assigning multiple modulators to a single parameter sums their contributions cleanly on top of base value + timeline automation.
- [ ] \`STEP\` modulator advances at exact beat divisions (e.g. \`1/4\` at 120 BPM = 2 steps/sec) with no background waveform clutter, and supports single-gesture multi-bar drag painting.
- [ ] Transport Play, Pause, Reset (\`RTZ\`), and \`BPM\` changes immediately govern all free and tempo-synced modulators.
`;