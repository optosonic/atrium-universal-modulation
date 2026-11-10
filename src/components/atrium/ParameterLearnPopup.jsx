import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { MODULATOR_TYPES, valueToNorm, normToValue } from '@/lib/modulationEngine';

/**
 * Extended Parameter Assignment Popup:
 * Preserves the exact Atrium MIDI Learn popup look ("LEARN Width",
 * DEVICE / CH / CTRL, Fixed / Selected track, RANGE 0..127), and extends the top header
 * with the required: MIDI | OSC | MOD mode selector.
 * Allows direct assignment of existing modulators or immediate creation + assignment of new modulators
 * from anywhere in Atrium without opening the AUTO tab.
 */
export default function ParameterLearnPopup({
  param,
  liveState,
  modulators = [],
  assignments = [],
  onClose = () => {},
  onAddAssignment = () => {},
  onUpdateAssignment = () => {},
  onRemoveAssignment = () => {},
  onCreateModulatorAndAssign = () => {},
  initialTab = 'MOD',
}) {
  const safeModulators = Array.isArray(modulators) ? modulators : [];
  const safeAssignments = Array.isArray(assignments) ? assignments : [];
  const [activeTab, setActiveTab] = useState(initialTab); // 'MIDI' | 'OSC' | 'MOD'
  const [midiScope, setMidiScope] = useState('fixed'); // 'fixed' | 'selected'
  const [midiMin, setMidiMin] = useState(0);
  const [midiMax, setMidiMax] = useState(127);
  const [selectedModId, setSelectedModId] = useState(safeModulators[0]?.id || '');

  useEffect(() => {
    if (!selectedModId && safeModulators[0]?.id) {
      setSelectedModId(safeModulators[0].id);
    }
  }, [safeModulators, selectedModId]);

  if (!param) return null;

  const paramAssignments = safeAssignments.filter((a) => a.parameterId === param.id);
  const assignedModIds = new Set(paramAssignments.map((a) => a.modulatorId));

  // Helper for linear or logarithmic min/max range sliders
  const toSliderNorm = (val) => valueToNorm(param, val ?? param.min);
  const fromSliderNorm = (norm) => {
    const raw = normToValue(param, norm);
    if (param.step >= 1) return Math.round(raw);
    return Number(raw.toFixed(2));
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 w-[475px] rounded-md border border-[#3d4b56] bg-[#1c2227]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-[#d6e2ea] select-none overflow-hidden"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Popup Top Bar — matches Screenshot 7 + MIDI | OSC | MOD selector */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a343d] bg-[#171c20]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[#5bc0de] uppercase">
              LEARN
            </span>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight truncate">
            {param.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252e36] text-[#8fa3b0] font-mono shrink-0">
            {param.plugin}
          </span>
        </div>

        {/* Mode Switcher: MIDI | OSC | MOD */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded bg-[#0d1114] p-0.5 border border-[#2c363f]">
            {['MIDI', 'OSC', 'MOD'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-0.5 text-[10px] font-bold tracking-wider rounded transition-all ${
                  activeTab === tab
                    ? 'bg-[#63b8d6] text-[#091217] shadow-[0_0_8px_rgba(99,184,214,0.4)]'
                    : 'text-[#899aa6] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#899aa6] hover:text-white p-1 rounded hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: Original MIDI Learn Interface */}
      {activeTab === 'MIDI' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between text-[11px] text-[#9fb1bd]">
            <span>Assigned Hardware Control</span>
            <span className="text-[#d6e2ea] font-medium">Move a CC, note, or pitch bend.</span>
          </div>

          {/* LCD Readout Box */}
          <div className="atrium-lcd rounded border border-[#2a333b] p-3 grid grid-cols-12 gap-2 items-center">
            <div className="col-span-8 border-r border-[#222a30] pr-3">
              <div className="text-[9px] uppercase tracking-wider text-[#667885]">DEVICE</div>
              <div className="text-[13px] font-mono text-[#5bc0de] mt-0.5">
                {param.midiCC ? 'Atrium Virtual Surface' : '--'}
              </div>
            </div>
            <div className="col-span-2 border-r border-[#222a30] px-2">
              <div className="text-[9px] uppercase tracking-wider text-[#667885]">CH</div>
              <div className="text-[13px] font-mono text-[#d6e2ea] mt-0.5">
                {param.midiCC ? '01' : '--'}
              </div>
            </div>
            <div className="col-span-2 pl-2">
              <div className="text-[9px] uppercase tracking-wider text-[#667885]">CTRL</div>
              <div className="text-[13px] font-mono text-[#5bc0de] mt-0.5">
                {param.midiCC ? `CC ${param.midiCC}` : '--'}
              </div>
            </div>
          </div>

          {/* Fixed / Selected Track + SET / Reset / Cancel */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center rounded border border-[#3a4650] bg-[#0e1317] p-0.5">
              <button
                type="button"
                onClick={() => setMidiScope('fixed')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                  midiScope === 'fixed'
                    ? 'bg-[#63b8d6] text-[#0b151b] font-semibold'
                    : 'text-[#8ea0ad]'
                }`}
              >
                <span className="w-2 h-2 rounded-full border border-current flex items-center justify-center">
                  {midiScope === 'fixed' && <span className="w-1 h-1 rounded-full bg-current" />}
                </span>
                Fixed
              </button>
              <button
                type="button"
                onClick={() => setMidiScope('selected')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
                  midiScope === 'selected'
                    ? 'bg-[#63b8d6] text-[#0b151b] font-semibold'
                    : 'text-[#8ea0ad]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                Selected track
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <button type="button" className="text-[#9fb1bd] hover:text-white font-medium">
                • SET
              </button>
              <button
                type="button"
                onClick={() => {
                  setMidiMin(0);
                  setMidiMax(127);
                }}
                className="text-[#5bc0de] hover:underline font-medium"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-[#9fb1bd] hover:text-white font-medium"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Range Slider */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] uppercase tracking-wider text-[#6b7d8a]">RANGE</span>
            <span className="text-[12px] font-mono text-white">{midiMin}</span>
            <div className="relative flex-1 h-2 bg-[#0e1317] rounded-full border border-[#2c363f] flex items-center">
              <div
                className="h-full bg-[#63b8d6] rounded-full"
                style={{
                  marginLeft: `${(midiMin / 127) * 100}%`,
                  width: `${((midiMax - midiMin) / 127) * 100}%`,
                }}
              />
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#63b8d6] shadow -ml-1.5" />
            </div>
            <span className="text-[12px] font-mono text-white">{midiMax}</span>
          </div>
        </div>
      )}

      {/* TAB 2: OSC Assignment Interface */}
      {activeTab === 'OSC' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-[#9fb1bd]">
            <span>Open Sound Control Path</span>
            <span className="font-mono text-[#5bc0de]">UDP Port 8000 • Active</span>
          </div>
          <div className="atrium-lcd rounded border border-[#2a333b] p-3 space-y-2">
            <div className="text-[9px] uppercase tracking-wider text-[#667885]">OSC ADDRESS</div>
            <input
              type="text"
              defaultValue={param.oscAddress}
              className="w-full bg-transparent text-[13px] font-mono text-[#5bc0de] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#12171b] p-2 rounded border border-[#263038]">
              <span className="text-[#6b7d8a] block text-[9px]">MIN VALUE</span>
              <span className="font-mono text-white">{param.displayFormat(param.min)}</span>
            </div>
            <div className="bg-[#12171b] p-2 rounded border border-[#263038]">
              <span className="text-[#6b7d8a] block text-[9px]">MAX VALUE</span>
              <span className="font-mono text-white">{param.displayFormat(param.max)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Universal MOD Assignment Interface */}
      {activeTab === 'MOD' && (
        <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
          {/* Live Value & Excursion Range Summary */}
          <div className="atrium-lcd rounded border border-[#2a333b] px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#6b7d8a]">
                BASE / EXCURSION RANGE / LIVE MODULATED
              </div>
              <div className="text-[11px] font-mono flex items-center gap-2 mt-0.5">
                <span className="text-[#8ea0ad]">
                  Base: {param.displayFormat(param.baseValue)}
                </span>
                <span className="text-[#394854]">•</span>
                <span className="text-[#9fb1bd]">
                  Range:{' '}
                  {param.displayFormat(liveState?.rangeMinValue ?? param.baseValue)} ..{' '}
                  {param.displayFormat(liveState?.rangeMaxValue ?? param.baseValue)}
                </span>
                <span className="text-[#394854]">•</span>
                <span className="text-[#38bdf8] font-semibold">
                  Live: {param.displayFormat(liveState?.modulatedValue ?? param.baseValue)}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1b242c] border border-[#303d48] text-[#9fb1bd]">
                {paramAssignments.length} {paramAssignments.length === 1 ? 'Source' : 'Sources'}
              </span>
            </div>
          </div>

          {/* Available Modulators: 1-Click Assign Pills + Dropdown */}
          <div className="bg-[#14191d] p-2.5 rounded border border-[#27313a] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#7a8b99]">
                Available Modulators (Click to Assign)
              </span>
              <span className="text-[9px] font-mono text-[#5bc0de]">
                No need to open AUTO tab
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {safeModulators.map((m) => {
                const isAssigned = assignedModIds.has(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onAddAssignment(m.id, param.id)}
                    className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 border transition-all ${
                      isAssigned
                        ? 'bg-[#1c2630] border-[#38bdf8]/60 text-white'
                        : 'bg-[#0d1115] border-[#26313a] text-[#c5d4e0] hover:border-[#38bdf8] hover:text-white'
                    }`}
                    style={{ borderLeftWidth: '3px', borderLeftColor: m.color }}
                    title={
                      isAssigned
                        ? `${m.name} is already assigned to ${param.name}`
                        : `Assign ${m.name} (${m.type}) to ${param.name}`
                    }
                  >
                    <span>{isAssigned ? '✓' : '+'}</span>
                    <span>{m.name}</span>
                    <span className="text-[8px] font-mono text-[#7a8b99] uppercase">
                      {m.subtype}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Create New Modulator & Assign Immediately */}
            <div className="pt-2 border-t border-[#1f2830]">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#7a8b99] mb-1.5">
                Create New Modulator & Assign Immediately
              </div>
              <div className="grid grid-cols-4 gap-1">
                {MODULATOR_TYPES.map((mt) => (
                  <button
                    key={mt.type}
                    type="button"
                    onClick={() => onCreateModulatorAndAssign(mt.type, param.id)}
                    className="atrium-btn-metal py-1 px-1.5 rounded border border-[#2c363f] text-[9px] font-bold text-[#c5d4e0] hover:text-[#38bdf8] hover:border-[#38bdf8]/60 flex items-center justify-center gap-1 transition-all"
                    title={`Create new ${mt.label} and immediately route to ${param.name}`}
                  >
                    <Plus className="w-2.5 h-2.5 text-[#38bdf8]" />
                    <span>New {mt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Modulator Assignments on this Parameter */}
          {paramAssignments.length === 0 ? (
            <div className="text-center py-5 border border-dashed border-[#2b353e] rounded text-[11px] text-[#778896]">
              No modulators assigned to <span className="text-white">{param.name}</span> yet.
              <br />
              Click any modulator above or create a new one to assign immediately.
            </div>
          ) : (
            <div className="space-y-2">
              {paramAssignments.map((asgn) => {
                const mod = safeModulators.find((m) => m.id === asgn.modulatorId);
                if (!mod) return null;
                const minVal = asgn.min ?? param.min;
                const maxVal = asgn.max ?? param.max;
                return (
                  <div
                    key={asgn.id}
                    className="rounded border border-[#2d3842] bg-[#13181c] p-2.5 space-y-2"
                    style={{ borderLeft: `3px solid ${mod.color}` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={asgn.enabled}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, { enabled: e.target.checked })
                          }
                          className="accent-[#38bdf8]"
                        />
                        <span
                          className="text-[11px] font-bold tracking-wide"
                          style={{ color: mod.color }}
                        >
                          {mod.name}
                        </span>
                        <span className="text-[10px] text-[#7a8b99] font-mono">
                          → {param.group} / {param.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAssignment(asgn.id, {
                              polarity:
                                asgn.polarity === 'bipolar' ? 'unipolar' : 'bipolar',
                            })
                          }
                          className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-[#1e262d] border border-[#323e49] text-[#b8c7d4] hover:text-white"
                        >
                          {asgn.polarity === 'bipolar' ? '± BIPOLAR' : '+ UNIPOLAR'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAssignment(asgn.id, { invert: !asgn.invert })
                          }
                          className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${
                            asgn.invert
                              ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]'
                              : 'bg-[#1e262d] border-[#323e49] text-[#8ea0ad]'
                          }`}
                        >
                          INV
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveAssignment(asgn.id)}
                          className="p-1 text-[#778896] hover:text-red-400 transition-colors"
                          title="Remove assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Depth & Smoothing / Offset Sliders */}
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div>
                        <div className="flex justify-between text-[#8ea0ad] mb-0.5">
                          <span>DEPTH</span>
                          <span className="font-mono text-white">
                            {asgn.depth >= 0 ? '+' : ''}
                            {Math.round(asgn.depth * 100)}%
                          </span>
                        </div>
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
                          className="w-full h-1.5 bg-[#0b0e11] rounded appearance-none cursor-pointer accent-[#38bdf8]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[#8ea0ad] mb-0.5">
                          <span>SMOOTHING</span>
                          <span className="font-mono text-white">
                            {Math.round((asgn.smoothing || 0) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={asgn.smoothing || 0}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, {
                              smoothing: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-1.5 bg-[#0b0e11] rounded appearance-none cursor-pointer accent-[#38bdf8]"
                          title="Modulation Smoothing"
                        />
                      </div>
                    </div>

                    {/* Min / Max Clamp Range (Logarithmic-aware for frequency parameters) */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] pt-1 border-t border-[#1e262d]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#778896]">MIN</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.005"
                          value={toSliderNorm(minVal)}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, {
                              min: fromSliderNorm(parseFloat(e.target.value)),
                            })
                          }
                          className="w-24 h-1 bg-[#0b0e11] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#b8c7d4] w-14 text-right">
                          {param.displayFormat(minVal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#778896]">MAX</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.005"
                          value={toSliderNorm(maxVal)}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, {
                              max: fromSliderNorm(parseFloat(e.target.value)),
                            })
                          }
                          className="w-24 h-1 bg-[#0b0e11] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#b8c7d4] w-14 text-right">
                          {param.displayFormat(maxVal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}