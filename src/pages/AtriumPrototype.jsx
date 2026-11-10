import React from 'react';
import useModulationEngine from '@/hooks/useModulationEngine';
import AtriumTopAndTrackBar from '@/components/atrium/AtriumTopAndTrackBar';
import ChannelStripWindow from '@/components/atrium/ChannelStripWindow';
import AutoBottomPanel from '@/components/atrium/AutoBottomPanel';
import ParameterLearnPopup from '@/components/atrium/ParameterLearnPopup';

export default function AtriumPrototype() {
  const engine = useModulationEngine();
  const {
    parameters,
    modulators,
    assignments,
    liveStates,
    selectedModId,
    autoMode,
    setAutoMode,
    isPlaying,
    bpm,
    setBpm,
    simTime,
    automationEnabled,
    setAutomationEnabled,
    learnModeActive,
    setLearnModeActive,
    activeLearnParamId,
    changeBase,
    addAssignment,
    updateAssignment,
    removeAssignment,
    openLearnPopup,
    closeLearnPopup,
    selectMod,
    createModulator,
    updateModulator,
    deleteModulator,
    createModulatorAndAssign,
    togglePlay,
    resetTransport,
    resetEngine,
  } = engine;

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121619] text-[#d6e2ea] overflow-hidden select-none">
      {/* 1. ATRIUM TOP TRANSPORT & VIEW BAR */}
      <AtriumTopAndTrackBar
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onResetTransport={resetTransport}
        bpm={bpm}
        setBpm={setBpm}
        simTime={simTime}
        learnModeActive={learnModeActive}
        setLearnModeActive={setLearnModeActive}
        parameters={parameters}
        liveStates={liveStates}
        onOpenLearnPopup={openLearnPopup}
        onDropModulator={addAssignment}
      />

      {/* 2. MIDDLE DAW WORKSPACE: Left Track Inspector + Channel Strip Mk II & Environment Modules */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Track Inspector Column */}
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

            {/* Track Live Volume & Pan Bars (Respond to Mixer Volume / Mixer Pan Modulation) */}
            <div
              onClick={() => openLearnPopup('mixer_vol')}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('application/atrium-modulator')) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                const modId = e.dataTransfer.getData('application/atrium-modulator');
                if (modId) addAssignment(modId, 'mixer_vol');
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
              onClick={() => openLearnPopup('mixer_pan')}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes('application/atrium-modulator')) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                const modId = e.dataTransfer.getData('application/atrium-modulator');
                if (modId) addAssignment(modId, 'mixer_pan');
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

          {/* Direct Assignment Hint Box */}
          <div className="rounded bg-[#0d1217] border border-[#26323d] p-2 text-[9px] text-[#8ea0ad] space-y-1">
            <div className="text-[#38bdf8] font-bold uppercase tracking-wider">
              Direct MOD Flow
            </div>
            <div>Click any knob anywhere to assign or create a modulator directly.</div>
            <div>Or drag a source from AUTO → MOD onto any control.</div>
          </div>
        </aside>

        {/* Center Main Stage: Channel Strip Mk II + Atrium Environment Modules */}
        <main className="flex-1 p-2.5 bg-[#0e1216] overflow-x-auto overflow-y-hidden flex flex-col justify-between">
          <ChannelStripWindow
            parameters={parameters}
            liveStates={liveStates}
            onChangeBase={changeBase}
            onOpenLearnPopup={openLearnPopup}
            onDropModulator={addAssignment}
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
        onSelectMod={selectMod}
        onCreateModulator={createModulator}
        onUpdateModulator={updateModulator}
        onDeleteModulator={deleteModulator}
        assignments={assignments}
        parameters={parameters}
        liveStates={liveStates}
        onAddAssignment={addAssignment}
        onUpdateAssignment={updateAssignment}
        onRemoveAssignment={removeAssignment}
        onOpenLearnPopup={openLearnPopup}
        onResetAllModulation={resetEngine}
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
          onClose={closeLearnPopup}
          onAddAssignment={addAssignment}
          onUpdateAssignment={updateAssignment}
          onRemoveAssignment={removeAssignment}
          onCreateModulatorAndAssign={createModulatorAndAssign}
        />
      )}
    </div>
  );
}