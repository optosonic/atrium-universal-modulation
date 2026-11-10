import React, { useRef, useState } from 'react';

const SYNC_RATES = {
  '1/1': 0.5,
  '1/2': 1.0,
  '1/4': 2.0,
  '1/8': 4.0,
  '1/16': 8.0,
  '1/4T': 3.0,
  '1/8D': 2.66,
};

/**
 * Interactive multi-drag Step Sequencer overlay for STEP modulators.
 * - Mouse down + drag vertically on a single step or sweep horizontally across all bars.
 * - Interpolates intermediate steps on fast mouse sweeps so no bars are missed.
 * - Double-click or Alt+click resets a bar to center/zero.
 */
export default function StepSequencerOverlay({
  modulator,
  simTime,
  bpm,
  onUpdateSteps,
}) {
  const containerRef = useRef(null);
  const stepsDraftRef = useRef(modulator.steps || []);
  const lastPaintedRef = useRef(null);
  const [hoverStepIdx, setHoverStepIdx] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const steps = modulator.steps && modulator.steps.length
    ? modulator.steps
    : [0.8, 0.2, 0.6, -0.4, 0.9, -0.2, 0.5, -0.7];

  // Keep draft ref synced when not actively dragging
  if (!isDragging) {
    stepsDraftRef.current = steps;
  }

  // Compute current active step index from transport time
  const tempoScale = (bpm || 120) / 120;
  const freq = modulator.tempoSync
    ? (SYNC_RATES[modulator.syncRate] || 1.0) * tempoScale
    : modulator.rate;
  const phaseOffset = (modulator.phase || 0) / 360;
  const cyclePos = (((simTime * freq + phaseOffset) % 1) + 1) % 1;
  const activeStepIdx = Math.floor(cyclePos * steps.length) % steps.length;

  const computeStepAndValue = (clientX, clientY) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const count = stepsDraftRef.current.length;
    if (count === 0 || rect.width <= 0 || rect.height <= 0) return null;

    // Horizontal -> step index [0 .. count-1]
    const relX = Math.max(0, Math.min(rect.width - 0.001, clientX - rect.left));
    const idx = Math.min(count - 1, Math.max(0, Math.floor((relX / rect.width) * count)));

    // Vertical -> normalized [0..1] with small top/bottom padding for easy -1 / +1 reach
    const padY = 8;
    const usableH = Math.max(1, rect.height - padY * 2);
    const normY = 1 - Math.max(0, Math.min(1, (clientY - (rect.top + padY)) / usableH));
    // Internal step values live in [-1, 1]
    const val = Math.max(-1, Math.min(1, +(normY * 2 - 1).toFixed(3)));

    return { idx, val };
  };

  const applyPaintAt = (clientX, clientY, altKey = false) => {
    const hit = computeStepAndValue(clientX, clientY);
    if (!hit) return;

    const targetVal = altKey
      ? modulator.polarity === 'unipolar'
        ? -1
        : 0
      : hit.val;

    const next = [...stepsDraftRef.current];
    const prev = lastPaintedRef.current;

    if (prev && prev.idx !== hit.idx) {
      const start = Math.min(prev.idx, hit.idx);
      const end = Math.max(prev.idx, hit.idx);
      const span = end - start;
      for (let i = start; i <= end; i++) {
        const t = span === 0 ? 1 : (i - prev.idx) / (hit.idx - prev.idx);
        const interp = prev.val + (targetVal - prev.val) * t;
        next[i] = Math.max(-1, Math.min(1, +interp.toFixed(3)));
      }
    } else {
      next[hit.idx] = targetVal;
    }

    lastPaintedRef.current = { idx: hit.idx, val: targetVal };
    stepsDraftRef.current = next;
    setHoverStepIdx(hit.idx);
    onUpdateSteps(next);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    stepsDraftRef.current = [...steps];
    lastPaintedRef.current = null;
    setIsDragging(true);
    applyPaintAt(e.clientX, e.clientY, e.altKey);

    const handleWindowMove = (moveEvent) => {
      applyPaintAt(moveEvent.clientX, moveEvent.clientY, moveEvent.altKey);
    };

    const handleWindowUp = () => {
      setIsDragging(false);
      lastPaintedRef.current = null;
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('mouseup', handleWindowUp);
    };

    window.addEventListener('mousemove', handleWindowMove);
    window.addEventListener('mouseup', handleWindowUp);
  };

  const handleMouseMoveHover = (e) => {
    if (isDragging) return;
    const hit = computeStepAndValue(e.clientX, e.clientY);
    setHoverStepIdx(hit ? hit.idx : null);
  };

  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const hit = computeStepAndValue(e.clientX, e.clientY);
    if (!hit) return;
    const next = [...steps];
    next[hit.idx] = modulator.polarity === 'unipolar' ? -1 : 0;
    onUpdateSteps(next);
  };

  const isBipolar = modulator.polarity !== 'unipolar';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveHover}
      onMouseLeave={() => !isDragging && setHoverStepIdx(null)}
      onDoubleClick={handleDoubleClick}
      className="absolute inset-0 flex items-stretch gap-1 px-2 py-2 bg-[#070a0d]/80 select-none cursor-crosshair"
      title="Click and drag across bars to draw steps • Alt+drag or double-click to zero"
    >
      {steps.map((val, idx) => {
        const isCurrentPlayStep = idx === activeStepIdx && modulator.enabled;
        const isHovered = idx === hoverStepIdx;

        // Normalized [0..1] height for unipolar, or split around 50% for bipolar
        const norm = Math.max(0, Math.min(1, (val + 1) * 0.5));
        const displayPct = isBipolar
          ? `${val >= 0 ? '+' : ''}${Math.round(val * 100)}%`
          : `${Math.round(norm * 100)}%`;

        let barTop = '0%';
        let barHeight = '0%';
        if (isBipolar) {
          if (val >= 0) {
            barTop = `${(0.5 - val * 0.5) * 100}%`;
            barHeight = `${val * 50}%`;
          } else {
            barTop = '50%';
            barHeight = `${Math.abs(val) * 50}%`;
          }
        } else {
          barTop = `${(1 - norm) * 100}%`;
          barHeight = `${norm * 100}%`;
        }

        return (
          <div
            key={idx}
            className={`flex-1 h-full rounded-sm relative overflow-hidden border transition-colors pointer-events-none ${
              isCurrentPlayStep
                ? 'bg-[#17222b]/90 border-[#5bc0de]'
                : isHovered
                ? 'bg-[#141d25]/85 border-[#3a4b59]'
                : 'bg-[#0e141a]/80 border-[#222d37]'
            }`}
          >
            {/* Center zero reference line for bipolar */}
            {isBipolar && (
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#2c3b47]" />
            )}

            {/* Filled Step Bar */}
            <div
              style={{
                top: barTop,
                height: Math.max(2, parseFloat(barHeight)) ? barHeight : '2px',
                backgroundColor: isCurrentPlayStep
                  ? `${modulator.color}cc`
                  : `${modulator.color}85`,
                boxShadow: isCurrentPlayStep ? `0 0 10px ${modulator.color}66` : 'none',
              }}
              className="absolute inset-x-0"
            />

            {/* Bright Cap Line at actual step value */}
            <div
              style={{
                top: `${(1 - norm) * 100}%`,
                transform: 'translateY(-1px)',
              }}
              className="absolute inset-x-0 h-[2px] bg-white shadow-[0_0_4px_#fff]"
            />

            {/* Step Number at bottom */}
            <span
              className={`absolute bottom-1 inset-x-0 text-center text-[8px] font-mono ${
                isCurrentPlayStep ? 'text-white font-bold' : 'text-[#6c7d8c]'
              }`}
            >
              {idx + 1}
            </span>

            {/* Value Readout Pill when hovered or dragging this bar */}
            {isHovered && (
              <span className="absolute top-1 inset-x-0 text-center text-[8px] font-mono font-bold text-white bg-black/80 py-0.5 mx-0.5 rounded">
                {displayPct}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}