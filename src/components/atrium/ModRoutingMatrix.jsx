import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sliders,
  Trash2,
} from 'lucide-react';
import { valueToNorm, normToValue } from '@/lib/modulationEngine';

/**
 * Right Column of ModWorkspace: Universal Modulation Routing Matrix (SOURCE -> DESTINATION)
 * - Supports global COMPACT / EXPANDED view mode + per-row expandable advanced settings
 * - In Atrium AUTO mode (`showTargetInspector`), displays a compact Selected-Target Inspector
 *   for the last-clicked parameter anywhere in Atrium.
 */
export default function ModRoutingMatrix({
  modulators = [],
  activeMod,
  assignments = [],
  parameters = {},
  liveStates = {},
  selectedTargetParamId = 'cs_width',
  onSelectTargetParam = () => {},
  showTargetInspector = false,
  onSelectMod = () => {},
  onAddAssignment = () => {},
  onUpdateAssignment = () => {},
  onRemoveAssignment = () => {},
  onOpenLearnPopup = () => {},
}) {
  const [matrixMode, setMatrixMode] = useState('compact'); // 'compact' | 'expanded'
  const [expandedIds, setExpandedIds] = useState({});

  const targetParam =
    parameters[selectedTargetParamId] ||
    parameters['cs_width'] ||
    Object.values(parameters)[0];
  const targetLiveState = targetParam ? liveStates[targetParam.id] : null;

  const toggleRowExpanded = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toSliderNorm = (param, val) => valueToNorm(param, val ?? param.min);
  const fromSliderNorm = (param, norm) => {
    const raw = normToValue(param, norm);
    if (param.step >= 1) return Math.round(raw);
    return Number(raw.toFixed(2));
  };

  return (
    <div className="col-span-4 bg-[#12171c] p-2.5 flex flex-col justify-start overflow-hidden">
      {/* Compact Selected-Target Inspector (Shown inside Atrium AUTO tab) */}
      {showTargetInspector && targetParam && (
        <div className="mb-2 rounded border border-[#2a3642] bg-[#0d1217] px-2.5 py-1.5 flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#5bc0de]">
                SELECTED TARGET
              </span>
              <span className="text-[9px] font-mono text-[#6c7d8c] truncate">
                {targetParam.plugin}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => onOpenLearnPopup(targetParam.id)}
                className="text-[11px] font-bold text-white hover:text-[#38bdf8] truncate"
              >
                {targetParam.group} / {targetParam.name}
              </button>
              <span className="text-[10px] font-mono text-[#38bdf8]">
                {targetParam.displayFormat(
                  targetLiveState?.modulatedValue ?? targetParam.baseValue
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {activeMod && (
              <button
                type="button"
                onClick={() => onAddAssignment(activeMod.id, targetParam.id)}
                className="atrium-btn-cyan px-2 py-0.5 rounded text-[9px] font-bold"
              >
                + {activeMod.name}
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenLearnPopup(targetParam.id)}
              className="atrium-btn-metal px-2 py-0.5 rounded border border-[#2d3843] text-[9px] font-bold text-[#c5d4e0] hover:text-white"
            >
              MOD Popup
            </button>
          </div>
        </div>
      )}

      {/* Header + Quick Assignment Bar + Compact/Expanded Toggle */}
      <div className="flex items-center justify-between gap-1 border-b border-[#222b33] pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sliders className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white truncate">
            ROUTING ({assignments.length})
          </span>

          {/* Compact / Expanded Mode Switcher */}
          <div className="flex items-center rounded bg-[#0a0d10] p-0.5 border border-[#252f38] ml-1 shrink-0">
            <button
              type="button"
              onClick={() => setMatrixMode('compact')}
              className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase transition-all ${
                matrixMode === 'compact'
                  ? 'bg-[#38bdf8] text-[#071218] font-bold'
                  : 'text-[#7a8b99] hover:text-white'
              }`}
              title="Compact 1-row per connection view"
            >
              COMPACT
            </button>
            <button
              type="button"
              onClick={() => setMatrixMode('expanded')}
              className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase transition-all ${
                matrixMode === 'expanded'
                  ? 'bg-[#38bdf8] text-[#071218] font-bold'
                  : 'text-[#7a8b99] hover:text-white'
              }`}
              title="Expanded view showing depth, range, polarity, smoothing, and offset"
            >
              EXPANDED
            </button>
          </div>
        </div>

        {/* Quick Assign Dropdown for active modulator */}
        {activeMod && (
          <div className="flex items-center gap-1 shrink-0">
            <select
              value={selectedTargetParamId}
              onChange={(e) => onSelectTargetParam(e.target.value)}
              className="bg-[#0b0e11] border border-[#2b3640] rounded px-1.5 py-0.5 text-[9px] text-[#c5d4e0] focus:outline-none max-w-[130px]"
            >
              {Object.values(parameters).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.group} / {p.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onAddAssignment(activeMod.id, selectedTargetParamId)}
              className="atrium-btn-cyan px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap"
            >
              + Route
            </button>
          </div>
        )}
      </div>

      {/* Assignment Matrix List: SOURCE -> DESTINATION */}
      <div className="flex-1 overflow-y-auto space-y-1.5 my-1.5 pr-0.5">
        {assignments.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-[11px] text-[#6d7f8d] border border-dashed border-[#242e38] rounded p-4">
            Drag any modulator onto a knob, click any parameter for direct MOD assignment, or use "+ Route" above.
          </div>
        ) : (
          assignments.map((asgn) => {
            const mod = modulators.find((m) => m.id === asgn.modulatorId);
            const param = parameters[asgn.parameterId];
            if (!mod || !param) return null;
            const liveVal = liveStates[param.id]?.modulatedValue ?? param.baseValue;
            const isExpanded = matrixMode === 'expanded' || Boolean(expandedIds[asgn.id]);
            const minVal = asgn.min ?? param.min;
            const maxVal = asgn.max ?? param.max;

            return (
              <div
                key={asgn.id}
                className={`rounded border px-2 py-1.5 transition-all ${
                  asgn.enabled
                    ? 'bg-[#171e24] border-[#2b3640]'
                    : 'bg-[#0f1317] border-[#1d252c] opacity-60'
                }`}
                style={{ borderLeft: `3px solid ${mod.color}` }}
              >
                {/* Concise Primary Row (Shown in both Compact & Expanded modes) */}
                <div className="flex items-center justify-between gap-1.5">
                  {/* Left: Enable + SOURCE -> DESTINATION */}
                  <div className="flex items-center gap-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={asgn.enabled}
                      onChange={(e) =>
                        onUpdateAssignment(asgn.id, { enabled: e.target.checked })
                      }
                      className="accent-[#38bdf8] cursor-pointer shrink-0"
                      title="Enable / Disable assignment"
                    />
                    <button
                      type="button"
                      onClick={() => onSelectMod(mod.id)}
                      className="text-[10px] font-bold hover:underline shrink-0"
                      style={{ color: mod.color }}
                    >
                      {mod.name}
                    </button>
                    <ArrowRight className="w-2.5 h-2.5 text-[#657785] shrink-0" />
                    <button
                      type="button"
                      onClick={(e) => {
                        onSelectTargetParam(param.id);
                        onOpenLearnPopup(
                          param.id,
                          e.currentTarget.getBoundingClientRect()
                        );
                      }}
                      className="text-[10px] font-semibold text-[#e2ecf4] hover:text-[#38bdf8] truncate"
                      title="Click to open MIDI | OSC | MOD inspector for this parameter"
                    >
                      {param.group} / {param.name}
                    </button>
                  </div>

                  {/* Right: Inline Depth (in compact mode) + Live Value + Invert + Expand + Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!isExpanded && (
                      <div className="flex items-center gap-1 mr-0.5">
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
                          className="w-12 h-1 bg-[#0b0e11] rounded appearance-none cursor-pointer accent-[#38bdf8]"
                          title={`Depth: ${Math.round(asgn.depth * 100)}%`}
                        />
                        <span className="text-[8px] font-mono text-[#9fb1bd] w-7 text-right">
                          {asgn.depth >= 0 ? '+' : ''}
                          {Math.round(asgn.depth * 100)}%
                        </span>
                      </div>
                    )}

                    <span className="text-[9px] font-mono text-[#5bc0de] min-w-[42px] text-right tabular-nums">
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
                          : 'border-[#2c3740] text-[#7a8b99] hover:text-white'
                      }`}
                      title="Invert modulation phase"
                    >
                      INV
                    </button>

                    {matrixMode === 'compact' && (
                      <button
                        type="button"
                        onClick={() => toggleRowExpanded(asgn.id)}
                        className="text-[#7a8b99] hover:text-white p-0.5"
                        title={
                          isExpanded
                            ? 'Collapse advanced assignment controls'
                            : 'Expand advanced assignment controls (Min/Max, Polarity, Smoothing, Offset)'
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveAssignment(asgn.id)}
                      className="text-[#6c7f8e] hover:text-red-400 p-0.5"
                      title="Remove assignment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Expanded Advanced Controls: Depth, Polarity, Min/Max, Smoothing, Offset */}
                {isExpanded && (
                  <div className="mt-1.5 pt-1.5 border-t border-[#222c35] space-y-1.5 text-[9px]">
                    {/* Depth + Polarity Row */}
                    <div className="flex items-center gap-2">
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
                      <span className="font-mono text-white w-9 text-right">
                        {asgn.depth >= 0 ? '+' : ''}
                        {Math.round(asgn.depth * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateAssignment(asgn.id, {
                            polarity:
                              asgn.polarity === 'bipolar' ? 'unipolar' : 'bipolar',
                          })
                        }
                        className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-[#11171c] border border-[#2c3740] text-[#b8c7d4] hover:text-white"
                      >
                        {asgn.polarity === 'bipolar' ? '± BIPOLAR' : '+ UNIPOLAR'}
                      </button>
                    </div>

                    {/* Min & Max Range Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 bg-[#11161b] px-1.5 py-1 rounded border border-[#202932]">
                        <span className="text-[8px] font-mono text-[#7a8b99]">MIN</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.005"
                          value={toSliderNorm(param, minVal)}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, {
                              min: fromSliderNorm(param, parseFloat(e.target.value)),
                            })
                          }
                          className="flex-1 h-1 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#c5d4e0] text-[8px] w-11 text-right">
                          {param.displayFormat(minVal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-[#11161b] px-1.5 py-1 rounded border border-[#202932]">
                        <span className="text-[8px] font-mono text-[#7a8b99]">MAX</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.005"
                          value={toSliderNorm(param, maxVal)}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, {
                              max: fromSliderNorm(param, parseFloat(e.target.value)),
                            })
                          }
                          className="flex-1 h-1 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#c5d4e0] text-[8px] w-11 text-right">
                          {param.displayFormat(maxVal)}
                        </span>
                      </div>
                    </div>

                    {/* Smoothing & Offset Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 bg-[#11161b] px-1.5 py-1 rounded border border-[#202932]">
                        <span className="text-[8px] font-mono text-[#7a8b99]">SMOOTH</span>
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
                          className="flex-1 h-1 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#c5d4e0] text-[8px] w-8 text-right">
                          {Math.round((asgn.smoothing || 0) * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-[#11161b] px-1.5 py-1 rounded border border-[#202932]">
                        <span className="text-[8px] font-mono text-[#7a8b99]">OFFSET</span>
                        <input
                          type="range"
                          min="-0.5"
                          max="0.5"
                          step="0.01"
                          value={asgn.offset || 0}
                          onChange={(e) =>
                            onUpdateAssignment(asgn.id, {
                              offset: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1 h-1 bg-[#090c0f] rounded appearance-none accent-[#38bdf8]"
                        />
                        <span className="font-mono text-[#c5d4e0] text-[8px] w-8 text-right">
                          {Math.round((asgn.offset || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}