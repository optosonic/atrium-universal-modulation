export const CURSOR_HANDOFF_SPEC = `# ATRIUM — UNIVERSAL MODULATION SYSTEM · STRICT 1:1 GITHUB INTEGRATION PROMPT FOR CURSOR

## CRITICAL INSTRUCTION TO CURSOR — READ FIRST
Your previous integration attempt introduced unacceptable visual regressions because you re-implemented or approximated the layout instead of using the exact component code and flex structure from our GitHub repository.

**You MUST follow these rules strictly:**
1. **DO NOT rewrite, simplify, or restyle ANY modulation component.** Copy the files listed in Section 2 **verbatim (1:1)** from the GitHub repository.
2. **Fix all 5 layout/overlay regressions from the broken attempt (detailed in Section 1 below).**

---

## 1. Mandatory Fixes for the 5 Visual Regressions in the AUTO Tab

### Fix #1 — Horizontal Flex Row Split in the \`AUTO\` Panel (Do NOT Stack Vertically!)
In the \`AUTO\` bottom panel (\`AutoBottomPanel.jsx\` or Atrium's equivalent Automation container):
- Row 3 (the main body below the \`AUTO Inst 1\` sub-toolbar) **MUST be a horizontal flex row**:
  \`\`\`jsx
  <div className="flex-1 flex flex-row overflow-hidden min-h-0">
    {/* LEFT COLUMN: Fixed 185px Automation/Mod Mode Sidebar */}
    <div className="w-[185px] border-r border-[#27313a] bg-[#181f25] p-1.5 flex flex-col justify-between shrink-0">
      {/* BLD / SWL / FAD / PLS / RND buttons */}
      {/* VOL | PAN | GESTURE | MOD 4-button grid */}
      {/* + button, VOL readout box, PAN readout box */}
    </div>

    {/* RIGHT CONTENT AREA: Takes remaining width to the right of the 185px sidebar */}
    {autoMode === 'MOD' ? (
      <ModWorkspace ... />
    ) : (
      /* Existing VOL / PAN / GESTURE timeline canvas + timeline zoom controls */
    )}
  </div>
  \`\`\`
- **NEVER** place \`<ModWorkspace />\` below the \`BLD / SWL / FAD / PLS / RND\` column. The 185px sidebar stays on the left, and \`<ModWorkspace />\` fills the remaining width on the right (\`flex-1 grid grid-cols-12\`).
- Ensure Column 1 of \`ModWorkspace\` is never clipped on the left edge (\`ADD MODULATOR SOURCE\` and \`ACTIVE MODULATORS\` must be 100% visible with \`p-2\`).

### Fix #2 — Unmount Timeline Zoom Overlays (\`M\`, \`H 1x\`, \`V 1x\` Sliders) When \`autoMode === 'MOD'\`
- In your screenshot, the automation timeline's floating \`[M] H 1x [horizontal slider]\` and right-edge \`V 1x [vertical slider]\` remained mounted on top of Column 3 (\`ROUTING\` / \`+ Route\`).
- **Rule:** Those timeline zoom controls belong **strictly inside the \`autoMode !== 'MOD'\` branch**. When \`autoMode === 'MOD'\`, they must NOT render at all.

### Fix #3 — Dedicated Scope Header & Footer Bars (NO \`position: absolute\` Text Inside the Waveform Canvas)
- Do **NOT** float \`FREE 1.10 Hz DEPTH 100%\`, \`OUT\`, \`BG TRACES\`, Zoom \`- 1.00x +\`, or the bottom resize handle inside the oscilloscope canvas with \`position: absolute\`.
- Use the **exact** \`ModWorkspace.jsx\` structure from our GitHub repo:
  1. **Top Scope Header Bar** (\`div.h-6.px-2.bg-[#0c1116].border-b.border-[#1c262e].flex.items-center.justify-between.shrink-0\`) sits **above** the canvas.
  2. **Pure Waveform Canvas Container** (\`ref={scopeWrapRef}\`) sits in the middle with zero overlapping text.
  3. **Bottom Resize Handle Bar** (\`div.h-2.5.bg-[#0c1116].border-t.border-[#1c262e].cursor-row-resize\`) sits **below** the canvas.

### Fix #4 — Remove Stuck \`ASSIGN LFO 1\` Drag Ghost at Bottom-Left
- Do NOT render a persistent \`ASSIGN LFO 1\` element at the bottom-left of the screen.
- In \`ModWorkspace.jsx\`, \`handleDragStart\` creates a temporary offscreen DOM node (\`top: -1000px; left: -1000px\`), passes it to \`e.dataTransfer.setDragImage(badge, 14, 14)\`, and immediately removes it via \`setTimeout(() => badge.remove(), 0)\`.

### Fix #5 — Port the Exact Atrium CSS Utility Classes (\`src/index.css\`)
Copy these exact utility classes into your global stylesheet so every button, header, and LCD readout renders identically to the GitHub prototype:
\`\`\`css
.atrium-panel-grad {
  background: linear-gradient(180deg, #272f36 0%, #1b2126 100%);
}
.atrium-header-grad {
  background: linear-gradient(180deg, #2f3840 0%, #1d2328 50%, #15191d 100%);
}
.atrium-btn-metal {
  background: linear-gradient(180deg, #323b44 0%, #20262c 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 2px rgba(0, 0, 0, 0.6);
}
.atrium-btn-metal:hover {
  background: linear-gradient(180deg, #3b4651 0%, #262d34 100%);
}
.atrium-btn-metal:active {
  background: linear-gradient(180deg, #1b2025 0%, #283037 100%);
}
.atrium-btn-cyan {
  background: linear-gradient(180deg, #67b8d6 0%, #3a89a8 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 8px rgba(79, 195, 247, 0.35);
  color: #0b1318;
}
.atrium-lcd {
  background: linear-gradient(180deg, #070a0c 0%, #0d1317 100%);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.9), 0 1px 0 rgba(255, 255, 255, 0.07);
}
\`\`\`

---

## 2. Files to Copy Verbatim (1:1) from the GitHub Repository

Copy these files directly from the GitHub repo without modifying their JSX structure or Tailwind classes:
1. \`src/lib/modulationEngine.js\` — Complete DSP evaluation engine (\`MODULATOR_TYPES\`, \`DIVISION_BEATS\`, \`valueToNorm\`, \`normToValue\`, \`getStepProgress\`, \`evaluateModulator\`, \`computeParameterLiveState\`).
2. \`src/hooks/useModulationEngine.js\` — Shared ModulationContext provider & hook (\`ModulationEngineProvider\`, \`useModulationEngine\`).
3. \`src/components/atrium/ModWorkspace.jsx\` — 12-column grid (\`col-span-3\` Modulator Library & Active Stack | \`col-span-5\` Top-Justified Oscilloscope, Subtype Pills, Integer Step Counter, & 7-column Parameter Controls | \`col-span-4\` \`ModRoutingMatrix\`).
4. \`src/components/atrium/ModRoutingMatrix.jsx\` — Right-column routing matrix with \`SELECTED TARGET\` inspector, \`COMPACT | EXPANDED\` toggle, \`+ Route\` bar, inline depth slider, live formatted readout, \`INV\` button, and expandable Min/Max/Smooth/Offset row controls.
5. \`src/components/atrium/StepSequencerOverlay.jsx\` — Interactive 2..32 step bar painter with continuous multi-bar drag interpolation and hover percentage pills.
6. \`src/components/atrium/ParameterLearnPopup.jsx\` — Centered \`LEARN <ParamName>\` modal with \`MIDI | OSC | MOD\` tabs.
7. \`src/components/atrium/AtriumKnob.jsx\` — Rotary knob with SVG modulation range arc, live value dot, drag-and-drop target highlight, and click-to-open \`MIDI | OSC | MOD\` popup.
8. \`src/components/atrium/AutoBottomPanel.jsx\` — Reference implementation of the exact 265px bottom \`AUTO\` panel showing how the 185px left sidebar and \`<ModWorkspace />\` sit side-by-side.

---

## 3. Exact Props Wiring Inside \`AutoBottomPanel.jsx\`

Render \`ModWorkspace\` inside the right pane of the \`AUTO\` split body with these exact props:
\`\`\`jsx
<ModWorkspace
  modulators={modulators}
  selectedModId={selectedModId}
  onSelectMod={onSelectMod}
  onCreateModulator={onCreateModulator}
  onUpdateModulator={onUpdateModulator}
  onDeleteModulator={onDeleteModulator}
  assignments={assignments}
  parameters={parameters}
  liveStates={liveStates}
  onAddAssignment={onAddAssignment}
  onUpdateAssignment={onUpdateAssignment}
  onRemoveAssignment={onRemoveAssignment}
  onOpenLearnPopup={onOpenLearnPopup}
  simTime={simTime}
  bpm={bpm}
  showTargetInspector={true}
/>
\`\`\`

---

## 4. Visual Verification Checklist Before Completing
- [ ] The \`BLD / SWL / FAD / PLS / RND\` + \`VOL | PAN | GESTURE | MOD\` column is a \`185px\` left sidebar, and \`ModWorkspace\` sits **to its right** (never below it).
- [ ] No \`M\`, \`H 1x\`, or \`V 1x\` timeline sliders overlap the \`ROUTING\` header or \`+ Route\` button when \`MOD\` is active.
- [ ] The oscilloscope readout (\`FREE 0.85 Hz · DEPTH 100% · OUT +0.42\`, \`BG TRACES\`, \`- 1.00x +\`) sits cleanly in its dedicated top header bar above the canvas, never colliding with the waveform.
- [ ] Column 1 (\`ADD MODULATOR SOURCE\` and \`ACTIVE MODULATORS\`) is not clipped on the left edge, and no stray \`ASSIGN LFO 1\` box appears at the bottom-left.
`;