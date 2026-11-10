import React, { useRef, useState } from 'react';
import { valueToNorm, normToValue } from '@/lib/modulationEngine';
import useModulationEngine from '@/hooks/useModulationEngine';

/**
 * Authentic Atrium Rotary Knob with:
 * - Metallic dark or blue anodized cap (matching Channel Strip Mk II & Hydroswarm)
 * - Base parameter indicator line & perimeter tick
 * - Logarithmic-aware modulation range band (min..max excursion) & instantaneous live arc/dot
 * - Multi-modulator concentric colour-coded excursion rings
 * - Direct click-to-assign (click without dragging opens MIDI | OSC | MOD popup)
 * - Eligible target highlight during modulator drag + visual confirmation pulse on drop
 */
export default function AtriumKnob({
  param,
  liveState,
  onChangeBase,
  onOpenLearnPopup,
  onDropModulator,
  learnModeActive = false,
  selectedForLearn = false,
  variant = 'dark', // 'dark' | 'blue' | 'minimal'
  size = 54,
  showSubLabel = true,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragStartRef = useRef(null);

  const engine = useModulationEngine();
  const engineDragMod = engine?.draggingModulator || null;
  const engineNotice = engine?.lastAssignedNotice || null;

  if (!param || !liveState) return null;

  const {
    normBase,
    normAuto,
    normLive,
    normRangeMin,
    normRangeMax,
    modulatedValue,
    contributions = [],
  } = liveState;
  const hasMod = contributions.length > 0;
  const primaryColor = hasMod ? contributions[0].color : '#38bdf8';

  const isEligibleDragTarget = Boolean(engineDragMod);
  const dragColor = engineDragMod?.color || '#38bdf8';
  const isJustAssigned = engineNotice && engineNotice.paramId === param.id;

  // Angle mapping: -135 deg to +135 deg (total 270 deg sweep)
  const startAngle = -135;
  const sweep = 270;
  const baseDeg = startAngle + normBase * sweep;
  const autoDeg = startAngle + normAuto * sweep;
  const liveDeg = startAngle + normLive * sweep;

  // Polar to cartesian for SVG arc
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 5;

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, radius, startA, endA) => {
    const s = Math.min(startA, endA);
    const e = Math.max(startA, endA);
    if (Math.abs(e - s) < 0.5) return '';
    const start = polarToCartesian(x, y, radius, e);
    const end = polarToCartesian(x, y, radius, s);
    const largeArcFlag = e - s <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const anchorRect = e.currentTarget.getBoundingClientRect();

    if (learnModeActive) {
      onOpenLearnPopup?.(param.id, anchorRect);
      return;
    }

    dragStartRef.current = {
      y: e.clientY,
      startNorm: valueToNorm(param, param.baseValue),
      moved: false,
    };

    const handleMouseMove = (moveEvent) => {
      if (!dragStartRef.current) return;
      const dy = dragStartRef.current.y - moveEvent.clientY;
      if (Math.abs(dy) >= 3) {
        dragStartRef.current.moved = true;
      }
      if (!dragStartRef.current.moved) return;

      const nextNorm = Math.max(0, Math.min(1, dragStartRef.current.startNorm + dy / 130));
      const nextVal = normToValue(param, nextNorm);
      onChangeBase?.(param.id, nextVal);
    };

    const handleMouseUp = () => {
      const wasClick = dragStartRef.current && !dragStartRef.current.moved;
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Direct click on a parameter opens the MIDI | OSC | MOD assignment popup immediately
      if (wasClick) {
        onOpenLearnPopup?.(param.id, anchorRect);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenLearnPopup?.(param.id, e.currentTarget.getBoundingClientRect());
  };

  const handleDragOver = (e) => {
    if (e.dataTransfer.types.includes('application/atrium-modulator')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'link';
      if (!isDragOver) setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const modId = e.dataTransfer.getData('application/atrium-modulator');
    if (modId && onDropModulator) {
      onDropModulator(modId, param.id);
    }
  };

  const livePos = polarToCartesian(cx, cy, r, liveDeg);
  const baseInner = polarToCartesian(cx, cy, r - 2.2, baseDeg);
  const baseOuter = polarToCartesian(cx, cy, r + 2.2, baseDeg);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      className={`relative inline-flex flex-col items-center group transition-all rounded px-1.5 py-1 ${
        selectedForLearn
          ? 'ring-1 ring-[#38bdf8] bg-[#38bdf8]/15'
          : learnModeActive || hasMod
          ? 'ring-1 ring-[#38bdf8]/45 bg-[#38bdf8]/[0.05]'
          : ''
      } ${
        isEligibleDragTarget && !isDragOver
          ? 'ring-1 ring-dashed ring-[#38bdf8]/80 bg-[#38bdf8]/10'
          : ''
      } ${isDragOver ? 'ring-2 scale-105 z-20' : ''}`}
      style={
        isDragOver
          ? {
              borderColor: dragColor,
              backgroundColor: `${dragColor}28`,
              boxShadow: `0 0 12px ${dragColor}66`,
            }
          : isJustAssigned
          ? {
              boxShadow: `0 0 14px ${engineNotice.color}88`,
              backgroundColor: `${engineNotice.color}22`,
            }
          : undefined
      }
      title={`${param.plugin} — ${param.name}\nClick to assign MOD / MIDI / OSC • Drag vertically to adjust base value • Drop any modulator here`}
    >
      {/* Pointer hover indicator while dragging a modulator */}
      {isDragOver && engineDragMod && (
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold whitespace-nowrap pointer-events-none shadow-md"
          style={{
            backgroundColor: dragColor,
            color: '#061017',
          }}
        >
          + {engineDragMod.name}
        </div>
      )}

      {/* Brief visual confirmation badge when assignment is created */}
      {isJustAssigned && !isDragOver && (
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold whitespace-nowrap pointer-events-none shadow-md"
          style={{
            backgroundColor: engineNotice.color,
            color: '#061017',
          }}
        >
          ✓ {engineNotice.modName}
        </div>
      )}

      {/* Top-right MIDI/MOD Learn Badge (exact match to screenshot 6 & 7) */}
      {(learnModeActive || hasMod || selectedForLearn || isEligibleDragTarget) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLearnPopup?.(param.id, e.currentTarget.parentElement.getBoundingClientRect());
          }}
          className="absolute -top-1.5 -right-1.5 z-20 w-4 h-4 rounded-full bg-[#12181d] border border-[#5bc0de] flex items-center justify-center shadow hover:scale-110 transition-transform"
          style={{
            borderColor: hasMod ? primaryColor : '#5bc0de',
            boxShadow: `0 0 6px ${hasMod ? primaryColor : '#5bc0de'}66`,
          }}
          title="Open MIDI | OSC | MOD Assignment"
        >
          <span className="flex items-end gap-[1px] h-2">
            <span
              className="w-[1.5px] h-1"
              style={{ backgroundColor: hasMod ? primaryColor : '#5bc0de' }}
            />
            <span
              className="w-[1.5px] h-2"
              style={{ backgroundColor: hasMod ? primaryColor : '#5bc0de' }}
            />
            <span
              className="w-[1.5px] h-1.5"
              style={{ backgroundColor: hasMod ? primaryColor : '#5bc0de' }}
            />
          </span>
        </button>
      )}

      {/* Knob SVG + Cap */}
      <div
        onMouseDown={handleMouseDown}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center cursor-ns-resize"
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0 overflow-visible pointer-events-none"
        >
          {/* Background track arc */}
          <path
            d={describeArc(cx, cy, r, -135, 135)}
            fill="none"
            stroke={variant === 'minimal' ? '#3a444d' : 'rgba(18, 24, 29, 0.7)'}
            strokeWidth={variant === 'minimal' ? 2.2 : 3}
            strokeLinecap="round"
          />

          {/* Base value arc */}
          <path
            d={describeArc(cx, cy, r, -135, baseDeg)}
            fill="none"
            stroke={variant === 'minimal' ? primaryColor : '#5bc0de'}
            strokeOpacity={hasMod ? 0.35 : 0.85}
            strokeWidth={variant === 'minimal' ? 2.2 : 2.5}
            strokeLinecap="round"
          />

          {/* Full Modulation Range Band (min..max excursion) for primary & multi-modulator contributors */}
          {hasMod &&
            contributions.slice(0, 3).map((contrib, idx) => {
              const ringRadius = r + idx * 2.6;
              const minA = startAngle + (contrib.normMin ?? normRangeMin ?? normAuto) * sweep;
              const maxA = startAngle + (contrib.normMax ?? normRangeMax ?? normAuto) * sweep;
              const cLiveA = startAngle + (contrib.normLive ?? normLive) * sweep;
              return (
                <g key={contrib.assignment.id}>
                  {/* Subtle full excursion range band (min..max) */}
                  <path
                    d={describeArc(cx, cy, ringRadius, minA, maxA)}
                    fill="none"
                    stroke={contrib.color}
                    strokeOpacity={idx === 0 ? 0.28 : 0.35}
                    strokeWidth={idx === 0 ? 3.2 : 1.8}
                    strokeLinecap="round"
                  />
                  {/* Secondary contributor live excursion trace on outer concentric ring */}
                  {idx > 0 && (
                    <path
                      d={describeArc(cx, cy, ringRadius, autoDeg, cLiveA)}
                      fill="none"
                      stroke={contrib.color}
                      strokeOpacity={0.9}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}

          {/* Instantaneous Combined Modulation Excursion Arc (autoDeg -> liveDeg) */}
          {hasMod && (
            <path
              d={describeArc(cx, cy, r, autoDeg, liveDeg)}
              fill="none"
              stroke={primaryColor}
              strokeWidth={3.2}
              strokeLinecap="round"
            />
          )}

          {/* Crisp Base Value Marker Tick on Perimeter */}
          <line
            x1={baseInner.x}
            y1={baseInner.y}
            x2={baseOuter.x}
            y2={baseOuter.y}
            stroke="#ffffff"
            strokeOpacity={hasMod ? 0.75 : 0.4}
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Live moving dot on perimeter */}
          {hasMod && (
            <circle
              cx={livePos.x}
              cy={livePos.y}
              r={2.8}
              fill={primaryColor}
              stroke="#081016"
              strokeWidth="0.8"
            />
          )}
        </svg>

        {/* Physical Knob Cap (skip if Hydroswarm minimal ring style) */}
        {variant !== 'minimal' ? (
          <div
            style={{
              width: size - 14,
              height: size - 14,
              background:
                variant === 'blue'
                  ? 'radial-gradient(circle at 35% 30%, #3b73b9 0%, #1d3c6a 60%, #0e1e38 100%)'
                  : 'radial-gradient(circle at 35% 30%, #46515a 0%, #242a30 65%, #14181c 100%)',
              boxShadow:
                '0 3px 6px rgba(0,0,0,0.75), inset 0 1px 1px rgba(255,255,255,0.25)',
            }}
            className="rounded-full relative flex items-center justify-center border border-black/80"
          >
            {/* Base Value Pointer (ghosted when modulated) */}
            {hasMod && (
              <div
                style={{ transform: `rotate(${baseDeg}deg)` }}
                className="absolute inset-0 flex justify-center pt-1 pointer-events-none opacity-45"
              >
                <div className="w-[1.5px] h-2.5 bg-white rounded-full" />
              </div>
            )}

            {/* Live Value Pointer */}
            <div
              style={{ transform: `rotate(${liveDeg}deg)` }}
              className="absolute inset-0 flex justify-center pt-1 pointer-events-none"
            >
              <div
                className="w-[2px] h-3 rounded-full"
                style={{
                  backgroundColor: hasMod
                    ? primaryColor
                    : variant === 'blue'
                    ? '#ffffff'
                    : '#63c5ea',
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-mono font-semibold text-[#d6e2ea]">
            {param.displayFormat(modulatedValue)}
          </div>
        )}
      </div>

      {/* Parameter Label & Live Readout */}
      {showSubLabel && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenLearnPopup?.(param.id, e.currentTarget.parentElement.getBoundingClientRect());
          }}
          className="mt-0.5 text-center cursor-pointer leading-tight"
        >
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[#1e2429] group-hover:text-black dark:text-[#9fb1bd] flex items-center justify-center gap-0.5">
            <span>{param.shortName}</span>
            {contributions.length > 1 && (
              <span className="inline-flex items-center gap-0.5 ml-0.5">
                {contributions.map((c) => (
                  <span
                    key={c.assignment.id}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </span>
            )}
          </div>
          <div
            className="text-[10px] font-mono tabular-nums"
            style={{ color: hasMod ? primaryColor : '#4a5864' }}
          >
            {param.displayFormat(modulatedValue)}
          </div>
        </div>
      )}
    </div>
  );
}