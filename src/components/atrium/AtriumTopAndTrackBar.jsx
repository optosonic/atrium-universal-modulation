import React from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Square,
  RotateCcw,
  Repeat,
  Clock,
  Volume2,
  Sliders,
  ExternalLink,
} from 'lucide-react';

/**
 * Atrium Top Transport Bar & Left Track Inspector (Matches Screenshot 4)
 */
export default function AtriumTopAndTrackBar({
  isPlaying,
  onTogglePlay,
  onResetTransport,
  bpm,
  setBpm,
  simTime,
  learnModeActive,
  setLearnModeActive,
  parameters,
  liveStates,
  onOpenLearnPopup,
  onDropModulator,
}) {
  // Format time into Bars.Beats.Ticks and 0:00.000
  const totalBeats = (simTime * bpm) / 60;
  const bar = Math.floor(totalBeats / 4) + 1;
  const beat = (Math.floor(totalBeats) % 4) + 1;
  const ticks = Math.floor((totalBeats % 1) * 960)
    .toString()
    .padStart(3, '0');

  const mins = Math.floor(simTime / 60);
  const secs = Math.floor(simTime % 60)
    .toString()
    .padStart(2, '0');
  const ms = Math.floor((simTime % 1) * 1000)
    .toString()
    .padStart(3, '0');

  return (
    <header className="h-14 atrium-header-grad border-b border-[#2b353e] px-3 flex items-center justify-between select-none shrink-0">
      {/* Left: ATRIUM Brand Logo */}
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[20px] font-light tracking-[0.28em] text-[#7ccce5] leading-none">
            ATRIUM
          </div>
          <div className="text-[8px] tracking-wider text-[#8ea0ad] flex justify-between mt-0.5">
            <span>Intelligent Music Design</span>
            <span className="text-white font-semibold ml-2">by Spher8</span>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full border border-[#5bc0de]/60 bg-[#101820] flex items-center justify-center text-[#7ccce5] text-[11px] font-bold">
          ↕
        </div>
        <Link
          to="/universal-modulator"
          className="ml-2 px-2.5 py-1 rounded atrium-btn-cyan text-[9px] font-bold tracking-wider flex items-center gap-1"
          title="Open Isolated Universal Modulator Only Page (for Cursor handoff)"
        >
          <span>MODULATOR ONLY VIEW</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Center-Left: Transport Controls (RTZ, REC, PLAY, STOP, LOOP, CLICK) */}
      <div className="flex items-center gap-1.5 bg-[#12161a] px-2.5 py-1.5 rounded border border-[#28323b]">
        <button
          type="button"
          onClick={onResetTransport}
          className="flex flex-col items-center group"
          title="Return to Zero (Reset)"
        >
          <span className="w-8 h-6 rounded bg-gradient-to-b from-[#e2e7ec] to-[#9aa6b0] text-[#14191e] flex items-center justify-center shadow">
            <RotateCcw className="w-3.5 h-3.5" />
          </span>
          <span className="text-[7px] font-bold tracking-wider text-[#9fb1bd] mt-0.5">
            RTZ
          </span>
        </button>

        <button type="button" className="flex flex-col items-center">
          <span className="w-8 h-6 rounded bg-gradient-to-b from-[#e2e7ec] to-[#9aa6b0] flex items-center justify-center shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d93838]" />
          </span>
          <span className="text-[7px] font-bold tracking-wider text-[#9fb1bd] mt-0.5">
            REC
          </span>
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          className="flex flex-col items-center"
          title={isPlaying ? 'Pause Prototype Modulation' : 'Play Prototype Modulation'}
        >
          <span
            className={`w-8 h-6 rounded flex items-center justify-center shadow transition-all ${
              isPlaying
                ? 'bg-gradient-to-b from-[#67e8f9] to-[#0284c7] text-[#06131a] shadow-[0_0_10px_#38bdf8]'
                : 'bg-gradient-to-b from-[#e2e7ec] to-[#9aa6b0] text-[#14191e]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </span>
          <span className="text-[7px] font-bold tracking-wider text-[#9fb1bd] mt-0.5">
            PLAY
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isPlaying) onTogglePlay();
          }}
          className="flex flex-col items-center"
        >
          <span
            className={`w-8 h-6 rounded flex items-center justify-center shadow ${
              !isPlaying
                ? 'bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] text-white'
                : 'bg-gradient-to-b from-[#e2e7ec] to-[#9aa6b0] text-[#14191e]'
            }`}
          >
            <Square className="w-3 h-3 fill-current" />
          </span>
          <span className="text-[7px] font-bold tracking-wider text-[#9fb1bd] mt-0.5">
            STOP
          </span>
        </button>

        <button type="button" className="flex flex-col items-center">
          <span className="w-8 h-6 rounded bg-gradient-to-b from-[#fcd34d] to-[#d97706] text-[#1f1605] flex items-center justify-center shadow">
            <Repeat className="w-3.5 h-3.5" />
          </span>
          <span className="text-[7px] font-bold tracking-wider text-[#9fb1bd] mt-0.5">
            LOOP
          </span>
        </button>

        <button type="button" className="flex flex-col items-center">
          <span className="w-8 h-6 rounded bg-gradient-to-b from-[#e2e7ec] to-[#9aa6b0] text-[#14191e] flex items-center justify-center shadow">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <span className="text-[7px] font-bold tracking-wider text-[#9fb1bd] mt-0.5">
            CLICK
          </span>
        </button>
      </div>

      {/* Center LCD Counter Display */}
      <div className="atrium-lcd px-5 py-1 rounded border border-[#2c3842] flex flex-col items-center min-w-[215px]">
        <div className="text-[14px] font-mono text-[#7ccce5] tracking-widest leading-tight">
          C1 {bar.toString().padStart(3, '0')}.{beat}.{ticks}
        </div>
        <div className="text-[13px] font-mono text-[#7ccce5] tracking-widest leading-tight">
          {mins}:{secs}.{ms}
        </div>
        <div className="w-full flex items-center justify-between text-[9px] font-mono text-[#5bc0de] mt-0.5">
          <label className="flex items-center gap-1 cursor-pointer">
            <span>BPM</span>
            <input
              type="number"
              min="40"
              max="240"
              value={bpm}
              onChange={(e) => setBpm(Math.max(40, Math.min(240, Number(e.target.value) || 120)))}
              className="w-12 bg-transparent text-[#7ccce5] font-mono focus:outline-none border-b border-[#2c3e4c]"
            />
          </label>
          <span>4/4</span>
        </div>
      </div>

      {/* Right View & Mode Controls */}
      <div className="flex flex-col gap-1 items-end">
        <Link
          to="/"
          className="px-2 py-0.5 rounded-sm text-[8px] font-bold tracking-wider atrium-btn-cyan flex items-center gap-1"
          title="Open the standalone Universal Modulator reference view"
        >
          MODULATOR ONLY VIEW <ExternalLink className="w-2.5 h-2.5" />
        </Link>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-[#7a8b99] mr-1">VIEW</span>
          {['INFO', 'MOVIE', 'ORBIT', 'AUDIO', 'MIDI', 'HANDS'].map((v, i) => (
            <span
              key={v}
              className={`px-2.5 py-0.5 rounded-sm text-[8px] font-bold tracking-wider border ${
                i < 5
                  ? 'bg-[#1a3a52] border-[#4aa8d8] text-[#bfe8ff]'
                  : 'bg-[#182026] border-[#2c363f] text-[#7a8b99]'
              }`}
            >
              {v}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-[#7a8b99]">WAVE</span>
          <span className="px-2 py-0.5 rounded-sm text-[8px] bg-[#1a2229] text-[#8ea0ad] border border-[#2c363f]">
            LINEAR
          </span>
          <span className="px-2 py-0.5 rounded-sm text-[8px] bg-[#2a5c78] text-white border border-[#5bc0de]">
            CLASSIC
          </span>
          <button
            type="button"
            onClick={() => setLearnModeActive(!learnModeActive)}
            className={`px-3 py-0.5 rounded-sm text-[9px] font-bold border transition-all ${
              learnModeActive
                ? 'bg-[#34d399] text-[#051810] border-white shadow-[0_0_8px_#34d399]'
                : 'bg-gradient-to-b from-[#2b6e44] to-[#1a472a] text-[#a7f3d0] border-[#429e63]'
            }`}
            title="Highlight all modulatable knobs & open MIDI | OSC | MOD popup"
          >
            MIDI
          </button>
          <span className="px-2.5 py-0.5 rounded-sm text-[8px] bg-[#182026] text-[#9fb1bd] border border-[#2c363f]">
            MULTI
          </span>
          <span className="px-2.5 py-0.5 rounded-sm text-[8px] bg-[#182026] text-[#9fb1bd] border border-[#2c363f]">
            AI
          </span>
        </div>
      </div>
    </header>
  );
}