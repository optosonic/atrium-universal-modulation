import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_PARAMETERS,
  INITIAL_MODULATORS,
  INITIAL_ASSIGNMENTS,
  MOD_COLORS,
  MODULATOR_TYPES,
  computeParameterLiveState,
} from '@/lib/modulationEngine';
import AtriumTopAndTrackBar from '@/components/atrium/AtriumTopAndTrackBar';
import ChannelStripWindow from '@/components/atrium/ChannelStripWindow';
import AutoBottomPanel from '@/components/atrium/AutoBottomPanel';
import ParameterLearnPopup from '@/components/atrium/ParameterLearnPopup';

export default function AtriumPrototype() {
  // Core Atrium Prototype State
  const [parameters, setParameters] = useState(INITIAL_PARAMETERS);
  const [modulators, setModulators] = useState(INITIAL_MODULATORS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  // AUTO Tab Mode ('VOL' | 'PAN' | 'GESTURE' | 'MOD') — preserves state across mode switches
  const [autoMode, setAutoMode] = useState('MOD');
  const [selectedModId, setSelectedModId] = useState(INITIAL_MODULATORS[0].id);

  // Transport & Clock State
  const [isPlaying, setIsPlaying] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [simTime, setSimTime] = useState(0);
  const [automationEnabled, setAutomationEnabled] = useState(true);

  // MIDI | OSC | MOD Learn Mode & Popup State
  const [learnModeActive, setLearnModeActive] = useState(false);
  const [activeLearnParamId, setActiveLearnParamId] = useState(null);

  // 60fps Continuous Modulation Clock
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

  // Fast lookup map for modulators
  const modulatorsMap = useMemo(() => {
    const map = {};
    modulators.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [modulators]);

  // Compute live modulated states for every parameter on each tick
  const liveStates = useMemo(() => {
    const states = {};
    Object.values(parameters).forEach((param) => {
      states[param.id] = computeParameterLiveState(
        param,
        assignments,
        modulatorsMap,
        simTime,
        bpm,
        automationEnabled
      );
    });
    return states;
  }, [parameters, assignments, modulatorsMap, simTime, bpm, automationEnabled]);

  // Handlers for Parameter Base Values
  const handleChangeBase = (paramId, newVal) => {
    setParameters((prev) => ({
      ...prev,
      [paramId]: {
        ...prev[paramId],
        baseValue: newVal,
      },
    }));
  };

  // Handlers for Modulators
  const handleCreateModulator = (type = 'LFO') => {
    const meta =
      MODULATOR_TYPES.find((m) => m.type === type) || MODULATOR_TYPES[0];
    const typeCount =
      modulators.filter((m) => m.type === type).length + 1;
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

  // Handlers for Assignments (Drag & Drop or Popup or Routing List)
  const handleAddAssignment = (modulatorId, parameterId) => {
    const param = parameters[parameterId];
    if (!param || !modulatorId) return;

    // If identical pair already exists, focus it or slightly boost depth
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

  const handleOpenLearnPopup = (paramId) => {
    setActiveLearnParamId(paramId);
  };

  const handleResetAllModulation = () => {
    setAssignments(INITIAL_ASSIGNMENTS);
    setModulators(INITIAL_MODULATORS);
    setParameters(INITIAL_PARAMETERS);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121619] text-[#d6e2ea] overflow-hidden select-none">
      {/* 1. ATRIUM TOP TRANSPORT & VIEW BAR */}
      <AtriumTopAndTrackBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onResetTransport={() => setSimTime(0)}
        bpm={bpm}
        setBpm={setBpm}
        simTime={simTime}
        learnModeActive={learnModeActive}
        setLearnModeActive={setLearnModeActive}
        parameters={parameters}
        liveStates={liveStates}
        onOpenLearnPopup={handleOpenLearnPopup}
        onDropModulator={handleAddAssignment}
      />

      {/* 2. MIDDLE DAW WORKSPACE: Left Track Inspector + Arrangement / Channel Strip Mk II + Universal Rack */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Track Inspector Column (From Screenshot 4 & 5) */}
        <aside className="w-[155px] border-r border-[#27313a] bg-[#161b20] p-2 flex flex-col justify-between shrink-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-white">
                TRACK
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#4c3575] text-white text-[9px] font-bold">
                T
              </span>
            </div>

            <div className="p-1.5 rounded bg-[#0c1014] border border-[#27313a] text-[10px] text-white font-medium truncate">
              C01_Skyscrapers-Alexa...
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button className="py-1 rounded bg-[#521b1b] border border-[#8f3434] text-[#fca5a5] text-[8px] font-bold">
                REC
              </button>
              <button className="py-1 rounded bg-[#4a3718] border border-[#85642b] text-[#fcd34d] text-[8px] font-bold">
                MUTE
              </button>
              <button className="py-1 rounded bg-[#194166] border border-[#3882c2] text-white text-[8px] font-bold">
                SOLO
              </button>
            </div>

            {/* Track Live Volume & Pan Bars (Respond to Mixer Volume / Mixer Pan Modulation!) */}
            <div
              onClick={() => handleOpenLearnPopup('mixer_vol')}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('application/atrium-modulator')) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                const modId = e.dataTransfer.getData('application/atrium-modulator');
                if (modId) handleAddAssignment(modId, 'mixer_vol');
              }}
              className="h-6 rounded bg-[#2c4f63] border border-[#4ca0c9] px-2 flex items-center justify-between cursor-pointer relative overflow-hidden"
              title="Click for MIDI | OSC | MOD or drop a modulator here"
            >
              <div
                style={{
                  width: `${(liveStates['mixer_vol']?.normLive ?? 0.8) * 100}%`,
                }}
                className="absolute inset-y-0 left-0 bg-[#38bdf8]/30 pointer-events-none"
              />
              <span className="text-[9px] font-mono text-white relative z-10">VOL</span>
              <span className="text-[10px] font-mono text-[#7ccce5] font-bold relative z-10">
                {parameters['mixer_vol'].displayFormat(
                  liveStates['mixer_vol']?.modulatedValue ?? 0
                )}
              </span>
            </div>

            <div
              onClick={() => handleOpenLearnPopup('mixer_pan')}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('application/atrium-modulator')) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                const modId = e.dataTransfer.getData('application/atrium-modulator');
                if (modId) handleAddAssignment(modId, 'mixer_pan');
              }}
              className="h-6 rounded bg-[#243c4c] border border-[#3b6985] px-2 flex items-center justify-between cursor-pointer relative overflow-hidden"
              title="Click for MIDI | OSC | MOD or drop a modulator here"
            >
              <span className="text-[9px] font-mono text-[#6ee7b7]">S</span>
              <span className="text-[10px] font-mono text-white">
                {parameters['mixer_pan'].displayFormat(
                  liveStates['mixer_pan']?.modulatedValue ?? 0
                )}
              </span>
              <span className="text-[9px] text-[#9fb1bd]">Pan</span>
            </div>

            {/* INSERTS Section */}
            <div className="pt-2 border-t border-[#242e38] space-y-1">
              <div className="text-[9px] font-bold text-[#8ea0ad] uppercase tracking-wider">
                INSERTS
              </div>
              <div className="px-2 py-1 rounded bg-[#234b5e] border border-[#479ec4] text-[9px] text-white font-medium flex items-center justify-between">
                <span className="truncate">Channel Strip Mk II</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              </div>
              <div className="px-2 py-1 rounded bg-[#1d3a49] border border-[#346882] text-[9px] text-[#bfe8ff] font-medium flex items-center justify-between">
                <span className="truncate">HydroHall Reverb</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6]" />
              </div>
            </div>
          </div>

          {/* Interactive Demo Hint Box */}
          <div className="rounded bg-[#0d1217] border border-[#26323d] p-2 text-[9px] text-[#8ea0ad] space-y-1">
            <div className="text-[#38bdf8] font-bold uppercase tracking-wider">
              Quick Demo Guide
            </div>
            <div>1. Drag any modulator from AUTO → MOD onto any knob.</div>
            <div>2. Click any knob label or top-right badge for MIDI | OSC | MOD.</div>
          </div>
        </aside>

        {/* Center Main Stage: Channel Strip Mk II + Universal Atrium Targets */}
        <main className="flex-1 p-2.5 bg-[#0e1216] overflow-x-auto overflow-y-hidden flex flex-col justify-between">
          <ChannelStripWindow
            parameters={parameters}
            liveStates={liveStates}
            onChangeBase={handleChangeBase}
            onOpenLearnPopup={handleOpenLearnPopup}
            onDropModulator={handleAddAssignment}
            learnModeActive={learnModeActive}
            selectedLearnParamId={activeLearnParamId}
            isPlaying={isPlaying}
          />
        </main>
      </div>

      {/* 3. BOTTOM AUTO PANEL WITH INTEGRATED 'MOD' WORKSPACE */}
      <AutoBottomPanel
        autoMode={autoMode}
        setAutoMode={setAutoMode}
        learnModeActive={learnModeActive}
        setLearnModeActive={setLearnModeActive}
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
        onOpenLearnPopup={handleOpenLearnPopup}
        onResetAllModulation={handleResetAllModulation}
        simTime={simTime}
        bpm={bpm}
        automationEnabled={automationEnabled}
        setAutomationEnabled={setAutomationEnabled}
      />

      {/* 4. EXTENDED PARAMETER LEARN POPUP (MIDI | OSC | MOD) */}
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