import React, { useEffect, useRef, useState } from 'react';
import {
  MODULATOR_TYPES,
  INITIAL_MODULATORS,
  INITIAL_ASSIGNMENTS,
  INITIAL_PARAMETERS,
  evaluateModulator,
} from '@/lib/modulationEngine';
import useModulationEngine from '@/hooks/useModulationEngine';
import StepSequencerOverlay from './StepSequencerOverlay';
import ModRoutingMatrix from './ModRoutingMatrix';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react';

/**
 * Interactive Modulator Workspace inside the Atrium AUTO tab when `MOD` is selected,
 * and inside the Standalone demonstration view.
 *
 * 1. Left Column: Modulator Library (+ LFO, RANDOM, ENVELOPE, STEP, FOLLOWER, CURVE, MACRO, FUNCTION)
 *    & Active Modulator Pills (draggable onto any parameter with custom drag indicator + target highlighting).
 * 2. Center Column: Selected Modulator Controls + High-FPS Waveform Visualiser with toggleable
 *    background traces (`BG TRACES`), drag-to-zoom, and interactive Step/Envelope editors.
 * 3. Right Column: Universal Modulation Routing Matrix (Compact & Expanded views + Selected-Target Inspector).
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
  showTargetInspector = false,
}) {
  const canvasRef = useRef(null);
  const scopeWrapRef = useRef(null);
  const [localTargetParam, setLocalTargetParam] = useState('cs_width');
  const [showBgTraces, setShowBgTraces] = useState(true);

  const engineCtx = useModulationEngine();

  const selectedTargetParamId = engineCtx?.selectedTargetParamId || localTargetParam;
  const handleSelectTargetParam = (paramId) => {
    setLocalTargetParam(paramId);
    engineCtx?.setSelectedTargetParamId?.(paramId);
  };

  // Interactive zoom & height state for the oscilloscope
  const [timeZoom, setTimeZoom] = useState(1.0); // 0.25x to 8.0x
  const [ampZoom, setAmpZoom] = useState(1.0); // 0.5x to 3.0x
  const [scopeHeight, setScopeHeight] = useState(210);
  const [canvasSize, setCanvasSize] = useState({ width: 480, height: 210 });
  const zoomDragRef = useRef(null);

  const safeModulators = Array.isArray(modulators) ? modulators : INITIAL_MODULATORS;
  const safeAssignments = Array.isArray(assignments) ? assignments : INITIAL_ASSIGNMENTS;
  const safeParameters = parameters || INITIAL_PARAMETERS;

  const activeMod =
    safeModulators.find((m) => m.id === selectedModId) || safeModulators[0];

  // Keep canvas resolution synced to container dimensions
  useEffect(() => {
    const el = scopeWrapRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scopeHeight]);

  // Drag on waveform canvas to zoom time (horizontal/vertical drag) and amplitude
  const handleScopeMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    zoomDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTimeZoom: timeZoom,
      startAmpZoom: ampZoom,
    };

    const handleMove = (moveEvent) => {
      if (!zoomDragRef.current) return;
      const dx = moveEvent.clientX - zoomDragRef.current.startX;
      const dy = zoomDragRef.current.startY - moveEvent.clientY;
      const timeFactor = Math.pow(1.008, dx + dy);
      const nextTimeZoom = Math.max(
        0.25,
        Math.min(8.0, zoomDragRef.current.startTimeZoom * timeFactor)
      );
      setTimeZoom(nextTimeZoom);

      if (moveEvent.shiftKey) {
        const ampFactor = Math.pow(1.006, dy);
        setAmpZoom(
          Math.max(0.5, Math.min(3.0, zoomDragRef.current.startAmpZoom * ampFactor))
        );
      }
    };

    const handleUp = () => {
      zoomDragRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const handleScopeWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    if (e.shiftKey) {
      setAmpZoom((prev) => Math.max(0.5, Math.min(3.0, prev * factor)));
    } else {
      setTimeZoom((prev) => Math.max(0.25, Math.min(8.0, prev * factor)));
    }
  };

  // Bottom handle drag to resize the waveform box height
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = scopeHeight;

    const onMove = (moveEvent) => {
      const nextH = Math.max(96, Math.min(420, startH + (moveEvent.clientY - startY)));
      setScopeHeight(nextH);
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Draw real-time animated waveform preview for the selected modulator + optional ghost overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMod) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // When STEP is active, StepSequencerOverlay renders the dedicated step grid directly
    if (activeMod.type === 'STEP') return;

    const windowSeconds = 2.0 / timeZoom;

    // Subtle dark grid matching Atrium's AUTO lane grid
    ctx.strokeStyle = '#1a232b';
    ctx.lineWidth = 1;
    const gridCols = Math.max(4, Math.min(16, Math.round(8 * timeZoom)));
    for (let i = 0; i <= gridCols; i++) {
      const x = (i / gridCols) * w;
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

    const padY = 16;
    const mapValToY = (val, polarity) => {
      const scaled = Math.max(-1.2, Math.min(1.2, val * ampZoom));
      const normY = polarity === 'unipolar' ? 1 - scaled : (1 - scaled) * 0.5;
      return padY + normY * (h - padY * 2);
    };

    // Subdued background traces of other active continuous modulators (when showBgTraces is on)
    if (showBgTraces) {
      safeModulators.forEach((mod) => {
        if (mod.id === activeMod.id || !mod.enabled || mod.type === 'STEP') return;
        ctx.strokeStyle = `${mod.color}2e`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let px = 0; px < w; px += 3) {
          const sampleTime =
            simTime - windowSeconds * 0.5 + (px / w) * windowSeconds;
          const val = evaluateModulator(mod, sampleTime, bpm);
          const py = mapValToY(val, mod.polarity);
          if (px === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });
    }

    // Draw selected modulator waveform with dominant stroke & fill
    ctx.strokeStyle = activeMod.color;
    ctx.lineWidth = 2.3;
    ctx.beginPath();

    for (let px = 0; px <= w; px += 2) {
      const sampleTime = simTime - windowSeconds * 0.5 + (px / w) * windowSeconds;
      const val = evaluateModulator(activeMod, sampleTime, bpm);
      const py = mapValToY(val, activeMod.polarity);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    const baselineY = activeMod.polarity === 'unipolar' ? h - padY : h / 2;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `${activeMod.color}3d`);
    grad.addColorStop(1, `${activeMod.color}03`);
    ctx.fillStyle = grad;
    ctx.lineTo(w, baselineY);
    ctx.lineTo(0, baselineY);
    ctx.closePath();
    ctx.fill();

    // Playhead indicator in center (current instant `simTime`)
    const playheadX = w * 0.5;
    const currentVal = evaluateModulator(activeMod, simTime, bpm);
    const playheadY = mapValToY(currentVal, activeMod.polarity);

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
  }, [
    activeMod,
    safeModulators,
    simTime,
    bpm,
    timeZoom,
    ampZoom,
    canvasSize,
    showBgTraces,
  ]);

  // Create custom colour-coded drag badge & notify engine to highlight all eligible targets
  const handleDragStart = (e, mod) => {
    e.dataTransfer.setData('application/atrium-modulator', mod.id);
    e.dataTransfer.effectAllowed = 'link';
    engineCtx?.setDraggingModId?.(mod.id);

    // Custom high-contrast drag ghost pill containing modulator name & colour
    const badge = document.createElement('div');
    badge.style.position = 'fixed';
    badge.style.top = '-1000px';
    badge.style.left = '-1000px';
    badge.style.padding = '4px 10px';
    badge.style.borderRadius = '4px';
    badge.style.background = '#0d1318';
    badge.style.border = `2px solid ${mod.color}`;
    badge.style.color = '#ffffff';
    badge.style.fontFamily = 'JetBrains Mono, monospace';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = '700';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '6px';
    badge.style.boxShadow = `0 4px 14px rgba(0,0,0,0.85)`;
    badge.innerHTML = `<span style="width:8px;height:8px;border-radius:999px;background:${mod.color};display:inline-block;"></span><span>ASSIGN ${mod.name}</span>`;
    document.body.appendChild(badge);
    e.dataTransfer.setDragImage(badge, 14, 14);
    setTimeout(() => {
      if (badge.parentNode) badge.parentNode.removeChild(badge);
    }, 0);
  };

  const handleDragEnd = () => {
    engineCtx?.setDraggingModId?.(null);
  };

  const currentTypeMeta =
    (MODULATOR_TYPES || []).find((t) => t.type === activeMod?.type) ||
    (MODULATOR_TYPES && MODULATOR_TYPES[0]) || {
      type: 'LFO',
      label: 'LFO',
      subtypes: ['sine', 'triangle', 'saw', 'square'],
    };

  const currentLiveOut = activeMod ? evaluateModulator(activeMod, simTime, bpm) : 0;

  return (
    <div className="flex-1 grid grid-cols-12 gap-0 bg-[#0d1115] overflow-hidden select-none">
      {/* COLUMN 1 (3 Cols): Modulator Library & Active Modulators List */}
      <div className="col-span-3 border-r border-[#222b33] bg-[#13181d] flex flex-col justify-start p-2 overflow-hidden">
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
            const meterPct =
              mod.polarity === 'unipolar'
                ? Math.min(100, Math.max(4, liveOut * 100))
                : Math.min(100, Math.max(4, ((liveOut + 1) / 2) * 100));

            return (
              <div
                key={mod.id}
                draggable
                onDragStart={(e) => handleDragStart(e, mod)}
                onDragEnd={handleDragEnd}
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
                title="Drag onto any Atrium knob or slider to assign modulation"
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
                    title={mod.enabled ? 'Disable modulator' : 'Enable modulator'}
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
                        width: `${meterPct}%`,
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
                      title="Delete modulator"
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

      {/* COLUMN 2 (5 Cols): Selected Modulator Interactive Controls & Live Oscilloscope (Top-Justified) */}
      {activeMod && (
        <div className="col-span-5 border-r border-[#222b33] bg-[#101519] p-2.5 flex flex-col justify-start gap-2 overflow-y-auto">
          {/* Modulator Header Bar: Name, Type/Waveform Selector, Draggable Patch Handle */}
          <div className="flex items-center justify-between gap-2 border-b border-[#1f2830] pb-1.5 shrink-0">
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

            {/* Subtype / Waveform Selector Pills + Integer Step Count Stepper */}
            <div className="flex items-center gap-1 flex-wrap">
              {currentTypeMeta.subtypes.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    const patch = { subtype: st };
                    if (activeMod.type === 'STEP') {
                      const cur = activeMod.steps || [];
                      if (st === '32-step' && cur.length !== 32) {
                        patch.steps = Array.from({ length: 32 }, (_, i) =>
                          cur[i % (cur.length || 1)] ?? 0
                        );
                      } else if (st === '16-step' && cur.length !== 16) {
                        patch.steps = Array.from({ length: 16 }, (_, i) =>
                          cur[i % (cur.length || 1)] ?? 0
                        );
                      } else if (st === '8-step' && cur.length !== 8) {
                        patch.steps = Array.from({ length: 8 }, (_, i) =>
                          cur[i % (cur.length || 1)] ?? 0
                        );
                      } else if (st === 'euclidean') {
                        const len = cur.length || 8;
                        patch.steps = Array.from({ length: len }, (_, i) =>
                          (i * 3) % len < 3 ? 0.85 : -0.6
                        );
                      }
                    }
                    onUpdateModulator(activeMod.id, patch);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase transition-all ${
                    activeMod.subtype === st
                      ? 'bg-[#38bdf8] text-[#081218] font-bold shadow-[0_0_6px_rgba(56,189,248,0.4)]'
                      : 'bg-[#182026] text-[#8ea0ad] hover:text-white border border-[#27323b]'
                  }`}
                >
                  {st}
                </button>
              ))}

              {/* Arbitrary Integer Step Count Selector (2..32: 3, 5, 6, 7, 8, etc.) */}
              {activeMod.type === 'STEP' && (
                <div
                  className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-[#0c1116] border border-[#2a3642]"
                  title="Set any integer number of steps (e.g. 3, 5, 6, 7, 8, 9, 12, 16, 32)"
                >
                  <span className="text-[8px] font-mono uppercase text-[#5bc0de]">
                    STEPS
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = activeMod.steps || [];
                      const nextLen = Math.max(2, (cur.length || 8) - 1);
                      const nextSteps = Array.from({ length: nextLen }, (_, i) =>
                        cur[i % (cur.length || 1)] ?? 0
                      );
                      onUpdateModulator(activeMod.id, {
                        steps: nextSteps,
                        subtype:
                          activeMod.subtype === 'euclidean'
                            ? 'euclidean'
                            : `${nextLen}-step`,
                      });
                    }}
                    className="px-1 text-[10px] font-mono text-[#9fb1bd] hover:text-white"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="2"
                    max="32"
                    step="1"
                    value={(activeMod.steps || []).length || 8}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value, 10);
                      if (Number.isNaN(raw)) return;
                      const nextLen = Math.max(2, Math.min(32, raw));
                      const cur = activeMod.steps || [];
                      const nextSteps = Array.from({ length: nextLen }, (_, i) =>
                        cur[i % (cur.length || 1)] ?? 0
                      );
                      onUpdateModulator(activeMod.id, {
                        steps: nextSteps,
                        subtype:
                          activeMod.subtype === 'euclidean'
                            ? 'euclidean'
                            : `${nextLen}-step`,
                      });
                    }}
                    className="w-8 bg-transparent text-center text-[10px] font-mono font-bold text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cur = activeMod.steps || [];
                      const nextLen = Math.min(32, (cur.length || 8) + 1);
                      const nextSteps = Array.from({ length: nextLen }, (_, i) =>
                        cur[i % (cur.length || 1)] ?? 0
                      );
                      onUpdateModulator(activeMod.id, {
                        steps: nextSteps,
                        subtype:
                          activeMod.subtype === 'euclidean'
                            ? 'euclidean'
                            : `${nextLen}-step`,
                      });
                    }}
                    className="px-1 text-[10px] font-mono text-[#9fb1bd] hover:text-white"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            {/* Draggable Patch Handle */}
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, activeMod)}
              onDragEnd={handleDragEnd}
              className="px-2 py-0.5 rounded border border-dashed border-[#38bdf8] bg-[#38bdf8]/10 text-[#38bdf8] text-[9px] font-bold cursor-grab active:cursor-grabbing flex items-center gap-1 shrink-0"
              title="Drag onto any knob or slider to patch"
            >
              <span>DRAG TO TARGET</span>
            </div>
          </div>

          {/* Top-Justified Animated Waveform Visualiser (Dedicated HUD Bar + Unobstructed Scope) */}
          <div className="shrink-0 rounded border border-[#26313a] bg-[#070a0d] overflow-hidden flex flex-col">
            {/* Dedicated Scope Header Bar — never overlaps waveform peaks or troughs */}
            <div className="h-6 px-2 bg-[#0c1116] border-b border-[#1c262e] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#8ea0ad]">
                  {activeMod.tempoSync
                    ? `SYNC ${activeMod.syncRate}${
                        (activeMod.rateDiv || 1) > 1 ? ` ×${activeMod.rateDiv}` : ''
                      } (${bpm} BPM)`
                    : `FREE ${(activeMod.rate * (activeMod.rateDiv || 1)).toFixed(2)} Hz`}
                </span>
                {activeMod.type === 'STEP' && (
                  <>
                    <span className="text-[#2c3a46]">·</span>
                    <span className="text-[9px] font-mono text-[#5bc0de]">
                      {(activeMod.steps || []).length} STEPS
                    </span>
                  </>
                )}
                <span className="text-[#2c3a46]">·</span>
                <span className="text-[9px] font-mono text-[#8ea0ad]">
                  DEPTH {Math.round(activeMod.depth * 100)}%
                </span>
                <span className="text-[#2c3a46]">·</span>
                <span
                  className="text-[9px] font-mono tabular-nums"
                  style={{ color: activeMod.color }}
                >
                  OUT {currentLiveOut >= 0 ? '+' : ''}
                  {currentLiveOut.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {activeMod.type === 'STEP' ? (
                  <div className="flex items-center gap-1 mr-1">
                    <span className="text-[8px] font-mono text-[#5bc0de] mr-1">
                      DRAG ACROSS BARS
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateModulator(activeMod.id, {
                          steps: (activeMod.steps || []).map(
                            () => +(Math.random() * 2 - 1).toFixed(2)
                          ),
                        })
                      }
                      className="px-1.5 py-0.2 rounded bg-[#151d24] hover:bg-[#1f2b35] text-[8px] font-mono text-[#9fb1bd] hover:text-white border border-[#26323d]"
                      title="Randomize all steps"
                    >
                      RND
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateModulator(activeMod.id, {
                          steps: (activeMod.steps || []).map((v) => -v),
                        })
                      }
                      className="px-1.5 py-0.2 rounded bg-[#151d24] hover:bg-[#1f2b35] text-[8px] font-mono text-[#9fb1bd] hover:text-white border border-[#26323d]"
                      title="Invert all steps"
                    >
                      INV
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateModulator(activeMod.id, {
                          steps: (activeMod.steps || []).map(() =>
                            activeMod.polarity === 'unipolar' ? -1 : 0
                          ),
                        })
                      }
                      className="px-1.5 py-0.2 rounded bg-[#151d24] hover:bg-[#1f2b35] text-[8px] font-mono text-[#9fb1bd] hover:text-white border border-[#26323d]"
                      title="Clear all steps"
                    >
                      CLR
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Toggle to show/hide other active modulators' background traces */}
                    <button
                      type="button"
                      onClick={() => setShowBgTraces((v) => !v)}
                      className={`px-1.5 py-0.2 rounded text-[8px] font-mono flex items-center gap-1 border mr-1 transition-all ${
                        showBgTraces
                          ? 'bg-[#15222c] border-[#38bdf8]/50 text-[#7dd3fc]'
                          : 'bg-[#12171c] border-[#242e38] text-[#6c7d8c] hover:text-white'
                      }`}
                      title="Show or hide background traces of other active modulators"
                    >
                      {showBgTraces ? (
                        <Eye className="w-2.5 h-2.5" />
                      ) : (
                        <EyeOff className="w-2.5 h-2.5" />
                      )}
                      <span>BG TRACES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setTimeZoom((z) => Math.max(0.25, +(z / 1.25).toFixed(2)))
                      }
                      className="px-1 text-[9px] font-mono text-[#9fb1bd] hover:text-white"
                      title="Zoom Out"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeZoom(1.0);
                        setAmpZoom(1.0);
                      }}
                      className="px-1 text-[9px] font-mono text-[#38bdf8] hover:underline"
                      title="Click to reset zoom (1.0x)"
                    >
                      {timeZoom.toFixed(2)}x
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTimeZoom((z) => Math.min(8.0, +(z * 1.25).toFixed(2)))
                      }
                      className="px-1 text-[9px] font-mono text-[#9fb1bd] hover:text-white"
                      title="Zoom In"
                    >
                      +
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Pure Waveform Canvas Area */}
            <div
              ref={scopeWrapRef}
              style={{ height: scopeHeight }}
              onMouseDown={activeMod.type !== 'STEP' ? handleScopeMouseDown : undefined}
              onWheel={handleScopeWheel}
              onDoubleClick={() => {
                if (activeMod.type !== 'STEP') {
                  setTimeZoom(1.0);
                  setAmpZoom(1.0);
                }
              }}
              className="relative w-full cursor-ns-resize group"
              title={
                activeMod.type === 'STEP'
                  ? undefined
                  : 'Drag up/down or left/right to zoom waveform • Shift+drag for vertical gain • Double-click to reset zoom'
              }
            >
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="w-full h-full block"
              />

              {/* Interactive Multi-Drag Step Sequencer when type === 'STEP' */}
              {activeMod.type === 'STEP' && (
                <StepSequencerOverlay
                  modulator={activeMod}
                  simTime={simTime}
                  bpm={bpm}
                  onUpdateSteps={(nextSteps) =>
                    onUpdateModulator(activeMod.id, { steps: nextSteps })
                  }
                />
              )}
            </div>

            {/* Dedicated Bottom Drag Handle outside the canvas so troughs are never covered */}
            <div
              onMouseDown={handleResizeMouseDown}
              className="h-2.5 bg-[#0c1116] border-t border-[#1c262e] hover:bg-[#16222c] cursor-row-resize flex items-center justify-center shrink-0"
              title="Drag to resize waveform height"
            >
              <span className="w-8 h-[2px] rounded-full bg-[#3a4956]" />
            </div>
          </div>

          {/* Modulator Parameter Sliders Row: Rate, Int Rate / Steps, Depth, Phase, Offset, Smoothing, Sync & Polarity */}
          <div className="grid grid-cols-7 gap-1.5 items-center shrink-0">
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
              <>
                {/* Primary RATE (Binary / Tuplet Sync or Free Hz) */}
                <div className="bg-[#151b21] p-1.5 rounded border border-[#242e38]">
                  <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                    <span>RATE</span>
                    <span className="font-mono text-white">
                      {activeMod.tempoSync
                        ? activeMod.syncRate
                        : `${activeMod.rate.toFixed(2)}Hz`}
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
                      {[
                        '4/1',
                        '2/1',
                        '1/1',
                        '1/2',
                        '1/4',
                        '1/8',
                        '1/16',
                        '1/4T',
                        '1/8D',
                      ].map((r) => (
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

                {/* Second Rate: Integer Rate Subdivision / Multiplier (1, 2, 3, 4, 5, 6, 7, 8..32) */}
                <div
                  className="bg-[#151b21] p-1.5 rounded border border-[#242e38]"
                  title="Second Integer Rate Subdivision (e.g. 3, 5, 6, 7, 8... for non-binary tuplets & polyrhythms)"
                >
                  <div className="flex justify-between text-[9px] text-[#8ea0ad]">
                    <span>INT RATE</span>
                    <span className="font-mono text-[#38bdf8]">
                      ×{Math.max(1, Math.round(activeMod.rateDiv || 1))}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    step="1"
                    value={Math.max(1, Math.round(activeMod.rateDiv || 1))}
                    onChange={(e) =>
                      onUpdateModulator(activeMod.id, {
                        rateDiv: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full h-1.5 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                  />
                </div>
              </>
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

          {/* Envelope Stage Controls when activeMod.type === 'ENVELOPE' */}
          {activeMod.type === 'ENVELOPE' && (
            <div className="grid grid-cols-4 gap-2 shrink-0">
              {[
                { key: 'a', label: 'ATTACK' },
                { key: 'd', label: 'DECAY' },
                { key: 's', label: 'SUSTAIN' },
                { key: 'r', label: 'RELEASE' },
              ].map((stage) => {
                const val = activeMod.adsr?.[stage.key] ?? 0.3;
                return (
                  <div
                    key={stage.key}
                    className="bg-[#151b21] p-1.5 rounded border border-[#242e38]"
                  >
                    <div className="flex justify-between text-[8px] text-[#8ea0ad]">
                      <span>{stage.label}</span>
                      <span className="font-mono text-white">
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.02"
                      max="1"
                      step="0.01"
                      value={val}
                      onChange={(e) =>
                        onUpdateModulator(activeMod.id, {
                          adsr: {
                            ...(activeMod.adsr || { a: 0.2, d: 0.3, s: 0.5, r: 0.3 }),
                            [stage.key]: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full h-1 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* COLUMN 3 (4 Cols): Modulation Routing Matrix (SOURCE -> DESTINATION) */}
      <ModRoutingMatrix
        modulators={safeModulators}
        activeMod={activeMod}
        assignments={safeAssignments}
        parameters={safeParameters}
        liveStates={liveStates}
        selectedTargetParamId={selectedTargetParamId}
        onSelectTargetParam={handleSelectTargetParam}
        showTargetInspector={showTargetInspector}
        onSelectMod={onSelectMod}
        onAddAssignment={onAddAssignment}
        onUpdateAssignment={onUpdateAssignment}
        onRemoveAssignment={onRemoveAssignment}
        onOpenLearnPopup={onOpenLearnPopup}
      />
    </div>
  );
}