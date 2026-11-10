import React, { useState } from 'react';
import { X, Plus, Trash2, Volume2, Activity, Sliders } from 'lucide-react';

/**
 * Extended Parameter Assignment Popup:
 * Preserves the exact Atrium MIDI Learn popup look from Screenshot 7 ("LEARN Width",
 * DEVICE / CH / CTRL, Fixed / Selected track, RANGE 0..127), and extends the top header
 * with the required: MIDI | OSC | MOD mode selector.
 */
export default function ParameterLearnPopup({
  param,
  liveState,
  modulators,
  assignments,
  onClose,
  onAddAssignment,
  onUpdateAssignment,
  onRemoveAssignment,
  onCreateModulatorAndAssign,
  initialTab = 'MOD',
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'MIDI' | 'OSC' | 'MOD'
  const [midiScope, setMidiScope] = useState('fixed'); // 'fixed' | 'selected'
  const [midiMin, setMidiMin] = useState(0);
  const [midiMax, setMidiMax] = useState(127);
  const [selectedModId, setSelectedModId] = useState(modulators[0]?.id || '');

  if (!param) return null;

  const paramAssignments = assignments.filter((a) => a.parameterId === param.id);
  const span = param.max - param.min;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 w-[450px] rounded-md border border-[#3d4b56] bg-[#1c2227]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-[#d6e2ea] select-none overflow-hidden"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Popup Top Bar — matches Screenshot 7 + MIDI | OSC | MOD selector */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a343d] bg-[#171c20]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]" />
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[#5bc0de] uppercase">
              LEARN
            </span>
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">
            {param.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252e36] text-[#8fa3b0] font-mono">
            {param.plugin}
          </span>
        </div>

        {/* Mode Switcher: MIDI | OSC | MOD */}
        <div className="flex items-center gap-2">
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

      {/* TAB 1: Original MIDI Learn Interface (Screenshot 7 exact preservation) */}
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
        <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
          {/* Live Value Summary */}
          <div className="atrium-lcd rounded border border-[#2a333b] px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[#6b7d8a]">
                BASE / AUTOMATED / LIVE MODULATED
              </div>
              <div className="text-[12px] font-mono flex items-center gap-2 mt-0.5">
                <span className="text-[#8ea0ad]">
                  Base: {param.displayFormat(param.baseValue)}
                </span>
                <span className="text-[#4a5864]">|</span>
                <span className="text-[#38bdf8] font-semibold">
                  Live: {param.displayFormat(liveState?.modulatedValue ?? param.baseValue)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#1b242c] border border-[#303d48] text-[#9fb1bd]">
                {paramAssignments.length} Active {paramAssignments.length === 1 ? 'Source' : 'Sources'}
              </span>
            </div>
          </div>

          {/* Add Modulator Connection Row */}
          <div className="flex items-center gap-2 bg-[#14191d] p-2 rounded border border-[#27313a]">
            <select
              value={selectedModId}
              onChange={(e) => setSelectedModId(e.target.value)}
              className="flex-1 bg-[#0c1013] border border-[#2c363f] rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#38bdf8]"
            >
              {modulators.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type} • {m.subtype})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (selectedModId) onAddAssignment(selectedModId, param.id);
              }}
              className="atrium-btn-cyan px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Assign
            </button>
            <button
              type="button"
              onClick={() => onCreateModulatorAndAssign('LFO', param.id)}
              className="atrium-btn-metal px-2 py-1 rounded text-[10px] text-[#9fb1bd] hover:text-white border border-[#333f48]"
              title="Create a new LFO and assign immediately"
            >
              + New LFO
            </button>
          </div>

          {/* Active Modulator Assignments on this Parameter */}
          {paramAssignments.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-[#2b353e] rounded text-[11px] text-[#778896]">
              No modulators assigned to <span className="text-white">{param.name}</span> yet.
              <br />
              Select a modulator above or drag any modulator onto this control.
            </div>
          ) : (
            <div className="space-y-2.5">
              {paramAssignments.map((asgn) => {
                const mod = modulators.find((m) => m.id === asgn.modulatorId);
                if (!mod) return null;
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
                              polarity: asgn.polarity === 'bipolar' ? 'unipolar' : 'bipolar',
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

                    {/* Depth & Offset Sliders */}
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div>
                        <div className="flex justify-between text-[#8ea0ad] mb-0.5">
                          <span>DEPTH</span>
                          <span className="font-mono text-white">
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
                            onUpdateAssignment(asgn.id, { depth: parseFloat(e.target.value) })
                          }
                          className="w-full h-1.5 bg-[#0b0e11] rounded appearance-none cursor-pointer accent-[#38bdf8]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[#8ea0ad] mb-0.5">
                          <span>OFFSET / SMOOTH</span>
                          <span className="font-mono text-white">
                            {Math.round((asgn.offset || 0) * 100)}% / {Math.round((asgn.smoothing || 0) * 100)}%
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="range"
                            min="-0.5"
                            max="0.5"
                            step="0.01"
                            value={asgn.offset || 0}
                            onChange={(e) =>
                              onUpdateAssignment(asgn.id, { offset: parseFloat(e.target.value) })
                            }
                            className="w-1/2 h-1.5 bg-[#0b0e11] rounded appearance-none cursor-pointer accent-[#38bdf8]"
                            title="Modulation Offset"
                          />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={asgn.smoothing || 0}
                            onChange={(e) =>
                              onUpdateAssignment(asgn.id, { smoothing: parseFloat(e.target.value) })
                            }
                            className="w-1/2 h-1.5 bg-[#0b0e11] rounded appearance-none cursor-pointer accent-[#38bdf8]"
                            title="Modulation Smoothing"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Min / Max Clamp Range */}
                    <div className="grid grid-cols-2 gap-3 text-[10px] pt-1 border-t border-[#1e262d]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#778896]">MIN</span>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step || span / 100}
                          value={asgn.min ?? param.min}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, { min: parseFloat(e.target.value) })
                          }
                          className="w-24 h-1 bg-[#0b0e11] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#b8c7d4] w-14 text-right">
                          {param.displayFormat(asgn.min ?? param.min)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#778896]">MAX</span>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step || span / 100}
                          value={asgn.max ?? param.max}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, { max: parseFloat(e.target.value) })
                          }
                          className="w-24 h-1 bg-[#0b0e11] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#b8c7d4] w-14 text-right">
                          {param.displayFormat(asgn.max ?? param.max)}
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