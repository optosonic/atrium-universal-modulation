import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  INITIAL_PARAMETERS,
  INITIAL_MODULATORS,
  INITIAL_ASSIGNMENTS,
  MOD_COLORS,
  MODULATOR_TYPES,
  computeParameterLiveState,
} from '@/lib/modulationEngine';
import ModWorkspace from '@/components/atrium/ModWorkspace';
import AtriumKnob from '@/components/atrium/AtriumKnob';
import ParameterLearnPopup from '@/components/atrium/ParameterLearnPopup';
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Code2,
  ArrowLeft,
  Sliders,
} from 'lucide-react';

const CURSOR_PROMPT_SPEC = `# CURSOR IMPLEMENTATION PROMPT — ATRIUM UNIVERSAL MODULATION MODULE

## Goal
Integrate the isolated Universal Modulation System into Atrium's existing \`AUTO\` tab and extend the existing \`MIDI Learn\` parameter popup to \`MIDI | OSC | MOD\`, without altering Atrium's existing DAW layout, Channel Strip, or plugin chrome.

## 1. Core Architecture & State Contract (\`modulationEngine\`)
- **Modulator Schema**:
  \`{ id, name, type: 'LFO'|'RANDOM'|'ENVELOPE'|'STEP'|'FOLLOWER'|'CURVE'|'MACRO'|'FUNCTION', subtype, rate, syncRate, tempoSync, depth, phase, offset, smoothing, polarity: 'bipolar'|'unipolar', enabled, color, steps, curvePoints, macroValue, adsr }\`
- **Assignment (Routing) Schema**:
  \`{ id, modulatorId, parameterId, depth (-1..1), min, max, polarity, offset, invert, smoothing, enabled }\`
- **Signal Evaluation (\`evaluateModulator(mod, timeSec, bpm)\`)**:
  Evaluates normalized output in \`[-1, 1]\` (bipolar) or \`[0, 1]\` (unipolar) at 60fps or audio-rate buffer ticks.
- **Parameter Coexistence (\`computeParameterLiveState\`)**:
  \`finalValue = clamp(baseValue + automationDelta + sum(assignmentDelta_i), min, max)\`
  Preserves existing base values and timeline automation while superimposing real-time modulation.

## 2. UI Integration Points in Existing Atrium
1. **AUTO Tab Mode Switcher**:
   - Locate the existing \`VOL | PAN | GESTURE\` segmented selector in the AUTO left column.
   - Add \`MOD\` as the 4th mode button.
   - When \`MOD\` is active, swap the right-hand timeline canvas for \`<ModWorkspace />\` while keeping all modulator/assignment state alive when switching back to \`VOL\`, \`PAN\`, or \`GESTURE\`.
2. **Extended Parameter Learn Popup (\`<ParameterLearnPopup />\`)**:
   - In Atrium's existing MIDI Learn popover (\`LEARN <ParamName>\`), add a \`MIDI | OSC | MOD\` pill switcher in the top-right header.
   - Keep \`MIDI\` tab identical to current hardware CC learn.
   - In \`MOD\` tab, list active assignments for that parameter with per-assignment Depth, Offset, Smoothing, Min/Max range, Bipolar/Unipolar, Invert, Enable, and Delete controls.
3. **Drag-and-Drop & Knob Overlay Ring**:
   - Modulator pills set \`dataTransfer.setData('application/atrium-modulator', mod.id)\`.
   - Eligible Atrium knobs/sliders accept \`onDrop\` to immediately call \`onAddAssignment(modId, paramId)\`.
   - Render a lightweight SVG modulation excursion arc (\`autoDeg\` to \`liveDeg\`) around the existing knob perimeter using the modulator's color.`;

/**
 * Isolated Universal Modulator Prototype Page (`/universal-modulator`)
 * Designed specifically as a clean, self-contained module reference for Cursor / engineering handoff.
 * Excludes all full-DAW chrome, Channel Strip windows, and arrangement tracks.
 */
export default function UniversalModulatorStandalone() {
  const [parameters, setParameters] = useState(INITIAL_PARAMETERS);
  const [modulators, setModulators] = useState(INITIAL_MODULATORS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [selectedModId, setSelectedModId] = useState(INITIAL_MODULATORS[0].id);

  const [isPlaying, setIsPlaying] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [simTime, setSimTime] = useState(0);
  const [learnModeActive, setLearnModeActive] = useState(false);
  const [activeLearnParamId, setActiveLearnParamId] = useState(null);
  const [showCursorSpec, setShowCursorSpec] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // 60fps modulation clock
  const lastFrameRef = useRef(performance.now());
  useEffect(() => {
    let rafId;
    const tick = (now) => {
      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      if (isPlaying) {
        setSimTime((prev) => prev + Math.min(dt, 0.1));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const modulatorsMap = useMemo(() => {
    const map = {};
    modulators.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [modulators]);

  const liveStates = useMemo(() => {
    const states = {};
    Object.values(parameters).forEach((param) => {
      states[param.id] = computeParameterLiveState(
        param,
        assignments,
        modulatorsMap,
        simTime,
        bpm,
        true
      );
    });
    return states;
  }, [parameters, assignments, modulatorsMap, simTime, bpm]);

  const handleChangeBase = (paramId, newVal) => {
    setParameters((prev) => ({
      ...prev,
      [paramId]: { ...prev[paramId], baseValue: newVal },
    }));
  };

  const handleCreateModulator = (type = 'LFO') => {
    const meta =
      MODULATOR_TYPES.find((m) => m.type === type) || MODULATOR_TYPES[0];
    const typeCount = modulators.filter((m) => m.type === type).length + 1;
    const newId = `mod_${type.toLowerCase()}_${Date.now()}`;
    const color = MOD_COLORS[modulators.length % MOD_COLORS.length];

    const newMod = {
      id: newId,
      name: `${type} ${typeCount}`,
      type,
      subtype: meta.defaultSubtype,
      rate: type === 'STEP' ? 2.0 : 1.1,
      syncRate: '1/4',
      tempoSync: false,
      depth: 1.0,
      phase: 0,
      offset: 0,
      smoothing: type === 'RANDOM' ? 0.45 : 0.1,
      polarity: 'bipolar',
      enabled: true,
      color,
      steps: [0.85, 0.3, -0.4, 0.7, -0.6, 0.9, -0.2, 0.5],
      curvePoints: [0, 0.75, -0.5, 0.85, -0.3, 0],
      macroValue: 0.65,
      adsr: { a: 0.15, d: 0.3, s: 0.6, r: 0.25 },
    };

    setModulators((prev) => [...prev, newMod]);
    setSelectedModId(newId);
    return newId;
  };

  const handleUpdateModulator = (modId, patch) => {
    setModulators((prev) =>
      prev.map((m) => (m.id === modId ? { ...m, ...patch } : m))
    );
  };

  const handleDeleteModulator = (modId) => {
    setModulators((prev) => prev.filter((m) => m.id !== modId));
    setAssignments((prev) => prev.filter((a) => a.modulatorId !== modId));
    if (selectedModId === modId) {
      const remaining = modulators.filter((m) => m.id !== modId);
      if (remaining[0]) setSelectedModId(remaining[0].id);
    }
  };

  const handleAddAssignment = (modulatorId, parameterId) => {
    const param = parameters[parameterId];
    if (!param || !modulatorId) return;
    const existing = assignments.find(
      (a) => a.modulatorId === modulatorId && a.parameterId === parameterId
    );
    if (existing) {
      setSelectedModId(modulatorId);
      return;
    }

    const newAsgn = {
      id: `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      modulatorId,
      parameterId,
      depth: 0.55,
      min: param.min,
      max: param.max,
      polarity: 'bipolar',
      offset: 0,
      invert: false,
      smoothing: 0.1,
      enabled: true,
    };

    setAssignments((prev) => [...prev, newAsgn]);
    setSelectedModId(modulatorId);
  };

  const handleCreateModulatorAndAssign = (type, parameterId) => {
    const newModId = handleCreateModulator(type);
    handleAddAssignment(newModId, parameterId);
  };

  const handleUpdateAssignment = (asgnId, patch) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === asgnId ? { ...a, ...patch } : a))
    );
  };

  const handleRemoveAssignment = (asgnId) => {
    setAssignments((prev) => prev.filter((a) => a.id !== asgnId));
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(CURSOR_PROMPT_SPEC);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // 9 Representative target parameters for testing drag-and-drop & MIDI|OSC|MOD popup
  const testTargetIds = [
    'cs_width',
    'cs_eq_freq',
    'cs_eq_gain',
    'cs_comp_thresh',
    'rev_decay',
    'mixer_pan',
    'inst_cutoff',
    'orbit_rotation',
    'particle_intensity',
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d1115] text-[#d6e2ea] select-none overflow-hidden">
      {/* Minimal Module Header Bar (For Cursor Handoff & Testing) */}
      <header className="h-11 bg-[#14191f] border-b border-[#26303a] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="px-2.5 py-1 rounded bg-[#1d252d] hover:bg-[#27323d] border border-[#313e4b] text-[10px] text-[#9fb1bd] hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3 h-3" />
            Full Atrium Context View
          </Link>
          <div className="h-4 w-[1px] bg-[#26303a]" />
          <span className="text-[12px] font-bold tracking-[0.16em] text-[#38bdf8] uppercase">
            UNIVERSAL MODULATOR — ISOLATED MODULE PROTOTYPE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0c1014] border border-[#242e38] text-[#8ea0ad]">
            src/lib/modulationEngine.js + src/components/atrium/ModWorkspace.jsx
          </span>
        </div>

        {/* Transport & Cursor Spec Export Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#0c1014] px-2 py-1 rounded border border-[#242e38]">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                isPlaying
                  ? 'bg-[#38bdf8] text-[#061218]'
                  : 'bg-[#1b2229] text-[#9fb1bd]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3" /> PAUSE
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> PLAY
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSimTime(0)}
              className="p-1 text-[#8ea0ad] hover:text-white"
              title="Reset Phase / Clock"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#5bc0de] pl-1 border-l border-[#222b33]">
              <span>BPM</span>
              <input
                type="number"
                value={bpm}
                onChange={(e) =>
                  setBpm(Math.max(40, Math.min(240, Number(e.target.value) || 120)))
                }
                className="w-10 bg-transparent text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLearnModeActive(!learnModeActive)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
              learnModeActive
                ? 'bg-[#34d399] text-[#051810] border-white shadow-[0_0_8px_#34d399]'
                : 'bg-[#1b242c] text-[#9fb1bd] border-[#2e3b47] hover:text-white'
            }`}
          >
            MIDI | OSC | MOD LEARN: {learnModeActive ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowCursorSpec(!showCursorSpec)}
            className="atrium-btn-cyan px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5" />
            {showCursorSpec ? 'Hide Cursor Prompt' : 'Cursor Integration Prompt'}
          </button>
        </div>
      </header>

      {/* Optional Collapsible Cursor Handoff Specification Drawer */}
      {showCursorSpec && (
        <div className="bg-[#11161b] border-b border-[#2b3742] p-3 flex items-start justify-between gap-4 shrink-0 max-h-[210px] overflow-y-auto">
          <pre className="text-[10px] font-mono text-[#b8c7d4] whitespace-pre-wrap leading-relaxed flex-1">
            {CURSOR_PROMPT_SPEC}
          </pre>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="atrium-btn-cyan px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1.5 shrink-0"
          >
            {copiedPrompt ? (
              <>
                <Check className="w-3.5 h-3.5" /> Copied for Cursor!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Prompt for Cursor
              </>
            )}
          </button>
        </div>
      )}

      {/* Minimal Parameter Test Strip (Only for testing Drag & Drop + MIDI|OSC|MOD Popup) */}
      <section className="bg-[#12171d] border-b border-[#232c35] px-4 py-2.5 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9fb1bd]">
              DUMMY HOST PARAMETER TARGETS (DRAG ANY MODULATOR BELOW ONTO THESE KNOBS OR CLICK FOR MIDI | OSC | MOD POPUP)
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#6c7f8e]">
            Right-click or click top-right badge on any knob to open ParameterLearnPopup
          </span>
        </div>

        <div className="grid grid-cols-9 gap-2 bg-[#0b0e12] p-2.5 rounded border border-[#1f2830]">
          {testTargetIds.map((pid) => {
            const param = parameters[pid];
            return (
              <div
                key={pid}
                className="flex flex-col items-center justify-center p-1.5 rounded bg-[#13181e] border border-[#222b33]"
              >
                <span className="text-[8px] font-mono uppercase text-[#667885] mb-1 truncate max-w-full">
                  {param.group}
                </span>
                <AtriumKnob
                  param={param}
                  liveState={liveStates[pid]}
                  onChangeBase={handleChangeBase}
                  onOpenLearnPopup={(id) => setActiveLearnParamId(id)}
                  onDropModulator={handleAddAssignment}
                  learnModeActive={learnModeActive}
                  selectedForLearn={activeLearnParamId === pid}
                  variant={pid === 'cs_width' ? 'blue' : 'dark'}
                  size={48}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* THE ISOLATED UNIVERSAL MODULATOR WORKSPACE (AUTO -> MOD component) */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 bg-[#090c0f]">
        <div className="flex items-center justify-between px-2 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#3c7891] border border-[#63b8d6] text-white">
              MOD
            </span>
            <span className="text-[11px] font-semibold text-white">
              Isolated AUTO → MOD Workspace Component (\`<ModWorkspace />\`)
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#7a8b99]">
            {modulators.length} Modulators • {assignments.length} Active Assignments
          </span>
        </div>

        <div className="flex-1 flex rounded border border-[#28333d] overflow-hidden shadow-2xl">
          <ModWorkspace
            modulators={modulators}
            selectedModId={selectedModId}
            onSelectMod={setSelectedModId}
            onCreateModulator={handleCreateModulator}
            onUpdateModulator={handleUpdateModulator}
            onDeleteModulator={handleDeleteModulator}
            assignments={assignments}
            parameters={parameters}
            liveStates={liveStates}
            onAddAssignment={handleAddAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onRemoveAssignment={handleRemoveAssignment}
            onOpenLearnPopup={(id) => setActiveLearnParamId(id)}
            simTime={simTime}
            bpm={bpm}
          />
        </div>
      </div>

      {/* Extended MIDI | OSC | MOD Parameter Learn Popup */}
      {activeLearnParamId && parameters[activeLearnParamId] && (
        <ParameterLearnPopup
          param={parameters[activeLearnParamId]}
          liveState={liveStates[activeLearnParamId]}
          modulators={modulators}
          assignments={assignments}
          onClose={() => setActiveLearnParamId(null)}
          onAddAssignment={handleAddAssignment}
          onUpdateAssignment={handleUpdateAssignment}
          onRemoveAssignment={handleRemoveAssignment}
          onCreateModulatorAndAssign={handleCreateModulatorAndAssign}
        />
      )}
    </div>
  );
}