import React from 'react';
import AtriumKnob from '@/components/atrium/AtriumKnob';

/**
 * STANDALONE TEST BENCH — universal modulation targets.
 * Deliberately minimal: light metallic plates + the real Atrium knob, so this file
 * doubles as the reference for "how any Atrium control binds to modulation".
 */
const MODULES = [
  {
    id: 'channel-strip',
    label: 'CHANNEL STRIP MK II',
    plugin: 'Spher8',
    knobs: ['cs_width', 'cs_eq_freq', 'cs_eq_gain', 'cs_comp_thresh', 'cs_pan'],
  },
  {
    id: 'reverb',
    label: 'HYDROHALL REVERB',
    plugin: 'Hydro',
    knobs: ['rev_decay', 'rev_shimmer'],
  },
  {
    id: 'instrument',
    label: 'SPHER8 SYNTH',
    plugin: 'Instrument',
    knobs: ['inst_cutoff'],
  },
  {
    id: 'orbit',
    label: '3D ORBIT STAGE',
    plugin: 'Spatial',
    knobs: ['orbit_rotation'],
  },
  {
    id: 'particles',
    label: 'HYDROSWARM',
    plugin: 'Particles',
    knobs: ['particle_intensity'],
  },
  {
    id: 'mixer',
    label: 'TRACK 1 MIXER',
    plugin: 'Console',
    knobs: ['mixer_vol', 'mixer_pan'],
  },
];

export default function ModulationTargetBench({
  parameters,
  liveStates,
  onChangeBase,
  onOpenLearnPopup,
  onDropModulator,
  learnModeActive,
  selectedLearnParamId,
}) {
  return (
    <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
      {MODULES.map((module) => (
        <div
          key={module.id}
          className="shrink-0 rounded border border-[#27313a] bg-[#161b20] p-1.5"
        >
          <div className="flex items-center justify-between gap-3 mb-1 px-0.5">
            <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#8ea0ad]">
              {module.label}
            </span>
            <span className="text-[8px] font-mono text-[#4f5f6b] uppercase">
              {module.plugin}
            </span>
          </div>

          <div className="atrium-plate-light rounded px-1.5 py-0.5 flex items-start gap-1">
            {module.knobs.map((paramId) => (
              <AtriumKnob
                key={paramId}
                param={parameters[paramId]}
                liveState={liveStates[paramId]}
                onChangeBase={onChangeBase}
                onOpenLearnPopup={onOpenLearnPopup}
                onDropModulator={onDropModulator}
                learnModeActive={learnModeActive}
                selectedForLearn={selectedLearnParamId === paramId}
                size={48}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}