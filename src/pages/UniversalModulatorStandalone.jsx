import React, { useState } from 'react';
import useModulationEngine from '@/hooks/useModulationEngine';
import StandaloneTransportBar from '@/components/modulation/StandaloneTransportBar';
import ModulationTargetBench from '@/components/modulation/ModulationTargetBench';
import CursorHandoffSpec from '@/components/modulation/CursorHandoffSpec';
import ModWorkspace from '@/components/atrium/ModWorkspace';
import ParameterLearnPopup from '@/components/atrium/ParameterLearnPopup';

/**
 * UNIVERSAL MODULATOR — STANDALONE REFERENCE VIEW
 * The modulation system on its own: modulator library, editor, routing matrix,
 * MIDI | OSC | MOD learn popup and a minimal bench of modulation targets.
 * No Atrium DAW shell — this is the surface handed to Cursor for integration.
 */
export default function UniversalModulatorStandalone() {
  const engine = useModulationEngine();
  const [specOpen, setSpecOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121619] text-[#d6e2ea] overflow-hidden">
      <StandaloneTransportBar
        isPlaying={engine.isPlaying}
        onTogglePlay={engine.togglePlay}
        onResetTransport={engine.resetTransport}
        bpm={engine.bpm}
        setBpm={engine.setBpm}
        simTime={engine.simTime}
        automationEnabled={engine.automationEnabled}
        setAutomationEnabled={engine.setAutomationEnabled}
        onChangeBpm={engine.setBpm}
        modCount={engine.modulators.length}
        assignmentCount={engine.assignments.length}
        onOpenSpec={() => setSpecOpen(true)}
      />

      {/* MODULATION TARGETS — the bench that proves the engine is universal */}
      <section className="shrink-0 bg-[#0e1216] border-b border-[#27313a] px-2 pt-1.5 pb-1">
        <div className="flex items-center justify-between px-0.5 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7a8b99]">
            Modulation Targets — Any Atrium Parameter
          </span>
          <span className="text-[9px] font-mono text-[#5bc0de]">
            Drag a source onto any control · right-click for MIDI | OSC | MOD
          </span>
        </div>
        <ModulationTargetBench
          parameters={engine.parameters}
          liveStates={engine.liveStates}
          onChangeBase={engine.changeBase}
          onOpenLearnPopup={engine.openLearnPopup}
          onDropModulator={engine.addAssignment}
          learnModeActive={false}
          selectedLearnParamId={engine.activeLearnParamId}
        />
      </section>

      {/* AUTO > MOD WORKSPACE */}
      <section className="flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 h-7 flex items-center justify-between px-2.5 bg-[#171c20] border-b border-[#27313a]">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7a8b99]">
              Auto
            </span>
            <span className="text-[9px] text-[#4a5864]">›</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[#38bdf8] text-[#081218] shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              MOD
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#6c7d8c]">
            {engine.modulators.length} MODULATORS · {engine.assignments.length} ROUTES ·{' '}
            {engine.isPlaying ? `FREE RUN · ${engine.bpm} BPM` : 'CLOCK PAUSED'}
          </span>
        </div>

        <ModWorkspace
          modulators={engine.modulators}
          selectedModId={engine.selectedModId}
          onSelectMod={engine.selectMod}
          onCreateModulator={engine.createModulator}
          onUpdateModulator={engine.updateModulator}
          onDeleteModulator={engine.deleteModulator}
          assignments={engine.assignments}
          parameters={engine.parameters}
          liveStates={engine.liveStates}
          onAddAssignment={engine.addAssignment}
          onUpdateAssignment={engine.updateAssignment}
          onRemoveAssignment={engine.removeAssignment}
          onOpenLearnPopup={engine.openLearnPopup}
          simTime={engine.simTime}
          bpm={engine.bpm}
        />
      </section>

      {engine.activeLearnParamId && engine.parameters[engine.activeLearnParamId] && (
        <ParameterLearnPopup
          param={engine.parameters[engine.activeLearnParamId]}
          liveState={engine.liveStates[engine.activeLearnParamId]}
          modulators={engine.modulators}
          assignments={engine.assignments}
          onClose={engine.closeLearnPopup}
          onAddAssignment={engine.addAssignment}
          onUpdateAssignment={engine.updateAssignment}
          onRemoveAssignment={engine.removeAssignment}
          onCreateModulatorAndAssign={engine.createModulatorAndAssign}
        />
      )}

      {specOpen && <CursorHandoffSpec onClose={() => setSpecOpen(false)} />}
    </div>
  );
}