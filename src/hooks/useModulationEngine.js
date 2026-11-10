import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  INITIAL_PARAMETERS,
  INITIAL_MODULATORS,
  INITIAL_ASSIGNMENTS,
  MOD_COLORS,
  MODULATOR_TYPES,
  computeParameterLiveState,
} from '@/lib/modulationEngine';

const ModulationEngineContext = createContext(null);

function useCreateModulationEngine() {
  const [parameters, setParameters] = useState(INITIAL_PARAMETERS);
  const [modulators, setModulators] = useState(INITIAL_MODULATORS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  const [selectedModId, setSelectedModId] = useState(INITIAL_MODULATORS[0].id);
  const [selectedTargetParamId, setSelectedTargetParamId] = useState('cs_width');
  const [autoMode, setAutoMode] = useState('MOD');

  // Transport / clock
  const [isPlaying, setIsPlaying] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [simTime, setSimTime] = useState(0);
  const [automationEnabled, setAutomationEnabled] = useState(true);

  // Assignment popup (MIDI | OSC | MOD) & Learn highlight mode
  const [learnModeActive, setLearnModeActive] = useState(false);
  const [activeLearnParamId, setActiveLearnParamId] = useState(null);

  // Drag-and-drop & visual confirmation state
  const [draggingModId, setDraggingModId] = useState(null);
  const [lastAssignedNotice, setLastAssignedNotice] = useState(null); // { paramId, modId, modName, paramName, color, ts }

  // Single rAF clock drives every modulation calculation across both standalone & Atrium views
  const lastFrameRef = useRef(performance.now());
  useEffect(() => {
    let rafId;
    const tick = (now) => {
      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      if (isPlaying) setSimTime((prev) => prev + Math.min(dt, 0.1));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Clear global drag state if drag ends anywhere in the window
  useEffect(() => {
    const handleGlobalDragEnd = () => setDraggingModId(null);
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, []);

  const modulatorsMap = useMemo(() => {
    const map = {};
    modulators.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [modulators]);

  const draggingModulator = draggingModId ? modulatorsMap[draggingModId] || null : null;

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

  const changeBase = (paramId, newVal) => {
    setSelectedTargetParamId(paramId);
    setParameters((prev) => ({
      ...prev,
      [paramId]: { ...prev[paramId], baseValue: newVal },
    }));
  };

  const createModulator = (type = 'LFO') => {
    const meta = MODULATOR_TYPES.find((m) => m.type === type) || MODULATOR_TYPES[0];
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
      tempoSync: type === 'STEP',
      depth: 1.0,
      phase: 0,
      offset: 0,
      smoothing: type === 'RANDOM' ? 0.45 : type === 'STEP' ? 0.0 : 0.1,
      polarity: type === 'STEP' ? 'unipolar' : 'bipolar',
      enabled: true,
      color,
      steps: [0.85, 0.3, -0.4, 0.7, -0.6, 0.9, -0.2, 0.5],
      curvePoints: [0, 0.75, -0.5, 0.85, -0.3, 0],
      macroValue: 0.65,
      adsr: { a: 0.15, d: 0.3, s: 0.6, r: 0.25 },
    };

    setModulators((prev) => [...prev, newMod]);
    setSelectedModId(newId);
    return newMod;
  };

  const updateModulator = (modId, patch) => {
    setModulators((prev) => prev.map((m) => (m.id === modId ? { ...m, ...patch } : m)));
  };

  const deleteModulator = (modId) => {
    setModulators((prev) => prev.filter((m) => m.id !== modId));
    setAssignments((prev) => prev.filter((a) => a.modulatorId !== modId));
    if (selectedModId === modId) {
      const remaining = modulators.filter((m) => m.id !== modId);
      if (remaining[0]) setSelectedModId(remaining[0].id);
    }
  };

  const triggerConfirmation = (modObj, paramObj, isExisting = false) => {
    if (!modObj || !paramObj) return;
    const notice = {
      paramId: paramObj.id,
      modId: modObj.id,
      modName: modObj.name,
      paramName: `${paramObj.group} / ${paramObj.name}`,
      color: modObj.color,
      isExisting,
      ts: Date.now(),
    };
    setLastAssignedNotice(notice);
    setTimeout(() => {
      setLastAssignedNotice((cur) => (cur?.ts === notice.ts ? null : cur));
    }, 1800);
  };

  const addAssignment = (modulatorId, parameterId, modOverride = null) => {
    const param = parameters[parameterId];
    const modObj = modOverride || modulatorsMap[modulatorId];
    if (!param || !modulatorId) return;

    setSelectedTargetParamId(parameterId);
    setDraggingModId(null);

    const existing = assignments.find(
      (a) => a.modulatorId === modulatorId && a.parameterId === parameterId
    );
    if (existing) {
      // Enable it if it was disabled and focus it without creating a duplicate
      if (!existing.enabled) {
        setAssignments((prev) =>
          prev.map((a) => (a.id === existing.id ? { ...a, enabled: true } : a))
        );
      }
      setSelectedModId(modulatorId);
      triggerConfirmation(modObj, param, true);
      return existing.id;
    }

    const newAsgn = {
      id: `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      modulatorId,
      parameterId,
      depth: 0.55,
      min: param.min,
      max: param.max,
      polarity: modObj?.polarity === 'unipolar' ? 'unipolar' : 'bipolar',
      offset: 0,
      invert: false,
      smoothing: 0.1,
      enabled: true,
    };
    setAssignments((prev) => [...prev, newAsgn]);
    setSelectedModId(modulatorId);
    triggerConfirmation(modObj, param, false);
    return newAsgn.id;
  };

  const createModulatorAndAssign = (type, parameterId) => {
    const newMod = createModulator(type);
    addAssignment(newMod.id, parameterId, newMod);
    return newMod.id;
  };

  const updateAssignment = (asgnId, patch) => {
    setAssignments((prev) => prev.map((a) => (a.id === asgnId ? { ...a, ...patch } : a)));
  };

  const removeAssignment = (asgnId) => {
    setAssignments((prev) => prev.filter((a) => a.id !== asgnId));
  };

  const openLearnPopup = (paramId) => {
    setSelectedTargetParamId(paramId);
    setActiveLearnParamId(paramId);
  };
  const closeLearnPopup = () => setActiveLearnParamId(null);

  const resetEngine = () => {
    setParameters(INITIAL_PARAMETERS);
    setModulators(INITIAL_MODULATORS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSimTime(0);
  };

  return {
    // state
    parameters,
    modulators,
    assignments,
    modulatorsMap,
    liveStates,
    selectedModId,
    selectedTargetParamId,
    setSelectedTargetParamId,
    autoMode,
    setAutoMode,
    isPlaying,
    bpm,
    simTime,
    automationEnabled,
    learnModeActive,
    setLearnModeActive,
    activeLearnParamId,
    draggingModId,
    draggingModulator,
    setDraggingModId,
    lastAssignedNotice,
    // binding API
    changeBase,
    addAssignment,
    updateAssignment,
    removeAssignment,
    openLearnPopup,
    closeLearnPopup,
    // modulators
    selectMod: setSelectedModId,
    createModulator: (type) => createModulator(type).id,
    updateModulator,
    deleteModulator,
    createModulatorAndAssign,
    // transport
    togglePlay: () => setIsPlaying((p) => !p),
    resetTransport: () => setSimTime(0),
    setBpm,
    setAutomationEnabled,
    resetEngine,
  };
}

export function ModulationEngineProvider({ children }) {
  const engine = useCreateModulationEngine();
  return React.createElement(
    ModulationEngineContext.Provider,
    { value: engine },
    children
  );
}

export default function useModulationEngine() {
  return useContext(ModulationEngineContext);
}