import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ExplanationPanel({ stepInfo, currentStep, handCalc, preset, pipeline }) {
  const [showCalc, setShowCalc] = useState(false);
  const info = stepInfo[currentStep];

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 py-2 text-[9px] uppercase tracking-[0.12em] font-bold"
        style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
        Explain
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>

            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Step {currentStep + 1} of {stepInfo.length}
            </div>

            <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{info.title}</h3>

            <p className="text-[12px] leading-[1.7] mb-4" style={{ color: 'var(--text-secondary)' }}>{info.description}</p>

            {info.formula && (
              <div className="rounded-md p-3 mb-4 font-mono text-[11px]"
                style={{ background: 'rgba(155,142,196,0.06)', border: '1px solid rgba(155,142,196,0.12)', color: 'var(--purple)' }}>
                <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: 'rgba(155,142,196,0.5)' }}>Formula</div>
                {info.formula}
              </div>
            )}

            {info.highlight && (
              <div className="rounded-md p-3 mb-4 text-[11px] leading-relaxed"
                style={{ background: 'var(--accent-bg)', border: '1px solid rgba(79,184,196,0.12)', color: 'var(--accent)' }}>
                <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: 'var(--accent-dim)' }}>💡 Tip</div>
                {info.highlight}
              </div>
            )}

            {/* Final output */}
            {currentStep >= 4 && pipeline && (
              <div className="rounded-md p-4 mb-4"
                style={{ background: 'rgba(126,196,155,0.06)', border: '1px solid rgba(126,196,155,0.12)' }}>
                <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: 'var(--green)' }}>Final Output</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono" style={{ color: 'var(--green)' }}>
                    {pipeline.result.output.toFixed(2)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{preset.output.unit}</span>
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{preset.output.name}</div>
              </div>
            )}

            {/* Active rules */}
            {currentStep >= 2 && pipeline && (
              <div className="mb-4">
                <div className="text-[9px] uppercase tracking-wider mb-2 font-bold" style={{ color: 'var(--text-muted)' }}>Active Rules</div>
                <div className="space-y-1">
                  {pipeline.evaluatedRules
                    .map((r, i) => ({ ...r, oi: i }))
                    .filter(r => r.firingStrength > 0)
                    .map(r => (
                      <div key={r.oi} className="flex items-center gap-2 text-[10px] rounded px-2 py-1"
                        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>R{r.oi + 1}</span>
                        <span className="flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{r.antecedents.join(' ∧ ')}</span>
                        <span className="font-mono font-bold" style={{ color: 'var(--accent)' }}>{r.firingStrength.toFixed(3)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Hand Calc toggle ── */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setShowCalc(!showCalc)}
          className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-medium transition-colors"
          style={{ color: showCalc ? 'var(--accent)' : 'var(--text-muted)', background: showCalc ? 'var(--accent-bg)' : 'transparent' }}>
          <span>📐 Hand Calculation Verification</span>
          <span style={{ transform: showCalc ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
        </button>
        <AnimatePresence>
          {showCalc && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-4 pb-3 max-h-56 overflow-y-auto" style={{ borderTop: '1px solid var(--border)' }}>
                {handCalc.map((line, i) => <CalcLine key={i} line={line} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CalcLine({ line }) {
  const styles = {
    header: { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 },
    subheader: { fontSize: 10, fontWeight: 600, color: 'var(--accent)', marginTop: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' },
    label: { fontSize: 10, fontWeight: 500, color: 'var(--text-secondary)', marginTop: 6, marginBottom: 2 },
    calc: { fontSize: 10, fontFamily: 'var(--font-mono)', color: line.highlight ? 'var(--accent)' : 'var(--text-muted)', lineHeight: 1.6 },
    formula: { fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--purple)', marginTop: 4 },
    result: { fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)', marginTop: 4 },
    muted: { fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 },
    divider: {},
  };
  if (line.type === 'divider') return <div className="my-2" style={{ height: 1, background: 'var(--border)' }} />;
  return <div style={styles[line.type] || styles.calc}>{line.text}</div>;
}
