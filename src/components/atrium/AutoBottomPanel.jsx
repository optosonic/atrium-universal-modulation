import React, { useEffect, useRef, useState } from 'react';
import ModWorkspace from './ModWorkspace';
import { Snowflake, Plus, Sliders } from 'lucide-react';

/**
 * Atrium Bottom AUTO Panel (Exact preservation of Screenshot 3 & 4):
 * - Top bar: MIX | AUTO (cyan) | MIDI | AUDIO | SCORE | VIDEO | STAGE | VIDEO EDIT | SECTIONS | MATRIX | MAPPING
 *   and right mode buttons: DAW | MATRIX | PARTICLES | DOME
 * - Sub-toolbar: AUTO Inst 1, MIDI Learn button, PIC, WARP, Freeze icon, drag info text, Add / Map / Pencil / Eraser / Reset
 * - Left Column:
 *   - 5 curve shape icons: BLD, SWL, FAD, PLS, RND
 *   - Mode selector: VOL | PAN | GESTURE | MOD (new integrated option!)
 *   - Automation Lane headers (VOL 0.0 dB, PAN C)
 * - Right Area:
 *   - When VOL, PAN, or GESTURE is active: shows the original orange/cyan automation timeline grid with combined live modulation overlay!
 *   - When MOD is active: reveals the interactive Universal Modulation Workspace without losing any state.
 */
export default function AutoBottomPanel({
  autoMode,
  setAutoMode,
  learnModeActive,
  setLearnModeActive,
  modulators,
  selectedModId,
  onSelectMod,
  onCreateModulator,
  onUpdateModulator,
  onDeleteModulator,
  assignments,
  parameters,
  liveStates,
  onAddAssignment,
  onUpdateAssignment,
  onRemoveAssignment,
  onOpenLearnPopup,
  onResetAllModulation,
  simTime,
  bpm,
  automationEnabled,
  setAutomationEnabled,
}) {
  const laneCanvasRef = useRef(null);
  const [selectedShapeTool, setSelectedShapeTool] = useState('BLD');

  // Draw the Automation Timeline Grid when in VOL / PAN / GESTURE mode,
  // showing BOTH the base Automation curve AND the live superimposed Modulation wave!
  useEffect(() => {
    if (autoMode === 'MOD') return;
    const canvas = laneCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Top half: Dark copper/brown tint (VOL lane from Screenshot 3)
    ctx.fillStyle = '#1d1210';
    ctx.fillRect(0, 0, w, h * 0.58);

    // Bottom half: Deep black/cyan tint (PAN lane from Screenshot 3)
    ctx.fillStyle = '#070a0d';
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

    // Vertical bar/beat grid lines
    const numCols = 32;
    for (let i = 0; i <= numCols; i++) {
      const x = (i / numCols) * w;
      ctx.strokeStyle = i % 4 === 0 ? '#2b4754' : '#1b2429';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal reference lines
    [0.15, 0.36, 0.58, 0.78].forEach((ratio, idx) => {
      ctx.strokeStyle = idx === 1 ? '#8c5332' : '#2a2220';
      ctx.lineWidth = idx === 1 ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, h * ratio);
      ctx.lineTo(w, h * ratio);
      ctx.stroke();
    });

    // Coexisting Automation + Modulation demonstration on EQ Freq / Track Volume
    const focusParamId =
      autoMode === 'VOL'
        ? 'cs_eq_freq'
        : autoMode === 'PAN'
        ? 'mixer_pan'
        : 'orbit_rotation';
    const focusParam = parameters[focusParamId];
    const span = focusParam.max - focusParam.min;

    // 1. Draw Base Automation Lane Curve (Orange line)
    ctx.strokeStyle = '#d97736';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 4) {
      const tAtX = (px / w) * 8.0;
      const autoOffset = automationEnabled
        ? Math.sin(tAtX * 0.8) * 18
        : 0;
      const py = h * 0.36 - autoOffset;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 2. Draw Live Coexisting Modulation Wave riding on top of the Automation curve!
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 3) {
      const tAtX = (px / w) * 8.0;
      const autoOffset = automationEnabled ? Math.sin(tAtX * 0.8) * 18 : 0;
      // Sum active modulators affecting this lane or Width/EQ
      const liveNorm = liveStates[focusParamId]?.normLive ?? 0.5;
      const waveOffset =
        Math.sin((tAtX + simTime) * 4.5) *
        (liveNorm - 0.5) *
        45;
      const py = h * 0.36 - autoOffset - waveOffset;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Moving Playhead on Timeline
    const playheadX = ((simTime * 0.125) % 1) * w;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, h);
    ctx.stroke();
  }, [autoMode, simTime, automationEnabled, liveStates, parameters]);

  const shapeTools = [
    { id: 'BLD', label: 'BLD', path: 'M 4 16 L 24 4' },
    { id: 'SWL', label: 'SWL', path: 'M 4 16 Q 14 2 24 16' },
    { id: 'FAD', label: 'FAD', path: 'M 4 4 L 24 16' },
    { id: 'PLS', label: 'PLS', path: 'M 4 15 L 4 5 L 11 5 L 11 15 L 18 15 L 18 5 L 24 5' },
    { id: 'RND', label: 'RND', path: 'M 3 14 L 7 5 L 11 16 L 15 4 L 19 15 L 23 6 L 26 12' },
  ];

  return (
    <div className="h-[265px] flex flex-col border-t border-[#2d3740] bg-[#161b20] select-none shrink-0">
      {/* ROW 1: Main Bottom Workspace Tab Strip (MIX, AUTO, MIDI, AUDIO, SCORE, VIDEO...) */}
      <div className="h-7 bg-[#14181c] border-b border-[#252e36] px-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[
            'MIX',
            'AUTO',
            'MIDI',
            'AUDIO',
            'SCORE',
            'VIDEO',
            'STAGE',
            'VIDEO EDIT',
            'SECTIONS',
            'MATRIX',
            'MAPPING',
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`px-3 py-0.5 rounded-sm text-[9px] font-bold tracking-wider transition-all ${
                tab === 'AUTO'
                  ? 'atrium-btn-cyan text-[#071117]'
                  : 'atrium-btn-metal text-[#9fb1bd] hover:text-white border border-[#263038]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Mode Switches (DAW, MATRIX, PARTICLES, DOME) */}
        <div className="flex items-center gap-1">
          <button className="px-2.5 py-0.5 rounded-sm text-[9px] font-bold bg-gradient-to-b from-[#9c7834] to-[#5e4619] text-white border border-[#bfa05a]">
            DAW
          </button>
          <button className="px-2.5 py-0.5 rounded-sm text-[9px] font-bold bg-gradient-to-b from-[#5e2924] to-[#381613] text-[#d6a39e] border border-[#7c3b35]">
            MATRIX
          </button>
          <button className="px-2.5 py-0.5 rounded-sm text-[9px] font-bold bg-gradient-to-b from-[#1e3a52] to-[#112233] text-[#8ec5eb] border border-[#2f587a]">
            PARTICLES
          </button>
          <button className="px-2.5 py-0.5 rounded-sm text-[9px] font-bold bg-gradient-to-b from-[#2b7a4b] to-[#184a2c] text-white border border-[#45a86c]">
            DOME
          </button>
        </div>
      </div>

      {/* ROW 2: AUTO Sub-Toolbar (AUTO Inst 1 | Learn Icon | MIDI | PIC | WARP | Freeze | Info | Add/Map/Pencil/Eraser/Reset) */}
      <div className="h-8 bg-[#1d242b] border-b border-[#28323b] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white tracking-wide">
            AUTO <span className="font-normal text-[#9fb1bd]">Inst 1</span>
          </span>

          {/* Blue Circular Learn Toggle Icon (from Screenshot 3, 4, 6) */}
          <button
            type="button"
            onClick={() => setLearnModeActive(!learnModeActive)}
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
              learnModeActive
                ? 'bg-[#38bdf8] border-white text-[#071218] shadow-[0_0_10px_#38bdf8]'
                : 'bg-[#1c4e78] border-[#5bc0de] text-white hover:bg-[#276ca3]'
            }`}
            title="Toggle Parameter Learn Highlights (MIDI | OSC | MOD)"
          >
            <span className="flex items-end gap-[1.5px] h-2.5">
              <span className="w-[1.5px] h-1.5 bg-current" />
              <span className="w-[1.5px] h-2.5 bg-current" />
              <span className="w-[1.5px] h-2 bg-current" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLearnModeActive(!learnModeActive)}
            className={`px-3 py-0.5 rounded text-[9px] font-bold tracking-wider border ${
              learnModeActive
                ? 'bg-[#34d399] text-[#06150f] border-white shadow-[0_0_8px_#34d399]'
                : 'bg-gradient-to-b from-[#2b6e44] to-[#1a472a] text-[#a7f3d0] border-[#3d945c]'
            }`}
          >
            MIDI
          </button>

          <button className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-[#38434f] text-[#c5d4e0] border border-[#4c5a69]">
            PIC
          </button>

          <button className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-[#2c192b] text-[#e879f9] border border-[#582c55]">
            WARP
          </button>

          <button
            type="button"
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              automationEnabled
                ? 'bg-[#1b456b] border-[#5bc0de] text-white'
                : 'bg-[#14191e] border-[#2c363f] text-[#697a87]'
            }`}
            title="Toggle Base Automation Lane Playback (Coexists with MOD)"
          >
            <Snowflake className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 py-0.5 rounded bg-[#233d4d] border border-[#38bdf8]/40 text-[#5bc0de] text-[9px] font-mono">
            ⌘-drag
          </span>

          <span className="text-[10px] text-[#9fb1bd] hidden xl:inline">
            {autoMode === 'MOD'
              ? 'universal modulation workspace | drag any modulator onto a knob | click badge for MIDI | OSC | MOD'
              : 'moves volume in 0.1 dB steps and past 0 dB | double-click adds a point | alt delete'}
          </span>
        </div>

        {/* Right Action Buttons: Add, Map, Pencil, Eraser, Reset */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setAutoMode('MOD');
              onCreateModulator('LFO');
            }}
            className="px-2.5 py-0.5 rounded bg-[#0c1013] hover:bg-[#171f26] text-[10px] text-[#d6e2ea] border border-[#2c363f]"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setLearnModeActive(!learnModeActive)}
            className={`px-2.5 py-0.5 rounded text-[10px] border ${
              learnModeActive
                ? 'bg-[#38bdf8] text-black font-bold border-white'
                : 'bg-[#0c1013] hover:bg-[#171f26] text-[#d6e2ea] border-[#2c363f]'
            }`}
          >
            Map
          </button>
          <button className="px-2.5 py-0.5 rounded bg-[#0c1013] hover:bg-[#171f26] text-[10px] text-[#d6e2ea] border border-[#2c363f]">
            Pencil
          </button>
          <button className="px-2.5 py-0.5 rounded bg-[#0c1013] hover:bg-[#171f26] text-[10px] text-[#d6e2ea] border border-[#2c363f]">
            Eraser
          </button>
          <button
            type="button"
            onClick={onResetAllModulation}
            className="px-2.5 py-0.5 rounded bg-[#0c1013] hover:bg-red-950/60 text-[10px] text-[#d6e2ea] border border-[#2c363f]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ROW 3: Main AUTO Split Body (Left Control Stack + Right Lane Timeline OR MOD Workspace) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Column (preserved from Screenshot 3 & 4, with VOL | PAN | GESTURE | MOD) */}
        <div className="w-[185px] border-r border-[#27313a] bg-[#181f25] p-1.5 flex flex-col justify-between shrink-0">
          <div>
            {/* 5 Shape Icons: BLD, SWL, FAD, PLS, RND */}
            <div className="grid grid-cols-5 gap-1 mb-1.5">
              {shapeTools.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedShapeTool(st.id)}
                  className={`flex flex-col items-center justify-center py-1 rounded border transition-all ${
                    selectedShapeTool === st.id
                      ? 'bg-[#0e1318] border-[#5bc0de] text-white'
                      : 'bg-[#11161b] border-[#2a343d] text-[#8ea0ad] hover:text-white'
                  }`}
                >
                  <svg width="26" height="18" viewBox="0 0 28 20">
                    <path
                      d={st.path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-[7px] font-bold tracking-wider mt-0.5">
                    {st.label}
                  </span>
                </button>
              ))}
            </div>

            {/* MODE SWITCHER: VOL | PAN | GESTURE | MOD */}
            <div className="grid grid-cols-4 gap-1 mb-1.5">
              {['VOL', 'PAN', 'GESTURE', 'MOD'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setAutoMode(m)}
                  className={`py-1 rounded text-[9px] font-bold tracking-wider border transition-all ${
                    autoMode === m
                      ? 'bg-[#3c7891] border-[#63b8d6] text-white shadow-[0_0_8px_rgba(99,184,214,0.35)]'
                      : 'bg-[#2a333c] border-[#38444f] text-[#9fb1bd] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Add Lane '+' Bar */}
            <button
              type="button"
              onClick={() => {
                if (autoMode === 'MOD') onCreateModulator('LFO');
              }}
              className="w-full py-0.5 rounded bg-[#233845] hover:bg-[#2c4757] border border-[#36586b] text-[#7ccce5] flex items-center justify-center mb-1.5"
              title="Add Modulator or Automation Lane"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* VOL & PAN Readout Boxes (matching Screenshot 3) */}
            <div className="space-y-1.5">
              <div
                onClick={() => setAutoMode('VOL')}
                className="h-11 rounded border border-[#2c3842] bg-[#070a0d] px-2.5 flex items-center justify-between cursor-pointer hover:border-[#38bdf8]/60"
              >
                <span className="text-[10px] font-bold text-[#38bdf8]">VOL</span>
                <span className="text-[10px] font-mono text-[#5bc0de]">
                  {parameters['mixer_vol'].displayFormat(
                    liveStates['mixer_vol']?.modulatedValue ?? 0
                  )}
                </span>
              </div>

              <div
                onClick={() => setAutoMode('PAN')}
                className="h-11 rounded border border-[#2c3842] bg-[#070a0d] px-2.5 flex items-center justify-between cursor-pointer hover:border-[#38bdf8]/60"
              >
                <span className="text-[10px] font-bold text-[#38bdf8]">PAN</span>
                <span className="text-[10px] font-mono text-[#5bc0de]">
                  {parameters['mixer_pan'].displayFormat(
                    liveStates['mixer_pan']?.modulatedValue ?? 0
                  )}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAutoMode(autoMode === 'MOD' ? 'VOL' : 'MOD')}
            className="w-full py-0.5 rounded bg-[#233845] border border-[#36586b] text-[#7ccce5] text-[9px] font-mono flex items-center justify-center gap-1"
          >
            <span>{autoMode === 'MOD' ? 'Viewing MOD Matrix' : 'Switch to MOD'}</span>
          </button>
        </div>

        {/* Right Content Area: Either Interactive MOD Workspace OR Coexisting Automation Lane Grid */}
        {autoMode === 'MOD' ? (
          <ModWorkspace
            modulators={modulators}
            selectedModId={selectedModId}
            onSelectMod={onSelectMod}
            onCreateModulator={onCreateModulator}
            onUpdateModulator={onUpdateModulator}
            onDeleteModulator={onDeleteModulator}
            assignments={assignments}
            parameters={parameters}
            liveStates={liveStates}
            onAddAssignment={onAddAssignment}
            onUpdateAssignment={onUpdateAssignment}
            onRemoveAssignment={onRemoveAssignment}
            onOpenLearnPopup={onOpenLearnPopup}
            simTime={simTime}
            bpm={bpm}
            showTargetInspector={true}
          />
        ) : (
          <div className="flex-1 flex flex-col bg-[#0b0e11] relative overflow-hidden">
            {/* Sub-header for Automation + Modulation Coexistence */}
            <div className="h-6 bg-[#171d22] border-b border-[#252f38] px-3 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-4">
                <span className="text-[#d97736] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d97736]" />
                  Base Automation Curve ({autoMode})
                </span>
                <span className="text-[#38bdf8] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  Live Superimposed Modulation ({assignments.filter((a) => a.enabled).length} active routes)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.2 rounded border border-[#384652] text-[9px] font-mono text-[#9fb1bd]">
                  M
                </span>
                <span className="text-[9px] font-mono text-[#7a8b99]">H 1x</span>
              </div>
            </div>

            <canvas
              ref={laneCanvasRef}
              width={1100}
              height={195}
              className="w-full flex-1 block"
            />
          </div>
        )}
      </div>
    </div>
  );
}