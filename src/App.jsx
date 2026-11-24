import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFuzzyController } from './hooks/useFuzzyController';
import { presets } from './data/presets';
import MembershipChart from './components/MembershipChart';
import OutputSurface from './components/OutputSurface';

/* ═══════════════════════════════════════════════════════════
   Sugeno FLC Studio — Light Theme Dashboard
   Clean, well-spaced, educational layout
   ═══════════════════════════════════════════════════════════ */

export default function App() {
  const {
    preset, changePreset, inputs, setInput,
    pipeline, handCalc,
  } = useFuzzyController(presets[0]);

  const [showCalc, setShowCalc] = useState(false);

  const output = pipeline.result.output;
  const activeRules = pipeline.result.details.filter(d => d.firingStrength > 0);
  const sumW = activeRules.reduce((s, r) => s + r.firingStrength, 0);
  const sumWZ = activeRules.reduce((s, r) => s + r.contribution, 0);

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>

      {/* ═══════════════════ TOP BAR ═══════════════════ */}
      <header className="sticky top-0 z-50 card" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="flex items-center justify-between px-6 h-12">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-bold tracking-tight" style={{ color: 'var(--accent)' }}>
              SUGENO FLC
            </span>
            <span className="text-[12px]" style={{ color: 'var(--t4)' }}>|</span>
            <span className="text-[12px]" style={{ color: 'var(--t3)' }}>
              Takagi-Sugeno Fuzzy Logic Controller
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[12px] font-semibold px-3 py-1 rounded-md"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              z* = {output.toFixed(2)}{preset.output.unit}
            </div>
            <span className="font-mono text-[10px] px-2 py-1 rounded"
              style={{ background: 'var(--bg-inset)', color: 'var(--t3)', border: '1px solid var(--border)' }}>
              Zero-Order
            </span>
          </div>
        </div>
      </header>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <main className="max-w-[1280px] mx-auto px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── HERO: Title + Presets ── */}
        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '28px 32px' }}>
              <h1 className="text-[26px] font-bold leading-tight tracking-tight mb-2">
                <span style={{ color: 'var(--t1)' }}>Takagi-Sugeno Continuous </span>
                <span style={{ color: 'var(--accent)' }}>Affine Synthesizer</span>
              </h1>
              <p className="text-[13px] leading-[1.8] max-w-xl" style={{ color: 'var(--t3)' }}>
                Continuous zero-order hyper-surface formulation replacing Riemann numerical
                centroid integration with instantaneous rational polynomial hyperplane projection.
              </p>
            </div>
            {/* Preset Selection */}
            <div style={{ borderLeft: '1px solid var(--border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--t4)' }}>
                Select Problem
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {presets.map((p) => {
                  const sel = preset.id === p.id;
                  return (
                    <button key={p.id} onClick={() => changePreset(p)}
                      className="cursor-pointer transition-all"
                      style={{
                        padding: '10px 18px',
                        borderRadius: 8,
                        border: sel ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: sel ? 'var(--accent-light)' : 'var(--bg-inset)',
                        textAlign: 'center',
                        minWidth: 100,
                      }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
                      <div className="font-mono text-[10px] font-semibold"
                        style={{ color: sel ? 'var(--accent)' : 'var(--t2)' }}>
                        {p.name.split(' ')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3D RESPONSE SURFACE ── */}
        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--accent)' }}>
                Response Surface
              </span>
              <span className="text-[11px] ml-3" style={{ color: 'var(--t4)' }}>
                z = f(x₁, x₂)  |  Range: [{preset.output.range[0]}, {preset.output.range[1]}]{preset.output.unit}
              </span>
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--t3)' }}>
              {preset.inputs[0].short} × {preset.inputs[1].short} → {preset.output.name}
            </div>
          </div>
          <div style={{ background: 'var(--bg-inset)', padding: '8px 0' }}>
            <OutputSurface preset={preset} inputs={inputs} output={output} />
          </div>
        </section>

        {/* ── INPUT VARIABLES (side by side) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {preset.inputs.map((inp, idx) => (
            <InputCard
              key={idx}
              inp={inp}
              idx={idx}
              value={inputs[idx]}
              fuzzified={pipeline.fuzzified[idx]}
              onInput={setInput}
            />
          ))}
        </div>

        {/* ── OUTPUT + RULES (side by side) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Output Gauge */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <div className="font-mono text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--accent)' }}>
                Defuzzified Output
              </div>
              <div className="text-[14px] font-semibold mt-1" style={{ color: 'var(--t1)' }}>
                {preset.output.name}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 20px' }}>
              <Gauge
                value={output}
                min={preset.output.range[0]}
                max={preset.output.range[1]}
                unit={preset.output.unit}
              />
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-inset)' }}>
              <p className="text-[11px] leading-[1.7]" style={{ color: 'var(--t3)' }}>
                The final crisp output is computed as a weighted average of all active rule outputs.
                No centroid integration or clipping is needed.
              </p>
              <div style={{ display: 'flex', gap: 24, marginTop: 10 }}>
                <Stat label="Active Rules" value={`${activeRules.length} / ${pipeline.evaluatedRules.length}`} />
                <Stat label="Σ(wᵢ)" value={sumW.toFixed(4)} />
                <Stat label="Method" value="Weighted Avg" />
              </div>
            </div>
          </div>

          {/* Rule Matrix */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--accent)' }}>
                  Rule Activation
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--t3)' }}>
                  {activeRules.length} of {pipeline.evaluatedRules.length} rules active
                </div>
              </div>
              <div className="font-mono text-[9px] px-2 py-1 rounded"
                style={{ background: 'var(--bg-inset)', color: 'var(--t4)', border: '1px solid var(--border)' }}>
                T-norm: min &nbsp; S-norm: max
              </div>
            </div>
            <div style={{ padding: '8px 12px', maxHeight: 340, overflowY: 'auto' }}>
              {pipeline.evaluatedRules.map((rule, ri) => {
                const active = rule.firingStrength > 0;
                return (
                  <div key={ri}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', marginBottom: 2, borderRadius: 6,
                      background: active ? 'var(--accent-bg)' : 'transparent',
                      fontSize: 11, fontFamily: 'var(--font-mono)',
                      color: active ? 'var(--t1)' : 'var(--t4)',
                    }}>
                    <span>
                      <span style={{ fontWeight: 600, color: active ? 'var(--accent)' : 'var(--t4)' }}>R{ri + 1}</span>
                      {': IF '}
                      {preset.inputs.map((inp, ii) =>
                        <span key={ii}>
                          {ii > 0 && ' ∧ '}
                          {inp.short} = <span style={{ fontWeight: 600 }}>{rule.antecedents[ii]}</span>
                        </span>
                      )}
                      {' → z = '}
                      <span style={{ fontWeight: 600 }}>{rule.consequent}</span>
                    </span>
                    <span style={{
                      fontWeight: 700, minWidth: 55, textAlign: 'right',
                      color: active ? 'var(--accent)' : 'var(--t4)',
                    }}>
                      {rule.firingStrength.toFixed(3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── ANALYTICAL REDUCTION ── */}
        <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--accent)' }}>
              Computation Breakdown
            </span>
          </div>
          <div style={{ display: 'flex' }}>
            {/* Left: formulas */}
            <div style={{ flex: 1, padding: 24 }}>
              <div className="font-mono text-[13px] font-semibold mb-4" style={{ color: 'var(--t1)' }}>
                z* = Σ(w<sub>i</sub> × z<sub>i</sub>) / Σ(w<sub>i</sub>)
              </div>
              <div className="font-mono text-[11px] leading-[2.0]" style={{ color: 'var(--t2)' }}>
                {activeRules.map((r, i) => (
                  <div key={i}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>R{r.ruleIndex + 1}</span>
                    {': '}
                    <span>{r.firingStrength.toFixed(4)} × {r.ruleOutput}</span>
                    {' = '}
                    <span style={{ fontWeight: 600 }}>{r.contribution.toFixed(4)}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span>z* = </span>
                  <span style={{ fontWeight: 600 }}>{sumWZ.toFixed(4)}</span>
                  <span> / </span>
                  <span style={{ fontWeight: 600 }}>{sumW.toFixed(4)}</span>
                  <span> = </span>
                  <span className="text-[14px]" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                    {output.toFixed(4)}{preset.output.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: summary stats */}
            <div style={{ width: 220, padding: 24, borderLeft: '1px solid var(--border)', background: 'var(--bg-inset)' }}>
              <div className="font-mono text-[10px] uppercase tracking-wider mb-4" style={{ color: 'var(--t4)' }}>
                Summary
              </div>
              {[
                { label: 'Active Rules', value: `${activeRules.length} of ${pipeline.evaluatedRules.length}` },
                { label: 'Σ(wᵢ)', value: sumW.toFixed(4) },
                { label: 'Σ(wᵢzᵢ)', value: sumWZ.toFixed(4) },
                { label: 'Final Output', value: `${output.toFixed(4)}${preset.output.unit}`, accent: true },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--t4)', marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div className="font-mono text-[13px] font-semibold"
                    style={{ color: item.accent ? 'var(--accent)' : 'var(--t1)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hand calculation toggle */}
          <button onClick={() => setShowCalc(!showCalc)}
            className="cursor-pointer transition-colors"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '10px 20px',
              color: showCalc ? 'var(--accent)' : 'var(--t3)',
              background: showCalc ? 'var(--accent-bg)' : 'var(--bg-inset)',
              borderTop: '1px solid var(--border)',
              fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
              border: 'none', borderTop: '1px solid var(--border)',
            }}>
            <span>✓ Step-by-Step Hand Calculation</span>
            <span style={{ transform: showCalc ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </button>
          {showCalc && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-inset)' }}>
              {handCalc.map((line, i) => <CalcLine key={i} line={line} />)}
            </motion.div>
          )}
        </section>

        {/* ── THEORY CARDS ── */}
        <section>
          <div style={{ marginBottom: 16, padding: '0 4px' }}>
            <h2 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--t1)' }}>
              Key Concepts
            </h2>
            <p className="text-[12px] mt-1" style={{ color: 'var(--t3)' }}>
              Core axioms of the Takagi-Sugeno fuzzy inference system
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {THEORY_CARDS.map((card, i) => (
              <div key={i} className="card" style={{ padding: 24 }}>
                <div className="font-mono text-[9px] tracking-wider uppercase mb-3"
                  style={{ color: 'var(--accent)' }}>
                  {card.cat}
                </div>
                <h3 className="text-[14px] font-bold mb-2" style={{ color: 'var(--t1)' }}>
                  {card.title}
                </h3>
                <p className="text-[11px] leading-[1.75] mb-4" style={{ color: 'var(--t3)' }}>
                  {card.text}
                </p>
                <div className="font-mono text-[10px] px-3 py-1.5 inline-block rounded"
                  style={{ color: 'var(--accent)', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
                  {card.formula}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding: '16px 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p className="font-mono text-[10px]" style={{ color: 'var(--t4)' }}>
            Sugeno FLC Studio — Interactive Takagi-Sugeno Fuzzy Logic Controller — Zero-Order Computation
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ═══════════════════ INPUT CARD ═══════════════════ */

function InputCard({ inp, idx, value, fuzzified, onInput }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--accent)' }}>
            Input Variable {idx + 1}
          </div>
          <div className="text-[15px] font-bold mt-1">{inp.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <input
            type="number"
            min={inp.range[0]}
            max={inp.range[1]}
            step={0.1}
            value={value}
            onChange={e => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onInput(idx, Math.max(inp.range[0], Math.min(inp.range[1], v)));
            }}
            style={{ width: 75, fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}
          />
          <span className="font-mono text-[12px]" style={{ color: 'var(--t4)' }}>
            / {inp.range[1]}{inp.unit}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '8px 12px', background: 'var(--bg-inset)' }}>
        <MembershipChart
          variable={inp} inputValue={value}
          fuzzified={fuzzified}
          showIndicator chartId={`panel-${idx}`} compact
        />
      </div>

      {/* Slider */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <input type="range" min={inp.range[0]} max={inp.range[1]} step={0.01}
          value={value}
          onChange={e => onInput(idx, parseFloat(e.target.value))}
          className="w-full" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="font-mono text-[9px]" style={{ color: 'var(--t4)' }}>{inp.range[0]}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[inp.range[0], (inp.range[0] + inp.range[1]) / 2, inp.range[1]].map((v, i) => (
              <button key={i} onClick={() => onInput(idx, v)}
                className="cursor-pointer transition-colors font-mono text-[9px] px-2 py-0.5 rounded"
                style={{
                  background: Math.abs(value - v) < 0.1 ? 'var(--accent-light)' : 'var(--bg-inset)',
                  color: Math.abs(value - v) < 0.1 ? 'var(--accent)' : 'var(--t4)',
                  border: '1px solid var(--border)',
                }}>
                {i === 0 ? 'Min' : i === 1 ? 'Mid' : 'Max'}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9px]" style={{ color: 'var(--t4)' }}>{inp.range[1]}</span>
        </div>
      </div>

      {/* Degree badges */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 20px 16px', borderTop: '1px solid var(--border)' }}>
        {fuzzified.map((f, fi) => {
          const on = f.degree > 0;
          return (
            <div key={fi} style={{
              flex: 1, padding: '8px 4px', textAlign: 'center', borderRadius: 6,
              background: on ? 'var(--bg-badge)' : 'var(--bg-inset)',
              border: on ? '1px solid var(--accent-border)' : '1px solid var(--border)',
            }}>
              <div className="font-mono text-[8px] uppercase font-bold tracking-wider"
                style={{ color: on ? f.color : 'var(--t4)' }}>{f.name}</div>
              <div className="font-mono text-[13px] font-bold" style={{ marginTop: 2, color: on ? 'var(--t1)' : 'var(--t4)' }}>
                {f.degree.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════ GAUGE ═══════════════════ */

function Gauge({ value, min, max, unit }) {
  const pct = max > min ? (value - min) / (max - min) : 0;
  const sweep = 270;
  const startAngle = (360 - sweep) / 2 + 90;
  const radius = 60;
  const cx = 75, cy = 75;

  const describeArc = (a1deg, a2deg) => {
    const a1 = (a1deg * Math.PI) / 180;
    const a2 = (a2deg * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(a1), y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2), y2 = cy + radius * Math.sin(a2);
    const large = Math.abs(a2deg - a1deg) > 180 ? 1 : 0;
    return `M${x1},${y1} A${radius},${radius} 0 ${large} 1 ${x2},${y2}`;
  };

  return (
    <svg width={150} height={130} viewBox="0 0 150 130">
      <path d={describeArc(startAngle, startAngle + sweep)}
        fill="none" stroke="#e5e7eb" strokeWidth={6} strokeLinecap="round" />
      <path d={describeArc(startAngle, startAngle + pct * sweep)}
        fill="none" stroke="var(--accent)" strokeWidth={6} strokeLinecap="round" />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--t1)"
        fontSize={26} fontWeight={700} fontFamily="var(--font-mono)">
        {value.toFixed(2)}
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="var(--t4)"
        fontSize={11} fontFamily="var(--font-mono)">
        {unit}
      </text>
      <text x={20} y={122} textAnchor="middle" fill="var(--t4)"
        fontSize={9} fontFamily="var(--font-mono)">{min}</text>
      <text x={130} y={122} textAnchor="middle" fill="var(--t4)"
        fontSize={9} fontFamily="var(--font-mono)">{max}</text>
    </svg>
  );
}

/* ═══════════════════ HELPERS ═══════════════════ */

function Stat({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--t4)' }}>{label}</div>
      <div className="font-mono text-[12px] font-semibold" style={{ color: 'var(--t1)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function CalcLine({ line }) {
  const styles = {
    header: { fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 },
    subheader: {
      fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginTop: 10, marginBottom: 4,
      textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)',
    },
    label: { fontSize: 11, fontWeight: 500, color: 'var(--t2)', marginTop: 6, marginBottom: 2 },
    calc: {
      fontSize: 11, fontFamily: 'var(--font-mono)',
      color: line.highlight ? 'var(--accent)' : 'var(--t2)', lineHeight: 1.7,
    },
    formula: { fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: 4 },
    result: {
      fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700,
      color: 'var(--accent)', marginTop: 6,
    },
    muted: {
      fontSize: 10, color: 'var(--t4)', fontStyle: 'italic', marginTop: 2,
      fontFamily: 'var(--font-mono)',
    },
    divider: {},
  };
  if (line.type === 'divider')
    return <div className="my-2" style={{ height: 1, background: 'var(--border)' }} />;
  return <div style={styles[line.type] || styles.calc}>{line.text}</div>;
}

/* ═══════════════════ THEORY CARDS DATA ═══════════════════ */

const THEORY_CARDS = [
  {
    cat: 'Hyperplanes',
    title: 'Piecewise Affine Output',
    text: 'Each rule defines a linear hyperplane in the input space. The final output is a rational polynomial — a smooth combination of these planes weighted by firing strengths. No Riemann integration needed.',
    formula: 'zᵢ = pᵢx₁ + qᵢx₂ + rᵢ',
  },
  {
    cat: 'Efficiency',
    title: 'Sub-Microsecond Computation',
    text: 'The weighted average defuzzification requires only dot products and division — no area computation, centroid calculation, or geometric clipping. This makes Sugeno ideal for real-time embedded control.',
    formula: 'z* = Σ(wᵢzᵢ) / Σ(wᵢ)',
  },
  {
    cat: 'Optimization',
    title: 'ANFIS Gradient Compatibility',
    text: 'Because the output is a differentiable function of parameters, backpropagation can tune membership functions and rule weights. This enables neuro-fuzzy learning via the ANFIS architecture.',
    formula: '∂z*/∂θ exists ∀ θ',
  },
];
