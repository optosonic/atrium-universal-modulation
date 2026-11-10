import React, { useState } from 'react';
import AtriumKnob from './AtriumKnob';
import { Eye, Sparkles, Compass, Sliders, Radio } from 'lucide-react';

/**
 * Floating / Dockable Atrium Plugin & Universal Control Rack:
 * 1. Channel Strip Mk II by Spher8 (matching Screenshots 5, 6, 7)
 * 2. Universal Destination Modules (HydroHall Reverb, 3D Orbit Stage, HydroSwarm Particles, Spher8 Synth Filter)
 * so the user can test dragging modulators onto any Atrium parameter in one place or across views.
 */
export default function ChannelStripWindow({
  parameters,
  liveStates,
  onChangeBase,
  onOpenLearnPopup,
  onDropModulator,
  learnModeActive,
  selectedLearnParamId,
  isPlaying,
}) {
  const [activeEqBand, setActiveEqBand] = useState('LOW');
  const [showUniversalRack, setShowUniversalRack] = useState(true);

  const freqLive = liveStates['cs_eq_freq']?.modulatedValue ?? 180;
  const gainLive = liveStates['cs_eq_gain']?.modulatedValue ?? 2.5;
  const threshLive = liveStates['cs_comp_thresh']?.modulatedValue ?? -14;
  const widthLive = liveStates['cs_width']?.modulatedValue ?? 1.0;
  const orbitLive = liveStates['orbit_rotation']?.modulatedValue ?? 0;
  const particleLive = liveStates['particle_intensity']?.modulatedValue ?? 64;
  const reverbDecayLive = liveStates['rev_decay']?.modulatedValue ?? 4.2;

  // Map EQ frequency (20..2000Hz) to X coordinate on the EQ display (30..310)
  const eqNodeX = 30 + ((Math.log10(Math.max(20, freqLive)) - Math.log10(20)) / (Math.log10(2000) - Math.log10(20))) * 260;
  const eqNodeY = 48 - (gainLive / 15) * 32;

  return (
    <div className="flex items-stretch gap-2.5 h-full select-none">
      {/* MAIN CHANNEL STRIP MK II WINDOW (Matches Screenshot 5 & 6) */}
      <div className="w-[570px] rounded-md border border-[#3a454e] bg-[#21272d] shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden shrink-0">
        {/* macOS-style Window Title Bar */}
        <div className="h-6 bg-gradient-to-b from-[#e4e9ed] to-[#c4cdd4] px-2.5 flex items-center justify-between text-[#1f262b] border-b border-[#8b969e]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]" />
          </div>
          <span className="text-[11px] font-medium tracking-tight">
            1 C01_Skyscrapers-AlexanderBenson - Mark II Channel
          </span>
          <span className="text-[10px] font-mono text-[#49545d]">HQ</span>
        </div>

        {/* Plugin Top Preset Bar */}
        <div className="h-8 bg-[#20262b] border-b border-[#121619] px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#14181c] border border-[#333e47] text-[9px] font-bold text-[#e0a96d]">
              CH
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#14181c] border border-[#333e47] text-[9px] font-bold text-[#8ea0ad]">
              INS
            </span>
            <span className="text-[13px] font-bold tracking-[0.18em] text-[#63b8d6] ml-1">
              ATRIUM
            </span>
            <span className="text-[12px] text-[#9fb1bd] font-light">
              Channel Strip Mk II <span className="text-[10px] text-[#6c7d8a]">by Spher8</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="atrium-lcd px-2.5 py-0.5 rounded border border-[#2c3740] flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#ff5757] font-bold">001</span>
              <span className="text-[10px] font-mono text-[#5bc0de] tracking-wider">
                C01_SKYSCRAPERS-ALEXANDERBENSON
              </span>
            </div>
          </div>
        </div>

        {/* Plugin Main Body: Left (EQ + Compressor Light Plates) | Right (Dark Input/Width/Pan/Meters) */}
        <div className="flex-1 grid grid-cols-12 gap-2 p-2.5 bg-[#1b2025]">
          {/* Left 7 Cols: EQ & Compressor Metallic Light Plates */}
          <div className="col-span-7 flex flex-col gap-2">
            {/* EQ Module Plate */}
            <div className="atrium-plate-light rounded p-2.5 flex flex-col justify-between border border-[#d6e0e7]">
              {/* Interactive EQ Curve Graph */}
              <div className="h-[88px] rounded bg-[#0c1014] border border-[#2c353d] relative overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 340 96" className="overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="24" x2="340" y2="24" stroke="#1b242c" strokeWidth="1" />
                  <line x1="0" y1="48" x2="340" y2="48" stroke="#2c3842" strokeWidth="1" />
                  <line x1="0" y1="72" x2="340" y2="72" stroke="#1b242c" strokeWidth="1" />
                  <line x1="90" y1="0" x2="90" y2="96" stroke="#1b242c" strokeWidth="1" />
                  <line x1="195" y1="0" x2="195" y2="96" stroke="#1b242c" strokeWidth="1" />
                  <line x1="295" y1="0" x2="295" y2="96" stroke="#1b242c" strokeWidth="1" />

                  {/* Dynamic EQ Response Curve */}
                  <path
                    d={`M 0 48 Q ${Math.max(15, eqNodeX - 45)} 48, ${eqNodeX} ${eqNodeY} Q ${Math.min(325, eqNodeX + 55)} 48, 340 48`}
                    fill="none"
                    stroke="#63b8d6"
                    strokeWidth="2"
                  />
                  <path
                    d={`M 0 48 Q ${Math.max(15, eqNodeX - 45)} 48, ${eqNodeX} ${eqNodeY} Q ${Math.min(325, eqNodeX + 55)} 48, 340 48 L 340 96 L 0 96 Z`}
                    fill="rgba(99, 184, 214, 0.14)"
                  />

                  {/* Band Nodes */}
                  <circle
                    cx={eqNodeX}
                    cy={eqNodeY}
                    r="6"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}
                  />
                  <circle cx="155" cy="48" r="4" fill="#2dd4bf" opacity="0.8" />
                  <circle cx="235" cy="48" r="4" fill="#fbbf24" opacity="0.8" />
                  <circle cx="305" cy="48" r="4" fill="#f97316" opacity="0.8" />
                </svg>
                <div className="absolute bottom-1 left-20 text-[8px] font-mono text-[#6c7f8e]">100</div>
                <div className="absolute bottom-1 left-48 text-[8px] font-mono text-[#6c7f8e]">1k</div>
                <div className="absolute bottom-1 right-8 text-[8px] font-mono text-[#6c7f8e]">10k</div>
              </div>

              {/* Band Selector Buttons */}
              <div className="grid grid-cols-4 gap-1.5 my-1.5">
                {['LOW', 'MID', 'HI MID', 'HIGH'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setActiveEqBand(b)}
                    className={`py-0.5 rounded text-[9px] font-bold tracking-wider border transition-all ${
                      activeEqBand === b
                        ? 'bg-[#1b2836] text-white border-[#5bc0de] shadow-[0_0_6px_rgba(91,192,222,0.5)]'
                        : 'bg-[#252c33] text-[#9fb1bd] border-[#151a1e]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* EQ Knobs Row: FREQ & GAIN */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-1">
                  {['12', '24', '36'].map((slope, i) => (
                    <span
                      key={slope}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        i === 0
                          ? 'bg-[#2a2317] text-[#fbbf24] border border-[#fbbf24]/50'
                          : 'bg-[#22282e] text-[#8ea0ad]'
                      }`}
                    >
                      {slope}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <AtriumKnob
                    param={parameters['cs_eq_freq']}
                    liveState={liveStates['cs_eq_freq']}
                    onChangeBase={onChangeBase}
                    onOpenLearnPopup={onOpenLearnPopup}
                    onDropModulator={onDropModulator}
                    learnModeActive={learnModeActive}
                    selectedForLearn={selectedLearnParamId === 'cs_eq_freq'}
                    size={46}
                  />
                  <AtriumKnob
                    param={parameters['cs_eq_gain']}
                    liveState={liveStates['cs_eq_gain']}
                    onChangeBase={onChangeBase}
                    onOpenLearnPopup={onOpenLearnPopup}
                    onDropModulator={onDropModulator}
                    learnModeActive={learnModeActive}
                    selectedForLearn={selectedLearnParamId === 'cs_eq_gain'}
                    size={46}
                  />
                </div>

                <div className="flex items-center gap-1">
                  {['12', '24', '36'].map((slope, i) => (
                    <span
                      key={slope}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        i === 0
                          ? 'bg-[#2a2317] text-[#fbbf24] border border-[#fbbf24]/50'
                          : 'bg-[#22282e] text-[#8ea0ad]'
                      }`}
                    >
                      {slope}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Compressor Module Plate */}
            <div className="atrium-plate-light rounded p-2.5 flex flex-col justify-between border border-[#d6e0e7]">
              <div className="flex gap-2">
                <div className="flex-1 h-[68px] rounded bg-[#0c1014] border border-[#2c353d] relative overflow-hidden">
                  <svg width="100%" height="100%" viewBox="0 0 260 68">
                    <line x1="0" y1="22" x2="260" y2="22" stroke="#1b242c" strokeWidth="1" />
                    <line x1="0" y1="45" x2="260" y2="45" stroke="#1b242c" strokeWidth="1" />
                    {/* Transfer curve responding to Threshold */}
                    <polyline
                      fill="none"
                      stroke="#63b8d6"
                      strokeWidth="1.8"
                      points={`0,64 ${140 + threshLive * 2.2},${28 - threshLive * 0.4} 260,10`}
                    />
                  </svg>
                </div>
                {/* Gain Reduction LEDs */}
                <div className="w-10 flex flex-col items-center justify-between py-0.5">
                  <span className="text-[8px] font-bold text-[#3a4650]">GR</span>
                  <div className="grid grid-cols-2 gap-1">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPlaying && idx < Math.abs(threshLive) / 4
                            ? 'bg-[#38bdf8] shadow-[0_0_4px_#38bdf8]'
                            : 'bg-[#2d363e]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-around pt-1.5">
                <AtriumKnob
                  param={parameters['cs_comp_thresh']}
                  liveState={liveStates['cs_comp_thresh']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'cs_comp_thresh'}
                  size={44}
                />
                <AtriumKnob
                  param={parameters['cs_comp_mix']}
                  liveState={liveStates['cs_comp_mix']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'cs_comp_mix'}
                  size={44}
                />
                <button
                  type="button"
                  className="px-2.5 py-1 rounded bg-[#1e252b] text-[#9fb1bd] text-[9px] font-bold border border-[#121619]"
                >
                  SLOW
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Input Trim, Stereo Width, Channel Pan, Input/Output Meters */}
          <div className="col-span-5 bg-[#1e242a] rounded border border-[#2f3942] p-2.5 flex flex-col justify-between">
            {/* Top Trim + Solo/Mute/Mono */}
            <div className="flex items-center justify-between border-b border-[#2b343d] pb-2">
              <AtriumKnob
                param={parameters['cs_in_trim']}
                liveState={liveStates['cs_in_trim']}
                onChangeBase={onChangeBase}
                onOpenLearnPopup={onOpenLearnPopup}
                onDropModulator={onDropModulator}
                learnModeActive={learnModeActive}
                selectedForLearn={selectedLearnParamId === 'cs_in_trim'}
                size={44}
              />
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 rounded bg-[#2c2619] border border-[#6e5623] text-[#fbbf24] text-[9px] font-bold">
                  SOLO
                </button>
                <button className="px-2 py-1 rounded bg-[#331c1e] border border-[#6e2b30] text-[#f87171] text-[9px] font-bold">
                  MUTE
                </button>
                <button className="px-2 py-1 rounded bg-[#1a2836] border border-[#2f5578] text-[#63b8d6] text-[9px] font-bold">
                  MONO
                </button>
              </div>
            </div>

            {/* Blue Anodized Knobs: WIDTH & PAN (Exact match to Screenshot 5, 6, 7) */}
            <div className="grid grid-cols-2 gap-2 my-1.5">
              <div className="rounded border border-[#3a4854] bg-[#222930] p-1.5 flex flex-col items-center">
                <AtriumKnob
                  param={parameters['cs_width']}
                  liveState={liveStates['cs_width']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'cs_width'}
                  variant="blue"
                  size={52}
                  showSubLabel={false}
                />
                <div
                  onClick={(e) =>
                    onOpenLearnPopup?.('cs_width', e.currentTarget.getBoundingClientRect())
                  }
                  className="mt-1 text-[10px] font-semibold tracking-wider text-[#c5d4e0] cursor-pointer hover:text-[#38bdf8]"
                >
                  0 WIDTH 2 ({widthLive.toFixed(2)})
                </div>
              </div>

              <div className="rounded border border-[#3a4854] bg-[#222930] p-1.5 flex flex-col items-center">
                <AtriumKnob
                  param={parameters['cs_pan']}
                  liveState={liveStates['cs_pan']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'cs_pan'}
                  variant="blue"
                  size={52}
                  showSubLabel={false}
                />
                <div
                  onClick={(e) =>
                    onOpenLearnPopup?.('cs_pan', e.currentTarget.getBoundingClientRect())
                  }
                  className="mt-1 text-[10px] font-semibold tracking-wider text-[#c5d4e0] cursor-pointer hover:text-[#38bdf8]"
                >
                  L PAN R ({parameters['cs_pan'].displayFormat(liveStates['cs_pan']?.modulatedValue ?? 0)})
                </div>
              </div>
            </div>

            {/* Stereo Meters & Output Fader */}
            <div className="flex-1 flex items-center justify-around bg-[#14181c] rounded border border-[#273038] p-2">
              <div className="flex flex-col items-center h-full justify-between">
                <span className="text-[8px] text-[#7a8b99] tracking-widest">INPUT</span>
                <div className="flex gap-1 h-24 items-end bg-[#0a0d0f] p-1 rounded border border-[#1f272e]">
                  {[0, 1].map((ch) => {
                    const h = isPlaying
                      ? Math.min(100, Math.max(18, 55 + Math.sin(Date.now() / 140 + ch) * 30 * widthLive))
                      : 12;
                    return (
                      <div key={ch} className="w-2.5 h-full bg-[#12171b] flex items-end rounded-sm overflow-hidden">
                        <div
                          style={{ height: `${h}%` }}
                          className="w-full bg-gradient-to-t from-[#1d70b8] via-[#38bdf8] to-[#fbbf24] transition-all duration-75"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Output Trim Fader */}
              <div className="flex flex-col items-center h-full justify-between">
                <span className="text-[8px] text-[#7a8b99] tracking-widest">OUT</span>
                <div className="relative h-24 w-5 flex items-center justify-center">
                  <div className="w-1 h-full bg-[#090c0e] rounded" />
                  <div className="absolute top-1/3 w-4 h-6 rounded-sm bg-gradient-to-b from-[#d8e0e6] to-[#8c98a2] border border-black shadow" />
                </div>
                <span className="text-[10px] font-mono text-[#5bc0de]">0.0 dB</span>
              </div>

              <div className="flex flex-col items-center h-full justify-between">
                <span className="text-[8px] text-[#7a8b99] tracking-widest">OUTPUT</span>
                <div className="flex gap-1 h-24 items-end bg-[#0a0d0f] p-1 rounded border border-[#1f272e]">
                  {[0, 1].map((ch) => {
                    const h = isPlaying
                      ? Math.min(100, Math.max(15, 62 + Math.cos(Date.now() / 120 + ch) * 28))
                      : 12;
                    return (
                      <div key={ch} className="w-2.5 h-full bg-[#12171b] flex items-end rounded-sm overflow-hidden">
                        <div
                          style={{ height: `${h}%` }}
                          className="w-full bg-gradient-to-t from-[#1d70b8] via-[#38bdf8] to-[#34d399] transition-all duration-75"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UNIVERSAL ATRIUM MODULATION TARGETS RACK (HydroHall Reverb, Orbit, Particles, Instrument, Mixer) */}
      {showUniversalRack && (
        <div className="flex-1 rounded-md border border-[#2c363f] bg-[#14191e] p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#232c33] pb-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#f472b6]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#d6e2ea]">
                Atrium Environment Targets (Universal Modulation)
              </span>
            </div>
            <span className="text-[9px] text-[#7a8b99]">
              Drag any Modulator from AUTO → MOD onto any control below
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto py-1">
            {/* Card 1: HydroHall Reverb (Screenshot 1 & 2 aesthetic) */}
            <div className="rounded border border-[#2b343d] bg-[#0b0e11] p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#f472b6]">
                  HYDROHALL REVERB
                </span>
                <span className="text-[9px] font-mono text-[#7a8b99]">
                  Decay: {reverbDecayLive.toFixed(1)}s
                </span>
              </div>

              {/* Animated Concentric Hall Rings responding to Decay */}
              <div className="flex items-center justify-around py-1">
                <AtriumKnob
                  param={parameters['rev_decay']}
                  liveState={liveStates['rev_decay']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'rev_decay'}
                  variant="minimal"
                  size={50}
                />
                <div className="w-16 h-14 rounded border border-[#f472b6]/30 bg-black flex items-center justify-center relative overflow-hidden">
                  {[1, 2, 3].map((ring) => (
                    <div
                      key={ring}
                      style={{
                        width: `${Math.min(54, ring * 12 + reverbDecayLive * 2.5)}px`,
                        height: `${Math.min(54, ring * 12 + reverbDecayLive * 2.5)}px`,
                      }}
                      className="absolute rounded-full border border-[#f472b6]/50 transition-all duration-75"
                    />
                  ))}
                </div>
                <AtriumKnob
                  param={parameters['rev_shimmer']}
                  liveState={liveStates['rev_shimmer']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'rev_shimmer'}
                  variant="minimal"
                  size={50}
                />
              </div>
            </div>

            {/* Card 2: 3D Orbit & HydroSwarm Particles (Screenshot 1 & 4) */}
            <div className="rounded border border-[#2b343d] bg-[#0b0e11] p-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#34d399]">
                  ORBIT & PARTICLES
                </span>
                <span className="text-[9px] font-mono text-[#34d399]">
                  {Math.round(orbitLive)}° • {Math.round(particleLive)}%
                </span>
              </div>

              <div className="flex items-center justify-around py-1">
                <AtriumKnob
                  param={parameters['orbit_rotation']}
                  liveState={liveStates['orbit_rotation']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'orbit_rotation'}
                  variant="minimal"
                  size={50}
                />

                {/* Mini Hydroswarm Orbit visualizer */}
                <div className="w-16 h-14 rounded border border-[#34d399]/30 bg-black flex items-center justify-center relative overflow-hidden">
                  <div
                    style={{ transform: `rotate(${orbitLive}deg)` }}
                    className="w-11 h-5 rounded-full border border-[#34d399]/70 flex items-center justify-between px-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_6px_#34d399]" />
                    <span
                      style={{ opacity: particleLive / 100 }}
                      className="w-1.5 h-1.5 rounded-full bg-[#f472b6]"
                    />
                  </div>
                </div>

                <AtriumKnob
                  param={parameters['particle_intensity']}
                  liveState={liveStates['particle_intensity']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'particle_intensity'}
                  variant="minimal"
                  size={50}
                />
              </div>
            </div>

            {/* Card 3: Instrument Filter & Track Mixer Controls */}
            <div className="col-span-2 rounded border border-[#2b343d] bg-[#0f1317] px-3 py-1.5 flex items-center justify-around">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#38bdf8] w-20">
                  Spher8 Synth Filter
                </span>
                <AtriumKnob
                  param={parameters['inst_cutoff']}
                  liveState={liveStates['inst_cutoff']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'inst_cutoff'}
                  size={44}
                />
              </div>

              <div className="h-8 w-[1px] bg-[#232c35]" />

              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#fbbf24] w-16">
                  Mixer Track 1
                </span>
                <AtriumKnob
                  param={parameters['mixer_pan']}
                  liveState={liveStates['mixer_pan']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'mixer_pan'}
                  size={44}
                />
                <AtriumKnob
                  param={parameters['mixer_vol']}
                  liveState={liveStates['mixer_vol']}
                  onChangeBase={onChangeBase}
                  onOpenLearnPopup={onOpenLearnPopup}
                  onDropModulator={onDropModulator}
                  learnModeActive={learnModeActive}
                  selectedForLearn={selectedLearnParamId === 'mixer_vol'}
                  size={44}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}