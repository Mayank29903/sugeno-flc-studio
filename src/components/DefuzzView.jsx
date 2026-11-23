import { motion } from 'framer-motion';

export default function DefuzzView({ preset, pipeline, currentStep }) {
  const active = pipeline.result.details.filter(d => d.firingStrength > 0);
  const { result } = pipeline;

  if (currentStep === 3) return (
    <div className="grid grid-cols-2 gap-3">
      {active.map((d, i) => (
        <motion.div key={d.ruleIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * .05 }}
          className="rounded-xl p-4" style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md"
              style={{ background: 'var(--g-bg)', color: 'var(--g400)', border: '1px solid var(--g-border)' }}>R{d.ruleIndex + 1}</span>
            <span className="text-[9px]" style={{ color: 'var(--t3)' }}>{d.antecedents.join(' ∧ ')}</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <Row l="Weight (wᵢ)" v={d.firingStrength.toFixed(4)} c="var(--g400)" />
            <Row l="Output (zᵢ)" v={`${d.ruleOutput}${preset.output.unit}`} c="#a78bfa" />
            <div style={{ height: 1, background: 'var(--border)' }} />
            <Row l="wᵢ × zᵢ" v={d.contribution.toFixed(4)} c="var(--g300)" bold />
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (currentStep === 4) return (
    <div>
      {/* Formula */}
      <div className="text-center py-4 mb-5 rounded-xl" style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}>
        <div className="text-[9px] mb-1.5" style={{ color: 'var(--t3)' }}>Weighted Average Formula</div>
        <div className="font-mono text-[15px] font-semibold" style={{ color: 'var(--t2)' }}>
          z* = Σ(w<sub>i</sub> × z<sub>i</sub>) / Σ(w<sub>i</sub>)
        </div>
      </div>

      {/* Numerator */}
      <CalcRow label="Numerator: Σ(wᵢ × zᵢ)" parts={active.map(d => ({ a: d.firingStrength.toFixed(3), b: String(d.ruleOutput) }))} result={result.numerator.toFixed(4)} op="×" />

      {/* Denominator */}
      <div className="mb-6">
        <div className="text-[9px] font-bold mb-2" style={{ color: 'var(--g700)' }}>Denominator: Σ(wᵢ)</div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] rounded-xl px-4 py-3"
          style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}>
          {active.map((d, i) => (
            <span key={i}>
              {i > 0 && <span style={{ color: 'var(--t4)' }}> + </span>}
              <span style={{ color: 'var(--g400)' }}>{d.firingStrength.toFixed(3)}</span>
            </span>
          ))}
          <span style={{ color: 'var(--t4)' }}> = </span>
          <span className="font-bold" style={{ color: 'var(--g300)' }}>{result.denominator.toFixed(4)}</span>
        </div>
      </div>

      {/* Final */}
      <motion.div className="text-center py-7 rounded-2xl relative overflow-hidden"
        initial={{ scale: .97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .2 }}
        style={{ background: 'linear-gradient(145deg, rgba(34,197,94,.06), rgba(34,197,94,.02))', border: '1px solid var(--g-border)' }}>
        <div className="text-[9px] mb-1" style={{ color: 'var(--t3)' }}>Final Output</div>
        <div className="font-mono text-xs mb-2" style={{ color: 'var(--t4)' }}>{result.numerator.toFixed(4)} / {result.denominator.toFixed(4)}</div>
        <span className="text-[42px] font-bold font-mono" style={{ color: 'var(--g400)', textShadow: '0 0 40px var(--g-glow)' }}>
          {result.output.toFixed(2)}
        </span>
        <span className="text-lg ml-1" style={{ color: 'var(--t3)' }}>{preset.output.unit}</span>
        <div className="text-[11px] mt-1" style={{ color: 'var(--t4)' }}>{preset.output.name}</div>
      </motion.div>

      {/* Bars */}
      <div className="mt-5">
        <div className="text-[9px] font-bold uppercase tracking-widest mb-2.5" style={{ color: 'var(--t4)' }}>Contributions</div>
        {active.map((d, i) => {
          const mx = Math.max(...active.map(r => r.contribution));
          return (
            <div key={d.ruleIndex} className="flex items-center gap-2.5 mb-1.5">
              <span className="text-[9px] font-mono w-6" style={{ color: 'var(--t4)' }}>R{d.ruleIndex + 1}</span>
              <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                <motion.div className="h-full rounded-md px-2 flex items-center"
                  style={{ background: 'linear-gradient(90deg, rgba(34,197,94,.22), rgba(34,197,94,.08))' }}
                  initial={{ width: 0 }} animate={{ width: `${mx > 0 ? (d.contribution / mx) * 100 : 0}%` }}
                  transition={{ delay: i * .07, duration: .4 }}>
                  <span className="text-[8px] font-mono" style={{ color: 'var(--g300)' }}>{d.contribution.toFixed(2)}</span>
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
    <div className="mb-4">
      <div className="text-[9px] font-bold mb-2" style={{ color: 'var(--g700)' }}>{label}</div>
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] rounded-xl px-4 py-3"
        style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)' }}>
        {parts.map((p, i) => (
          <span key={i}>
            {i > 0 && <span style={{ color: 'var(--t4)' }}> + </span>}
            <span style={{ color: 'var(--g400)' }}>{p.a}</span>
            <span style={{ color: 'var(--t4)' }}>{op}</span>
            <span style={{ color: '#a78bfa' }}>{p.b}</span>
          </span>
        ))}
        <span style={{ color: 'var(--t4)' }}> = </span>
        <span className="font-bold" style={{ color: 'var(--g300)' }}>{result}</span>
      </div>
    </div>
  );
}

function Row({ l, v, c, bold }) {
  return <div className="flex justify-between"><span style={{ color: 'var(--t3)' }}>{l}</span><span className={`font-mono ${bold ? 'font-bold' : ''}`} style={{ color: c }}>{v}</span></div>;
}
