import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Power,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Slim reference transport (play / pause / reset + tempo) for testing the engine.
 */
export default function StandaloneTransportBar({
  isPlaying,
  onTogglePlay,
  onResetTransport,
  bpm,
  simTime,
  automationEnabled,
  setAutomationEnabled,
  onChangeBpm,
  modCount,
  assignmentCount,
}) {
  const totalBeats = (simTime * bpm) / 60;
  const bar = Math.floor(totalBeats / 4) + 1;
  const beat = (Math.floor(totalBeats) % 4) + 1;
  const ticks = Math.floor((totalBeats % 1) * 960).toString().padStart(3, '0');
  const secs = simTime.toFixed(2).padStart(5, '0');

  return (
    <header className="shrink-0 h-11 border-b border-[#2b353d] atrium-header-grad flex items-center justify-between px-3 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold tracking-[0.22em] text-white">ATRIUM</span>
          <span className="text-[8px] font-mono text-[#7a8b99] mt-1">0.9</span>
        </div>
        <div className="w-px h-5 bg-[#39444d]" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#5bc0de] truncate">
          Universal Modulation · Standalone Demonstration
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-[#38bdf8] border-[#7dd3fc] text-[#08222e] shadow-[0_0_10px_rgba(56,189,248,0.55)]'
              : 'atrium-btn-metal border-[#3d4a55] text-[#9fb1bd]'
          }`}
          title={isPlaying ? 'Pause modulation clock' : 'Play modulation clock'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={onResetTransport}
          className="atrium-btn-metal h-7 px-2 rounded border border-[#3d4a55] text-[9px] font-bold text-[#c5d4e0] flex items-center gap-1"
          title="Reset transport to 1.1.001"
        >
          <RotateCcw className="w-3 h-3" /> RTZ
        </button>

        <div className="atrium-lcd rounded border border-[#2a333b] h-7 px-2 flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#5bc0de] tabular-nums">
            {bar}.{beat}.{ticks}
          </span>
          <span className="text-[9px] font-mono text-[#5d6f7c] tabular-nums">{secs}s</span>
        </div>

        <div className="atrium-lcd rounded border border-[#2a333b] h-7 px-2 flex items-center gap-1">
          <span className="text-[8px] uppercase tracking-wider text-[#667885]">BPM</span>
          <input
            type="number"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => onChangeBpm(parseInt(e.target.value, 10) || 120)}
            className="w-10 bg-transparent text-[10px] font-mono text-white focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setAutomationEnabled(!automationEnabled)}
          className={`h-7 px-2 rounded border text-[9px] font-bold flex items-center gap-1 ${
            automationEnabled
              ? 'bg-[#38bdf8]/15 border-[#38bdf8]/70 text-[#7dd3fc]'
              : 'atrium-btn-metal border-[#3d4a55] text-[#7a8b99]'
          }`}
          title="Show base + automation + modulation coexisting"
        >
          <Power className="w-3 h-3" /> AUTOMATION {automationEnabled ? 'IN' : 'OUT'}
        </button>

        <span className="text-[9px] font-mono text-[#6c7d8c] hidden lg:inline">
          {modCount} SRC · {assignmentCount} ROUTES
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/atrium"
          className="atrium-btn-metal h-7 px-2.5 rounded border border-[#3d4a55] text-[9px] font-bold text-[#c5d4e0] hover:text-white flex items-center gap-1"
          title="Open the full Atrium DAW prototype with shared modulation state"
        >
          FULL ATRIUM <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </header>
  );
}