import { motion } from 'framer-motion';

export default function DefuzzView({ preset, pipeline, currentStep }) {
  const activeRules = pipeline.result.details.filter(d => d.firingStrength > 0);
  const { result } = pipeline;

  if (currentStep === 3) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {activeRules.map((d, i) => (
          <motion.div key={d.ruleIndex}
            className="rounded-md p-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: `rgba(79,184,196,${0.03 + d.firingStrength * 0.05})`, border: `1px solid rgba(79,184,196,${0.08 + d.firingStrength * 0.1})` }}>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>R{d.ruleIndex + 1}</span>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{d.antecedents.join(' ∧ ')}</span>
            </div>
            <div className="space-y-1.5 text-[10px]">
              <R label="Weight (wᵢ)" val={d.firingStrength.toFixed(4)} c="var(--accent)" />
              <R label="Output (zᵢ)" val={`${d.ruleOutput}${preset.output.unit}`} c="var(--purple)" />
              <div style={{ height: 1, background: 'var(--border)' }} />
              <R label="wᵢ × zᵢ" val={d.contribution.toFixed(4)} c="var(--green)" bold />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div>
        {/* Formula */}
        <div className="text-center py-3 mb-4 rounded-md" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
          <div className="text-[9px] mb-1" style={{ color: 'var(--text-muted)' }}>Weighted Average Formula</div>
          <div className="font-mono text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            z* = Σ(w<sub>i</sub> × z<sub>i</sub>) / Σ(w<sub>i</sub>)
          </div>
        </div>

        {/* Numerator */}
        <div className="mb-3">
          <div className="text-[9px] font-bold mb-1.5" style={{ color: 'var(--accent-dim)' }}>Numerator: Σ(wᵢ × zᵢ)</div>
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono rounded-md px-3 py-2"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            {activeRules.map((d, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: 'var(--text-muted)' }}> + </span>}
                <span style={{ color: 'var(--accent)' }}>{d.firingStrength.toFixed(3)}</span>
                <span style={{ color: 'var(--text-muted)' }}>·</span>
                <span style={{ color: 'var(--purple)' }}>{d.ruleOutput}</span>
              </span>
            ))}
            <span style={{ color: 'var(--text-muted)' }}> = </span>
            <span className="font-bold" style={{ color: 'var(--green)' }}>{result.numerator.toFixed(4)}</span>
          </div>
        </div>

        {/* Denominator */}
        <div className="mb-5">
          <div className="text-[9px] font-bold mb-1.5" style={{ color: 'var(--accent-dim)' }}>Denominator: Σ(wᵢ)</div>
          <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono rounded-md px-3 py-2"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            {activeRules.map((d, i) => (
              <span key={i}>
                {i > 0 && <span style={{ color: 'var(--text-muted)' }}> + </span>}
                <span style={{ color: 'var(--accent)' }}>{d.firingStrength.toFixed(3)}</span>
              </span>
            ))}
            <span style={{ color: 'var(--text-muted)' }}> = </span>
            <span className="font-bold" style={{ color: 'var(--green)' }}>{result.denominator.toFixed(4)}</span>
          </div>
        </div>

        {/* Result */}
        <div className="text-center py-5 rounded-md" style={{ background: 'rgba(126,196,155,0.05)', border: '1px solid rgba(126,196,155,0.12)' }}>
          <div className="text-[9px] mb-1" style={{ color: 'var(--text-muted)' }}>Final Output</div>
          <div className="font-mono text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            {result.numerator.toFixed(4)} / {result.denominator.toFixed(4)}
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold font-mono" style={{ color: 'var(--green)' }}>{result.output.toFixed(2)}</span>
            <span className="text-base" style={{ color: 'var(--text-muted)' }}>{preset.output.unit}</span>
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{preset.output.name}</div>
        </div>

        {/* Bar chart */}
        <div className="mt-4">
          <div className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Rule Contributions</div>
          <div className="space-y-1">
            {activeRules.map((d, i) => {
              const max = Math.max(...activeRules.map(r => r.contribution));
              const pct = max > 0 ? (d.contribution / max) * 100 : 0;
              return (
                <div key={d.ruleIndex} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono w-5" style={{ color: 'var(--text-muted)' }}>R{d.ruleIndex + 1}</span>
                  <div className="flex-1 h-3.5 rounded-sm overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                    <motion.div className="h-full rounded-sm flex items-center px-1.5"
                      style={{ background: 'linear-gradient(90deg, rgba(79,184,196,0.25), rgba(155,142,196,0.15))' }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}>
                      <span className="text-[7px] font-mono" style={{ color: 'var(--text-secondary)' }}>{d.contribution.toFixed(2)}</span>
                    </motion.div>
                  </div>
                  <span className="text-[8px] font-mono w-8 text-right" style={{ color: 'var(--text-muted)' }}>{d.ruleOutput}{preset.output.unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function R({ label, val, c, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold' : ''}`} style={{ color: c }}>{val}</span>
    </div>
  );
}
