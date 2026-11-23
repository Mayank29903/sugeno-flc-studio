import { motion } from 'framer-motion';

export default function InputPanel({ preset, inputs, onInputChange, presets, onPresetChange }) {
  return (
    <div>
      {/* ── Presets ── */}
      <Section label="Problem Preset">
        {presets.map(p => (
          <button key={p.id} onClick={() => onPresetChange(p)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
            style={{
              background: preset.id === p.id ? 'var(--accent-bg)' : 'transparent',
              borderLeft: preset.id === p.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: preset.id === p.id ? 'var(--accent)' : 'var(--text-secondary)',
            }}
            onMouseEnter={e => { if (preset.id !== p.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (preset.id !== p.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span className="text-sm">{p.icon}</span>
            <span className="text-[11px] font-semibold">{p.name}</span>
          </button>
        ))}
      </Section>

      {/* ── Inputs ── */}
      <Section label="Input Values">
        <div className="px-3 pb-3 space-y-4">
          {preset.inputs.map((inp, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{inp.name}</span>
                <span className="text-xs font-bold font-mono" style={{ color: 'var(--accent)' }}>
                  {inputs[idx].toFixed(1)}
                  <span className="text-[9px] font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>{inp.unit}</span>
                </span>
              </div>
              <input type="range" min={inp.range[0]} max={inp.range[1]} step={0.1}
                value={inputs[idx]} onChange={e => onInputChange(idx, parseFloat(e.target.value))} className="w-full" />
              <div className="flex gap-1 mt-1.5">
                {inp.membershipFunctions.map((mf, mi) => {
                  const d = deg(inputs[idx], mf);
                  return (
                    <div key={mi} className="flex-1 rounded px-1 py-0.5 text-center"
                      style={{
                        background: d > 0 ? `${mf.color}10` : 'var(--bg-raised)',
                        border: `1px solid ${d > 0 ? `${mf.color}20` : 'var(--border)'}`,
                      }}>
                      <div className="text-[7px] font-bold truncate" style={{ color: d > 0 ? mf.color : 'var(--text-muted)' }}>{mf.name}</div>
                      <div className="text-[8px] font-mono font-bold" style={{ color: d > 0 ? 'var(--text-primary)' : 'var(--border-light)' }}>{d.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── About ── */}
      <Section label="About">
        <div className="px-3 pb-3">
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{preset.description}</p>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            <Stat v={preset.rules.length} l="Rules" />
            <Stat v={preset.inputs.length} l="Inputs" />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] font-bold" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Stat({ v, l }) {
  return (
    <div className="rounded p-2 text-center" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      <div className="text-sm font-bold font-mono" style={{ color: 'var(--text-secondary)' }}>{v}</div>
      <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{l}</div>
    </div>
  );
}

function deg(x, mf) {
  if (mf.type === 'triangular') {
    const [a, b, c] = mf.params;
    if (x <= a || x >= c) return 0;
    return x <= b ? (x - a) / (b - a) : (c - x) / (c - b);
  }
  if (mf.type === 'trapezoidal') {
    const [a, b, c, d] = mf.params;
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    return x < b ? (x - a) / (b - a) : (d - x) / (d - c);
  }
  return 0;
}
