import React, { useRef, useState } from 'react';

/**
 * Authentic Atrium Rotary Knob with:
 * - Metallic dark or blue anodized cap (matching Channel Strip Mk II & Hydroswarm)
 * - Base parameter indicator line
 * - Animated modulation arc & glowing live dot
 * - MIDI / OSC / MOD Learn highlight badge (top-right cyan circle with bars, exactly like screenshot 6 & 7)
 * - Drag-and-drop modulator target receptor
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

  if (!param || !liveState) return null;

  const { normBase, normAuto, normLive, modulatedValue, contributions } = liveState;
  const hasMod = contributions && contributions.length > 0;
  const primaryColor = hasMod ? contributions[0].color : '#38bdf8';

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

    if (learnModeActive) {
      onOpenLearnPopup?.(param.id, e.currentTarget.getBoundingClientRect());
      return;
    }

    dragStartRef.current = {
      y: e.clientY,
      startVal: param.baseValue,
    };

    const handleMouseMove = (moveEvent) => {
      if (!dragStartRef.current) return;
      const dy = dragStartRef.current.y - moveEvent.clientY;
      const span = param.max - param.min;
      const delta = (dy / 130) * span;
      const next = Math.max(param.min, Math.min(param.max, dragStartRef.current.startVal + delta));
      onChangeBase?.(param.id, next);
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={handleContextMenu}
      className={`relative inline-flex flex-col items-center group transition-all rounded px-1.5 py-1 ${
        learnModeActive || hasMod || selectedForLearn
          ? 'ring-1 ring-[#38bdf8]/50 bg-[#38bdf8]/[0.06]'
          : ''
      } ${isDragOver ? 'ring-2 ring-[#38bdf8] bg-[#38bdf8]/20 scale-105' : ''}`}
      title={`${param.plugin} — ${param.name}\nDrag vertically to adjust base value • Right-click or click badge for MIDI | OSC | MOD assignment • Drop any modulator here`}
    >
      {/* Top-right MIDI/MOD Learn Badge (exact match to screenshot 6 & 7) */}
      {(learnModeActive || hasMod || selectedForLearn) && (
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
        >
          <span className="flex items-end gap-[1px] h-2">
            <span className="w-[1.5px] h-1 bg-[#5bc0de]" style={{ backgroundColor: hasMod ? primaryColor : '#5bc0de' }} />
            <span className="w-[1.5px] h-2 bg-[#5bc0de]" style={{ backgroundColor: hasMod ? primaryColor : '#5bc0de' }} />
            <span className="w-[1.5px] h-1.5 bg-[#5bc0de]" style={{ backgroundColor: hasMod ? primaryColor : '#5bc0de' }} />
          </span>
        </button>
      )}

      {/* Knob SVG + Cap */}
      <div
        onMouseDown={handleMouseDown}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center cursor-ns-resize"
      >
        <svg width={size} height={size} className="absolute inset-0 overflow-visible pointer-events-none">
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
            strokeOpacity={hasMod ? 0.45 : 0.85}
            strokeWidth={variant === 'minimal' ? 2.2 : 2.5}
            strokeLinecap="round"
          />

          {/* Dynamic Modulation excursion arc */}
          {hasMod && (
            <path
              d={describeArc(cx, cy, r, autoDeg, liveDeg)}
              fill="none"
              stroke={primaryColor}
              strokeWidth={3.5}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${primaryColor})` }}
            />
          )}

          {/* Secondary modulator outer halo if multiple modulators assigned */}
          {contributions && contributions.length > 1 && (
            <circle
              cx={cx}
              cy={cy}
              r={r + 3}
              fill="none"
              stroke={contributions[1].color}
              strokeWidth="1.2"
              strokeDasharray="3 3"
              opacity="0.75"
            />
          )}

          {/* Live moving dot on perimeter */}
          {hasMod && (
            <circle
              cx={livePos.x}
              cy={livePos.y}
              r={3}
              fill={primaryColor}
              style={{ filter: `drop-shadow(0 0 5px ${primaryColor})` }}
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
                className="absolute inset-0 flex justify-center pt-1 pointer-events-none opacity-40"
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
                  backgroundColor: hasMod ? primaryColor : variant === 'blue' ? '#ffffff' : '#63c5ea',
                  boxShadow: hasMod ? `0 0 6px ${primaryColor}` : 'none',
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
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[#1e2429] group-hover:text-black dark:text-[#9fb1bd]">
            {param.shortName}
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