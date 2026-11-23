import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFuzzyController } from './hooks/useFuzzyController';
import { presets, STEP_INFO } from './data/presets';
import MembershipChart from './components/MembershipChart';
import RuleMatrix from './components/RuleMatrix';
import InputPanel from './components/InputPanel';
import Controls from './components/Controls';
import ExplanationPanel from './components/ExplanationPanel';
import DefuzzView from './components/DefuzzView';

export default function App() {
  const ctrl = useFuzzyController(presets[0]);
  const {
    preset, changePreset, inputs, setInput,
    currentStep, goToStep, isPlaying, speed, setSpeed,
    pipeline, handCalc, play, pause, stepForward, stepBack, reset,
  } = ctrl;

  const [leftOpen, setLeftOpen] = useState(true);

  return (
    <div className="w-screen h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* ─── TOP BAR ─── */}
      <header
        className="h-10 flex items-center justify-between px-4 flex-shrink-0"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="w-6 h-6 flex items-center justify-center rounded"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {leftOpen
                ? <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
              }
            </svg>
          </button>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Sugeno FLC Studio</span>
          <span className="text-[10px] tracking-widest uppercase hidden lg:inline" style={{ color: 'var(--text-muted)' }}>
            Takagi-Sugeno Fuzzy Logic Controller
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ background: 'rgba(155,142,196,0.1)', color: 'var(--purple)', border: '1px solid rgba(155,142,196,0.15)' }}>
            Zero-Order Sugeno
          </span>
        </div>
      </header>

      {/* ─── BODY: 3-column grid, flush panels ─── */}
      <div className="flex-1 flex min-h-0">

        {/* ═══ LEFT: Inputs ═══ */}
        {leftOpen && (
          <aside
            className="flex-shrink-0 overflow-y-auto"
            style={{ width: 230, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
          >
            <InputPanel
              preset={preset}
              inputs={inputs}
              onInputChange={setInput}
              presets={presets}
              onPresetChange={changePreset}
            />
          </aside>
        )}

        {/* ═══ CENTER: Visualization ═══ */}
        <main className="flex-1 min-w-0 flex flex-col" style={{ background: 'var(--bg-base)' }}>
          {/* Center content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${preset.id}-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* ── STEP 0 & 1: Membership Function Charts ── */}
                {currentStep <= 1 && (
                  <div>
                    {preset.inputs.map((inp, idx) => (
                      <section key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <PanelHeader>
                          <span style={{ color: 'var(--text-primary)' }}>{inp.name}</span>
                          <span className="ml-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            Range [{inp.range[0]}, {inp.range[1]}]
                          </span>
                          {currentStep === 1 && (
                            <span className="ml-auto text-[11px] font-mono font-bold" style={{ color: 'var(--accent)' }}>
                              x = {inputs[idx].toFixed(1)}
                            </span>
                          )}
                        </PanelHeader>
                        <div className="p-4 flex justify-center">
                          <MembershipChart
                            variable={inp}
                            inputValue={inputs[idx]}
                            fuzzified={pipeline.fuzzified[idx]}
                            showIndicator={currentStep >= 1}
                            chartId={`main-${idx}`}
                          />
                        </div>
                        {currentStep === 1 && (
                          <div className="px-4 pb-4 flex gap-2">
                            {pipeline.fuzzified[idx].map((f, i) => (
                              <div key={i} className="flex-1 rounded-md px-2 py-1.5 text-center"
                                style={{
                                  background: f.degree > 0 ? `${f.color}12` : 'var(--bg-raised)',
                                  border: `1px solid ${f.degree > 0 ? `${f.color}25` : 'var(--border)'}`,
                                }}>
                                <div className="text-[9px] font-semibold" style={{ color: f.degree > 0 ? f.color : 'var(--text-muted)' }}>
                                  μ<sub>{f.name}</sub>
                                </div>
                                <div className="text-xs font-bold font-mono" style={{ color: f.degree > 0 ? 'var(--text-primary)' : 'var(--border-light)' }}>
                                  {f.degree.toFixed(4)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    ))}
                    {currentStep === 0 && (
                      <section>
                        <PanelHeader>
                          <span style={{ color: 'var(--text-primary)' }}>Sugeno Method Pipeline</span>
                          <span className="ml-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>Click any step to jump</span>
                        </PanelHeader>
                        <div className="p-4 grid grid-cols-5 gap-2">
                          {STEP_INFO.map((s, i) => (
                            <button key={i} onClick={() => goToStep(i)}
                              className="rounded-md p-3 text-center transition-colors"
                              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>
                              <div className="text-sm mb-1">{s.icon}</div>
                              <div className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* ── STEP 2: Rule Evaluation ── */}
                {currentStep === 2 && (
                  <div>
                    {/* Compact MF refs */}
                    <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
                      {preset.inputs.map((inp, idx) => (
                        <div key={idx} className="flex-1" style={{ borderRight: idx < preset.inputs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                          <PanelHeader compact>
                            <span>{inp.short} = {inputs[idx].toFixed(1)}</span>
                          </PanelHeader>
                          <div className="p-2 flex justify-center">
                            <MembershipChart
                              variable={inp}
                              inputValue={inputs[idx]}
                              fuzzified={pipeline.fuzzified[idx]}
                              showIndicator
                              chartId={`rule-${idx}`}
                              compact
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Rule matrix */}
                    <section>
                      <PanelHeader>
                        <span style={{ color: 'var(--text-primary)' }}>Rule Base</span>
                        <span className="ml-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {preset.inputs[0].short} × {preset.inputs[1].short} → {preset.output.name}
                        </span>
                      </PanelHeader>
                      <div className="p-4">
                        <RuleMatrix preset={preset} evaluatedRules={pipeline.evaluatedRules} currentStep={currentStep} />
                      </div>
                    </section>
                  </div>
                )}

                {/* ── STEP 3: Consequent Computation ── */}
                {currentStep === 3 && (
                  <section>
                    <PanelHeader>
                      <span style={{ color: 'var(--text-primary)' }}>Active Rule Outputs</span>
                      <span className="ml-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>Rules with non-zero firing strength</span>
                    </PanelHeader>
                    <div className="p-4">
                      <DefuzzView preset={preset} pipeline={pipeline} currentStep={3} />
                    </div>
                  </section>
                )}

                {/* ── STEP 4: Defuzzification ── */}
                {currentStep === 4 && (
                  <div>
                    <section style={{ borderBottom: '1px solid var(--border)' }}>
                      <PanelHeader compact>
                        <span>Active Rule Outputs</span>
                      </PanelHeader>
                      <div className="p-3">
                        <DefuzzView preset={preset} pipeline={pipeline} currentStep={3} />
                      </div>
                    </section>
                    <section>
                      <PanelHeader>
                        <span style={{ color: 'var(--text-primary)' }}>Weighted Average Defuzzification</span>
                      </PanelHeader>
                      <div className="p-4">
                        <DefuzzView preset={preset} pipeline={pipeline} currentStep={4} />
                      </div>
                    </section>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* ═══ RIGHT: Explanation ═══ */}
        <aside
          className="flex-shrink-0 overflow-y-auto"
          style={{ width: 280, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)' }}
        >
          <ExplanationPanel
            stepInfo={STEP_INFO}
            currentStep={currentStep}
            handCalc={handCalc}
            preset={preset}
            pipeline={pipeline}
          />
        </aside>
      </div>

      {/* ─── BOTTOM CONTROLS ─── */}
      <footer
        className="h-11 flex-shrink-0"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}
      >
        <Controls
          currentStep={currentStep} isPlaying={isPlaying} speed={speed}
          onPlay={play} onPause={pause} onStepForward={stepForward} onStepBack={stepBack}
          onReset={reset} onGoToStep={goToStep} onSpeedChange={setSpeed} stepInfo={STEP_INFO}
        />
      </footer>
    </div>
  );
}

function PanelHeader({ compact, children }) {
  return (
    <div
      className={`flex items-center ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-[13px]'} font-semibold`}
      style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}
    >
      {children}
    </div>
  );
}
