import { motion } from 'framer-motion';

export default function DefuzzView({ preset, pipeline, currentStep }) {
  const active = pipeline.result.details.filter(d => d.firingStrength > 0);
  const { result } = pipeline;

  /* ── Step 3: Active Rule Cards ── */
  if (currentStep === 3) return (
    <div className="grid grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>
      {active.map((d, i) => (
        <motion.div key={d.ruleIndex}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * .04 }}
          className="p-4" style={{ background: 'var(--bg-1)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] font-bold tracking-wider px-2 py-0.5"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
              R{d.ruleIndex + 1}
            </span>
            <span className="font-mono text-[9px]" style={{ color: 'var(--t3)' }}>
              {d.antecedents.join(' ∧ ')}
            </span>
          </div>
          <div className="space-y-2 font-mono text-[11px]">
            <Row l="Weight (wᵢ)" v={d.firingStrength.toFixed(4)} c="var(--accent)" />
            <Row l="Output (zᵢ)" v={`${d.ruleOutput}${preset.output.unit}`} c="var(--purple)" />
            <div style={{ height: 1, background: 'var(--border)' }} />
            <Row l="wᵢ × zᵢ" v={d.contribution.toFixed(4)} c="var(--t1)" bold />
          </div>
        </motion.div>
      ))}
    </div>
  );

  /* ── Step 4: Full Defuzzification ── */
  if (currentStep === 4) return (
    <div>
      {/* Formula */}
      <div className="text-center py-5 mb-6"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        <div className="font-mono text-[9px] tracking-[0.14em] uppercase mb-2" style={{ color: 'var(--t3)' }}>
          Weighted Average Formula
        </div>
        <div className="font-mono text-[16px] font-semibold" style={{ color: 'var(--t2)' }}>
          z* = Σ(w<sub>i</sub> × z<sub>i</sub>) / Σ(w<sub>i</sub>)
        </div>
      </div>

      {/* Numerator */}
      <CalcRow
        label="Numerator: Σ(wᵢ × zᵢ)"
        parts={active.map(d => ({ a: d.firingStrength.toFixed(3), b: String(d.ruleOutput) }))}
        result={result.numerator.toFixed(4)}
        op="×"
      />

      {/* Denominator */}
      <div className="mb-6">
        <div className="font-mono text-[9px] tracking-[0.1em] uppercase font-bold mb-2"
          style={{ color: 'var(--accent-dim)' }}>Denominator: Σ(wᵢ)</div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] px-4 py-3"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          {active.map((d, i) => (
            <span key={i}>
              {i > 0 && <span style={{ color: 'var(--t4)' }}> + </span>}
              <span style={{ color: 'var(--accent)' }}>{d.firingStrength.toFixed(3)}</span>
            </span>
          ))}
          <span style={{ color: 'var(--t4)' }}> = </span>
          <span className="font-bold" style={{ color: 'var(--t1)' }}>{result.denominator.toFixed(4)}</span>
        </div>
      </div>

      {/* Final Result */}
      <motion.div className="text-center py-8 relative overflow-hidden"
        initial={{ scale: .97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: .15 }}
        style={{ background: 'var(--bg-2)', border: '1px solid var(--accent-border)' }}>
        <div className="font-mono text-[9px] tracking-[0.14em] uppercase mb-1.5"
          style={{ color: 'var(--t3)' }}>Final Output</div>
        <div className="font-mono text-[11px] mb-2" style={{ color: 'var(--t4)' }}>
          {result.numerator.toFixed(4)} / {result.denominator.toFixed(4)}
        </div>
        <span className="text-[42px] font-bold font-mono"
          style={{ color: 'var(--accent-bright)' }}>
          {result.output.toFixed(2)}
        </span>
        <span className="text-lg ml-1 font-mono" style={{ color: 'var(--t3)' }}>
          {preset.output.unit}
        </span>
        <div className="font-mono text-[11px] mt-1" style={{ color: 'var(--t4)' }}>
          {preset.output.name}
        </div>
      </motion.div>

      {/* Contribution Bars */}
      <div className="mt-6">
        <div className="font-mono text-[9px] tracking-[0.14em] uppercase font-bold mb-3"
          style={{ color: 'var(--t4)' }}>Rule Contributions</div>
        {active.map((d, i) => {
          const mx = Math.max(...active.map(r => r.contribution));
          return (
            <div key={d.ruleIndex} className="flex items-center gap-3 mb-1.5">
              <span className="font-mono text-[9px] w-6" style={{ color: 'var(--t4)' }}>
                R{d.ruleIndex + 1}
              </span>
              <div className="flex-1 h-4 overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                <motion.div className="h-full px-2 flex items-center"
                  style={{ background: 'rgba(201,65,88,0.15)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${mx > 0 ? (d.contribution / mx) * 100 : 0}%` }}
                  transition={{ delay: i * .06, duration: .35 }}>
                  <span className="font-mono text-[8px]" style={{ color: 'var(--accent)' }}>
                    {d.contribution.toFixed(2)}
                  </span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return null;
}

function CalcRow({ label, parts, result, op }) {
  return (
    <div className="mb-5">
      <div className="font-mono text-[9px] tracking-[0.1em] uppercase font-bold mb-2"
        style={{ color: 'var(--accent-dim)' }}>{label}</div>
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] px-4 py-3"
        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        {parts.map((p, i) => (
          <span key={i}>
            {i > 0 && <span style={{ color: 'var(--t4)' }}> + </span>}
            <span style={{ color: 'var(--accent)' }}>{p.a}</span>
            <span style={{ color: 'var(--t4)' }}>{op}</span>
            <span style={{ color: 'var(--purple)' }}>{p.b}</span>
          </span>
        ))}
        <span style={{ color: 'var(--t4)' }}> = </span>
        <span className="font-bold" style={{ color: 'var(--t1)' }}>{result}</span>
      </div>
    </div>
  );
}

function Row({ l, v, c, bold }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--t3)' }}>{l}</span>
      <span className={bold ? 'font-bold' : ''} style={{ color: c }}>{v}</span>
    </div>
  );
}
