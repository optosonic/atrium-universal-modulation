export const CURSOR_HANDOFF_SPEC = `ATRIUM — UNIVERSAL MODULATION MODULE · INTEGRATION SPEC FOR CURSOR

GOAL
Port the working Universal Modulation prototype into the existing Atrium app so any
parameter anywhere (plugin, mixer, spatial engine, particle system) can be modulated.
Do not redesign Atrium, do not add a new plugin, do not change existing DAW styling.

FILES TO PORT (all framework-free except the React views)
1. src/lib/modulationEngine.js          — pure DSP/math engine + parameter & modulator definitions
2. src/hooks/useModulationEngine.js     — React binding layer (state, clock, assignment CRUD)
3. src/components/atrium/AtriumKnob.jsx — modulated knob with mod arc, live dot, drop target
4. src/components/atrium/ModWorkspace.jsx        — AUTO > MOD workspace (library / editor / routing)
5. src/components/atrium/ParameterLearnPopup.jsx — extended MIDI | OSC | MOD learn popup

DATA CONTRACTS
Parameter:
  { id, name, shortName, group, plugin, min, max, step, baseValue, unit,
    displayFormat(v), hasAutomation, midiCC, oscAddress }
Modulator:
  { id, name, type, subtype, rate, syncRate, tempoSync, depth, phase, offset,
    smoothing, polarity: 'bipolar' | 'unipolar', enabled, color,
    steps[], curvePoints[], macroValue, adsr: {a,d,s,r} }
Assignment (one modulator -> one parameter):
  { id, modulatorId, parameterId, depth (-1..1), min, max,
    polarity, offset, invert, smoothing, enabled }

ENGINE API (src/lib/modulationEngine.js)
  evaluateModulator(mod, t, bpm) -> number
    Output normalised to -1..1 (bipolar) or 0..1 (unipolar). Applies mod.depth,
    mod.offset and tempo sync. Pure function: feed it any t, no side effects.
  computeParameterLiveState(param, assignmentsForEngine, modulatorsMap, t, bpm, automationOn)
    -> { baseValue, automatedValue, modulatedValue, normBase, normAuto, normLive,
         contributions: [{ assignment, modulator, signal, paramDelta, color }] }
    Sums every enabled assignment, clamps to the assignment min/max when a single
    route exists, otherwise to the parameter range. This is the ONLY place where
    base + automation + modulation are combined.

SUPPORTED MODULATOR TYPES (all implemented)
  LFO      : sine, triangle, saw, square, pulse, custom
  RANDOM   : smooth, stepped, sample & hold
  ENVELOPE : looping ADSR
  STEP     : editable multi-step sequencer (click bars to set level)
  FOLLOWER : audio-reactive envelope (simulated transient stream; swap in a real
             AnalyserNode RMS feed at the same evaluate signature)
  CURVE    : drawable breakpoint wave (curvePoints array)
  MACRO    : one dial driving many destinations
  FUNCTION : mathematical shapes (sin(x)*cos(2x), chaos-logistic, harmonic-fold)

BINDING A CONTROL — three props, nothing else
  const st = liveStates[param.id];
  <AtriumKnob
    param={param}
    liveState={st}                              // animated value + contributions
    onChangeBase={changeBase}                    // (paramId, value)
    onOpenLearnPopup={openLearnPopup}            // (paramId) -> MIDI | OSC | MOD popup
    onDropModulator={addAssignment}              // (modulatorId, paramId)
    learnModeActive={learnModeActive}
  />
For sliders/faders/XY pads/3D controls reuse the same contract:
  value      = st.modulatedValue
  indicator  = st.normLive ; base ghost = st.normBase ; auto ghost = st.normAuto
  ring color = st.contributions[0]?.color

DRAG & DROP PROTOCOL
  Drag source:  e.dataTransfer.setData('application/atrium-modulator', mod.id)
  Drop target:  onDragOver -> if types includes that MIME, e.preventDefault()
                onDrop     -> addAssignment(getData(...), param.id)
  Any DOM element can become a target; no library required.

ROUTING RULES
  One modulator -> many parameters. Many modulators -> one parameter.
  Assignment ids are independent: editing or deleting one never touches another.
  Deleting a modulator removes only its own assignments.

CLOCK
  Single requestAnimationFrame loop increments simTime while playing and is paused
  by the transport. All modulation is derived from simTime, so play/pause/reset are
  exact and tempo changes never desync modulators. Tempo-synced modulators use
  syncRate ('1/1','1/2','1/4','1/8','1/16','1/4T','1/8D') scaled by bpm.

VISUAL CONSTRAINTS (non-negotiable)
  Backgrounds #121619 / #0e1216 / #161b20, borders #27313a, cyan #38bdf8 / #5bc0de,
  metallic plates via .atrium-plate-light, buttons via .atrium-btn-metal / .atrium-btn-cyan.
  Typography 8–12px, tracking 0.14–0.18em for labels, monospace for numbers.
  Never restyle the knob body: modulation is expressed as an outer arc, a live dot
  and a top-right badge only.

ACCEPTANCE CHECKLIST
  1. AUTO tab shows VOL | PAN | GESTURE | MOD; switching modes keeps all wiring.
  2. Create LFO -> choose waveform -> change rate; waveform preview responds instantly.
  3. Drag LFO onto Width knob -> value moves continuously; knob shows base ghost + arc.
  4. Same LFO to EQ Frequency with a different depth -> independent depths preserved.
  5. New RANDOM assigned to Reverb Decay -> visibly random motion.
  6. Routing list: edit depth, invert, enable/disable and delete single routes.
  7. Right-click / learn badge on any control opens LEARN popup with MIDI | OSC | MOD.
  8. Play / pause / reset stop and restore modulation without losing configuration.
`;