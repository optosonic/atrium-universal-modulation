import React, { useEffect, useRef, useState } from 'react';
import {
  MODULATOR_TYPES,
  INITIAL_MODULATORS,
  INITIAL_ASSIGNMENTS,
  INITIAL_PARAMETERS,
  evaluateModulator,
} from '@/lib/modulationEngine';
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  Sliders,
  Activity,
  Power,
  Clock,
  Sparkles,
} from 'lucide-react';

/**
 * Interactive Modulator Workspace inside the Atrium AUTO tab when `MOD` is selected.
 * Features:
 * 1. Left Column: Compact Modulator Creator (+ LFO, RANDOM, ENVELOPE, STEP, FOLLOWER, CURVE, MACRO, FUNCTION)
 *    & Active Modulator Pills (draggable directly onto any knob/slider in Atrium!)
 * 2. Center Column: Active Modulator Interactive Controls + High-FPS Animated Waveform Canvas
 *    (supports custom step bars, curve drawing, ADSR handles, rate, depth, phase, offset, smoothing, tempo sync)
 * 3. Right Column: Universal Modulation Routing Matrix (SOURCE → DESTINATION) with live depth bars,
 *    polarity/invert toggles, and quick target assignment.
 */
export default function ModWorkspace({
  modulators = INITIAL_MODULATORS,
  selectedModId,
  onSelectMod = () => {},
  onCreateModulator = () => {},
  onUpdateModulator = () => {},
  onDeleteModulator = () => {},
  assignments = INITIAL_ASSIGNMENTS,
  parameters = INITIAL_PARAMETERS,
  liveStates = {},
  onAddAssignment = () => {},
  onUpdateAssignment = () => {},
  onRemoveAssignment = () => {},
  onOpenLearnPopup = () => {},
  simTime = 0,
  bpm = 120,
}) {
  const canvasRef = useRef(null);
  const [quickTargetParam, setQuickTargetParam] = useState('cs_width');

  const safeModulators = Array.isArray(modulators) ? modulators : INITIAL_MODULATORS;
  const safeAssignments = Array.isArray(assignments) ? assignments : INITIAL_ASSIGNMENTS;
  const safeParameters = parameters || INITIAL_PARAMETERS;

  const activeMod =
    safeModulators.find((m) => m.id === selectedModId) || safeModulators[0];

  // Draw real-time animated waveform preview for the selected modulator + ghost overlays of other active modulators
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMod) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle dark grid matching Atrium's AUTO lane grid
    ctx.strokeStyle = '#1a232b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += w / 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += h / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center zero-crossing line
    ctx.strokeStyle = '#2b3945';
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Draw secondary active modulators faintly in background for multi-mod visual context
    safeModulators.forEach((mod) => {
      if (mod.id === activeMod.id || !mod.enabled) return;
      ctx.strokeStyle = `${mod.color}33`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let px = 0; px < w; px += 3) {
        const tOffset = (px / w) * 2.0;
        const val = evaluateModulator(mod, simTime + tOffset - 1.0, bpm);
        const normY = mod.polarity === 'unipolar' ? 1 - val : (1 - val) * 0.5;
        const py = 10 + normY * (h - 20);
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // Draw selected modulator waveform with glowing fill
    ctx.strokeStyle = activeMod.color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();

    const points = [];
    const windowSeconds = 2.0; // 2-second rolling oscilloscope window
    for (let px = 0; px <= w; px += 2) {
      const sampleTime = simTime - windowSeconds * 0.5 + (px / w) * windowSeconds;
      const val = evaluateModulator(activeMod, sampleTime, bpm);
      const normY =
        activeMod.polarity === 'unipolar' ? 1 - val : (1 - val) * 0.5;
      const py = 10 + normY * (h - 20);
      points.push({ x: px, y: py });
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Soft gradient fill under curve
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `${activeMod.color}40`);
    grad.addColorStop(1, `${activeMod.color}02`);
    ctx.fillStyle = grad;
    ctx.lineTo(w, h / 2);
    ctx.lineTo(0, h / 2);
    ctx.closePath();
    ctx.fill();

    // Playhead indicator in center (current instant `simTime`)
    const playheadX = w * 0.5;
    const currentVal = evaluateModulator(activeMod, simTime, bpm);
    const currentNormY =
      activeMod.polarity === 'unipolar' ? 1 - currentVal : (1 - currentVal) * 0.5;
    const playheadY = 10 + currentNormY * (h - 20);

    ctx.strokeStyle = '#ffffff55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, h);
    ctx.stroke();

    // Glowing live output bead
    ctx.fillStyle = activeMod.color;
    ctx.beginPath();
    ctx.arc(playheadX, playheadY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [activeMod, modulators, simTime, bpm]);

  const handleDragStart = (e, mod) => {
    e.dataTransfer.setData('application/atrium-modulator', mod.id);
    e.dataTransfer.effectAllowed = 'link';
  };

  const currentTypeMeta =
    (MODULATOR_TYPES || []).find((t) => t.type === activeMod?.type) ||
    (MODULATOR_TYPES && MODULATOR_TYPES[0]) || {
      type: 'LFO',
      label: 'LFO',
      subtypes: ['sine', 'triangle', 'saw', 'square'],
    };

  return (
    <div className="flex-1 grid grid-cols-12 gap-0 bg-[#0d1115] overflow-hidden select-none">
      {/* COLUMN 1 (3 Cols): Modulator Library & Active Modulators List */}
      <div className="col-span-3 border-r border-[#222b33] bg-[#13181d] flex flex-col justify-between p-2 overflow-hidden">
        {/* Create Modulator Palette (8 required types) */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7a8b99]">
              ADD MODULATOR SOURCE
            </span>
            <span className="text-[9px] text-[#5bc0de] font-mono">
              Drag source → Any Knob
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {MODULATOR_TYPES.map((mt) => (
              <button
                key={mt.type}
                type="button"
                onClick={() => onCreateModulator(mt.type)}
                className="atrium-btn-metal py-1 px-1 rounded border border-[#2c363f] text-[9px] font-bold text-[#c5d4e0] hover:text-[#38bdf8] hover:border-[#38bdf8]/60 flex items-center justify-center gap-0.5 transition-all"
                title={`Create new ${mt.label} (${mt.shortDesc})`}
              >
                <Plus className="w-2.5 h-2.5 text-[#38bdf8]" />
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Modulators Stack (Draggable chips) */}
        <div className="flex-1 mt-2 overflow-y-auto space-y-1 pr-0.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7a8b99] px-1 mb-1">
            ACTIVE MODULATORS ({safeModulators.length})
          </div>
          {safeModulators.map((mod) => {
            const isSelected = mod.id === activeMod?.id;
            const modAssignCount = safeAssignments.filter(
              (a) => a.modulatorId === mod.id
            ).length;
            const liveOut = evaluateModulator(mod, simTime, bpm);

            return (
              <div
                key={mod.id}
                draggable
                onDragStart={(e) => handleDragStart(e, mod)}
                onClick={() => onSelectMod(mod.id)}
                className={`group flex items-center justify-between px-2 py-1.5 rounded border cursor-grab active:cursor-grabbing transition-all ${
                  isSelected
                    ? 'bg-[#1c252e] border-[#38bdf8]'
                    : 'bg-[#0e1317] border-[#232c34] hover:border-[#374652]'
                }`}
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: mod.color,
                }}
                title="Drag me directly onto any Atrium knob or slider to assign modulation!"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <GripVertical className="w-3.5 h-3.5 text-[#596975] group-hover:text-white shrink-0" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateModulator(mod.id, { enabled: !mod.enabled });
                    }}
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      mod.enabled ? '' : 'opacity-25'
                    }`}
                    style={{
                      backgroundColor: mod.color,
                      boxShadow: mod.enabled ? `0 0 6px ${mod.color}` : 'none',
                    }}
                  />
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-white leading-none flex items-center gap-1.5">
                      <span>{mod.name}</span>
                      <span className="text-[9px] font-mono text-[#7a8b99] uppercase">
                        {mod.subtype}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Mini Meter Bar + Target Count Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-10 h-1.5 bg-[#080a0c] rounded-full overflow-hidden border border-[#222a31]">
                    <div
                      className="h-full transition-all duration-75"
                      style={{
                        width: `${Math.min(100, Math.max(5, ((liveOut + 1) / 2) * 100))}%`,
                        backgroundColor: mod.color,
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#151c22] text-[#9fb1bd] border border-[#28333d]">
                    {modAssignCount}
                  </span>
                  {safeModulators.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteModulator(mod.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[#6c7d8c] hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLUMN 2 (5 Cols): Selected Modulator Interactive Controls & Live Oscilloscope */}
      {activeMod && (
        <div className="col-span-5 border-r border-[#222b33] bg-[#101519] p-2.5 flex flex-col justify-between overflow-hidden">
          {/* Modulator Header Bar: Name, Type/Waveform Selector, Tempo Sync, Polarity, Drag Pill */}
          <div className="flex items-center justify-between gap-2 border-b border-[#1f2830] pb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: activeMod.color,
                  boxShadow: `0 0 8px ${activeMod.color}`,
                }}
              />
              <span className="text-[12px] font-bold tracking-wider text-white">
                {activeMod.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a2229] text-[#8ea0ad] font-mono">
                {activeMod.type}
              </span>
            </div>

            {/* Subtype / Waveform Selector Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {currentTypeMeta.subtypes.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateModulator(activeMod.id, { subtype: st })}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase transition-all ${
                    activeMod.subtype === st
                      ? 'bg-[#38bdf8] text-[#081218] font-bold shadow-[0_0_6px_rgba(56,189,248,0.4)]'
                      : 'bg-[#182026] text-[#8ea0ad] hover:text-white border border-[#27323b]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Draggable Patch Handle */}
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, activeMod)}
              className="px-2 py-0.5 rounded border border-dashed border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8] text-[9px] font-bold cursor-grab active:cursor-grabbing flex items-center gap-1 shrink-0"
              title="Drag onto any knob or slider to patch"
            >
              <span>DRAG TO TARGET</span>
            </div>
          </div>

          {/* Center Animated Waveform Visualiser + Type-Specific Interactive Overlay (STEP bars / CURVE nodes) */}
          <div className="relative my-1.5 h-[96px] rounded border border-[#26313a] bg-[#070a0d] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={480}
              height={96}
              className="w-full h-full block"
            />

            {/* Interactive Step Sequencer Bars when type === 'STEP' */}
            {activeMod.type === 'STEP' && (
              <div className="absolute inset-0 flex items-end gap-1 p-2 bg-black/40">
                {activeMod.steps.map((val, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickNorm = 1 - (e.clientY - rect.top) / rect.height;
                      const mapped = Math.max(-1, Math.min(1, clickNorm * 2 - 1));
                      const nextSteps = [...activeMod.steps];
                      nextSteps[idx] = mapped;
                      onUpdateModulator(activeMod.id, { steps: nextSteps });
                    }}
                    className="flex-1 h-full bg-[#12181f]/70 border border-[#2c3844] rounded-sm relative cursor-ns-resize flex items-end overflow-hidden"
                    title={`Step ${idx + 1}: Click to set level`}
                  >
                    <div
                      style={{
                        height: `${((val + 1) / 2) * 100}%`,
                        backgroundColor: `${activeMod.color}88`,
                      }}
                      className="w-full border-t-2 border-white"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Top-left HUD Overlay */}
            <div className="absolute top-1.5 left-2 flex items-center gap-2 pointer-events-none">
              <span className="text-[9px] font-mono text-[#8ea0ad] bg-black/60 px-1.5 py-0.5 rounded">
                {activeMod.tempoSync
                  ? `SYNC ${activeMod.syncRate} (${bpm} BPM)`
                  : `FREE ${activeMod.rate.toFixed(2)} Hz`}
              </span>
              <span className="text-[9px] font-mono text-[#8ea0ad] bg-black/60 px-1.5 py-0.5 rounded">
                DEPTH {Math.round(activeMod.depth * 100)}%
              </span>
            </div>
          </div>

          {/* Modulator Parameter Sliders Row: Rate, Depth, Phase, Offset, Smoothing, Sync & Polarity */}
          <div className="grid grid-cols-6 gap-2 items-center pt-0.5">
            {/* RATE or MACRO VALUE */}
            {activeMod.type === 'MACRO' ? (
              <div className="col-span-2 bg-[#151b21] p-1.5 rounded border border-[#242e38]">
                <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                  <span>MACRO DIAL</span>
                  <span className="font-mono text-white">
                    {Math.round((activeMod.macroValue ?? 0.5) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={activeMod.macroValue ?? 0.5}
                  onChange={(e) =>
                    onUpdateModulator(activeMod.id, {
                      macroValue: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                />
              </div>
            ) : (
              <div className="bg-[#151b21] p-1.5 rounded border border-[#242e38]">
                <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                  <span>RATE</span>
                  <span className="font-mono text-white">
                    {activeMod.tempoSync ? activeMod.syncRate : `${activeMod.rate.toFixed(2)}Hz`}
                  </span>
                </div>
                {activeMod.tempoSync ? (
                  <select
                    value={activeMod.syncRate}
                    onChange={(e) =>
                      onUpdateModulator(activeMod.id, { syncRate: e.target.value })
                    }
                    className="w-full bg-[#090c0f] text-[10px] font-mono text-[#38bdf8] rounded px-1 py-0.5 mt-0.5 border border-[#26313a]"
                  >
                    {['1/1', '1/2', '1/4', '1/8', '1/16', '1/4T', '1/8D'].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="range"
                    min="0.05"
                    max="8.0"
                    step="0.05"
                    value={activeMod.rate}
                    onChange={(e) =>
                      onUpdateModulator(activeMod.id, {
                        rate: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-1.5 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                  />
                )}
              </div>
            )}

            {/* DEPTH */}
            <div className="bg-[#151b21] p-1.5 rounded border border-[#242e38]">
              <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                <span>DEPTH</span>
                <span className="font-mono text-white">
                  {Math.round(activeMod.depth * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeMod.depth}
                onChange={(e) =>
                  onUpdateModulator(activeMod.id, {
                    depth: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
              />
            </div>

            {/* PHASE */}
            <div className="bg-[#151b21] p-1.5 rounded border border-[#242e38]">
              <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                <span>PHASE</span>
                <span className="font-mono text-white">{activeMod.phase}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={activeMod.phase}
                onChange={(e) =>
                  onUpdateModulator(activeMod.id, {
                    phase: parseInt(e.target.value, 10),
                  })
                }
                className="w-full h-1.5 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
              />
            </div>

            {/* OFFSET */}
            <div className="bg-[#151b21] p-1.5 rounded border border-[#242e38]">
              <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                <span>OFFSET</span>
                <span className="font-mono text-white">
                  {Math.round((activeMod.offset || 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.01"
                value={activeMod.offset || 0}
                onChange={(e) =>
                  onUpdateModulator(activeMod.id, {
                    offset: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
              />
            </div>

            {/* SMOOTHING */}
            <div className="bg-[#151b21] p-1.5 rounded border border-[#242e38]">
              <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                <span>SMOOTH</span>
                <span className="font-mono text-white">
                  {Math.round((activeMod.smoothing || 0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeMod.smoothing || 0}
                onChange={(e) =>
                  onUpdateModulator(activeMod.id, {
                    smoothing: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
              />
            </div>

            {/* SYNC & POLARITY TOGGLES */}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateModulator(activeMod.id, {
                    tempoSync: !activeMod.tempoSync,
                  })
                }
                className={`py-0.5 px-1.5 rounded text-[9px] font-bold border transition-all ${
                  activeMod.tempoSync
                    ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]'
                    : 'bg-[#151b21] border-[#26313a] text-[#8ea0ad]'
                }`}
              >
                SYNC {activeMod.tempoSync ? 'ON' : 'FREE'}
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateModulator(activeMod.id, {
                    polarity:
                      activeMod.polarity === 'bipolar' ? 'unipolar' : 'bipolar',
                  })
                }
                className="py-0.5 px-1.5 rounded text-[9px] font-mono bg-[#151b21] border border-[#26313a] text-[#c5d4e0] hover:text-white"
              >
                {activeMod.polarity === 'bipolar' ? '± BIPOLAR' : '+ UNIPOLAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLUMN 3 (4 Cols): Modulation Routing Matrix (SOURCE → DESTINATION) */}
      <div className="col-span-4 bg-[#12171c] p-2.5 flex flex-col justify-between overflow-hidden">
        {/* Header + Quick Assignment Bar */}
        <div className="flex items-center justify-between border-b border-[#222b33] pb-1.5">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              MODULATION ROUTING ({safeAssignments.length})
            </span>
          </div>

          {/* Quick Assign Dropdown for active modulator */}
          {activeMod && (
            <div className="flex items-center gap-1">
              <select
                value={quickTargetParam}
                onChange={(e) => setQuickTargetParam(e.target.value)}
                className="bg-[#0b0e11] border border-[#2b3640] rounded px-1.5 py-0.5 text-[9px] text-[#c5d4e0] focus:outline-none"
              >
                {Object.values(safeParameters).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.group} / {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onAddAssignment(activeMod.id, quickTargetParam)}
                className="atrium-btn-cyan px-2 py-0.5 rounded text-[9px] font-bold"
              >
                + Route {activeMod.name}
              </button>
            </div>
          )}
        </div>

        {/* Assignment Matrix List: SOURCE → DESTINATION */}
        <div className="flex-1 overflow-y-auto space-y-1.5 my-1.5 pr-0.5">
          {safeAssignments.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-[11px] text-[#6d7f8d] border border-dashed border-[#242e38] rounded p-4">
              Drag any modulator onto a knob or use "+ Route" above to create universal modulation links.
            </div>
          ) : (
            safeAssignments.map((asgn) => {
              const mod = safeModulators.find((m) => m.id === asgn.modulatorId);
              const param = safeParameters[asgn.parameterId];
              if (!mod || !param) return null;
              const liveVal = liveStates[param.id]?.modulatedValue ?? param.baseValue;

              return (
                <div
                  key={asgn.id}
                  className={`rounded border px-2.5 py-1.5 transition-all ${
                    asgn.enabled
                      ? 'bg-[#171e24] border-[#2b3640]'
                      : 'bg-[#0f1317] border-[#1d252c] opacity-60'
                  }`}
                  style={{ borderLeft: `3px solid ${mod.color}` }}
                >
                  <div className="flex items-center justify-between gap-1">
                    {/* SOURCE → DESTINATION label */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={asgn.enabled}
                        onChange={(e) =>
                          onUpdateAssignment(asgn.id, { enabled: e.target.checked })
                        }
                        className="accent-[#38bdf8] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => onSelectMod(mod.id)}
                        className="text-[10px] font-bold hover:underline shrink-0"
                        style={{ color: mod.color }}
                      >
                        {mod.name}
                      </button>
                      <ArrowRight className="w-3 h-3 text-[#657785] shrink-0" />
                      <button
                        type="button"
                        onClick={(e) =>
                          onOpenLearnPopup(
                            param.id,
                            e.currentTarget.getBoundingClientRect()
                          )
                        }
                        className="text-[10px] font-semibold text-[#e2ecf4] hover:text-[#38bdf8] truncate"
                        title="Click to inspect full parameter modulation settings (Min/Max, Offset, Polarity, Invert)"
                      >
                        {param.group} / {param.name}
                      </button>
                    </div>

                    {/* Live Readout + Polarity + Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono text-[#5bc0de]">
                        {param.displayFormat(liveVal)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateAssignment(asgn.id, { invert: !asgn.invert })
                        }
                        className={`px-1 py-0.2 rounded text-[8px] font-mono border ${
                          asgn.invert
                            ? 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/15'
                            : 'border-[#2c3740] text-[#7a8b99]'
                        }`}
                        title="Invert modulation phase"
                      >
                        INV
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveAssignment(asgn.id)}
                        className="text-[#6c7f8e] hover:text-red-400 p-0.5"
                        title="Delete routing"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Editable Depth Slider Row */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-mono uppercase text-[#7a8b99] w-10">
                      DEPTH
                    </span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={asgn.depth}
                      onChange={(e) =>
                        onUpdateAssignment(asgn.id, {
                          depth: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 h-1 bg-[#0b0e11] rounded appearance-none cursor-pointer accent-[#38bdf8]"
                    />
                    <span className="text-[9px] font-mono text-white w-9 text-right">
                      {asgn.depth >= 0 ? '+' : ''}
                      {Math.round(asgn.depth * 100)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}