import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { CURSOR_HANDOFF_SPEC } from '@/components/modulation/handoffSpec';

/**
 * Slide-over with the paste-ready Cursor integration spec.
 */
export default function CursorHandoffSpec({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CURSOR_HANDOFF_SPEC);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-[560px] max-w-full h-full bg-[#14191d] border-l border-[#2b353d] flex flex-col"
      >
        <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-[#27313a] atrium-header-grad">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Cursor Handoff Spec
            </div>
            <div className="text-[9px] text-[#7a8b99]">
              Paste into Cursor to integrate this engine into the existing Atrium project.
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="atrium-btn-cyan px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'COPIED' : 'COPY SPEC'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#8ea0ad] hover:text-white p-1 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <pre className="flex-1 overflow-auto px-3 py-2 text-[10px] leading-[1.55] font-mono text-[#b8c7d4] whitespace-pre-wrap select-text">
          {CURSOR_HANDOFF_SPEC}
        </pre>
      </aside>
    </div>
  );
}