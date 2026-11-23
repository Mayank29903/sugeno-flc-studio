export default function InputPanel({ preset, inputs, onInputChange, presets, onPresetChange }) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-2)' }}>
      {/* Presets */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="px-4 py-2.5 text-[10px] uppercase tracking-[.14em] font-semibold" style={{ color: 'var(--t3)' }}>
          Problem
        </div>
        {presets.map(p => {
          const sel = preset.id === p.id;
          return (
            <button key={p.id} onClick={() => onPresetChange(p)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all duration-150"
              style={{
                background: sel ? 'var(--g-bg)' : 'transparent',
                borderLeft: sel ? '2px solid var(--g500)' : '2px solid transparent',
                color: sel ? 'var(--g400)' : 'var(--t2)',
              }}>
              <span className="text-sm">{p.icon}</span>
              <span className="text-[12px] font-semibold">{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Inputs */}
      <div className="flex-1 overflow-y-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="px-4 py-2.5 text-[10px] uppercase tracking-[.14em] font-semibold" style={{ color: 'var(--t3)' }}>
          Inputs
        </div>
        <div className="px-4 pb-4 space-y-5">
          {preset.inputs.map((inp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-medium" style={{ color: 'var(--t2)' }}>{inp.name}</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[14px] font-bold font-mono" style={{ color: 'var(--g400)' }}>{inputs[idx].toFixed(1)}</span>
                  <span className="text-[10px]" style={{ color: 'var(--t4)' }}>{inp.unit}</span>
                </div>
              </div>
              <input type="range" min={inp.range[0]} max={inp.range[1]} step={.1}
                value={inputs[idx]} onChange={e => onInputChange(idx, parseFloat(e.target.value))} className="w-full"/>
              <div className="flex gap-1.5 mt-2">
                {inp.membershipFunctions.map((mf, mi) => {
                  const d = deg(inputs[idx], mf);
                  return (
                    <div key={mi} className="flex-1 rounded-lg p-1.5 text-center transition-all duration-200"
                      style={{
                        background: d > 0 ? `${mf.color}0c` : 'var(--bg-3)',
                        border: `1px solid ${d > 0 ? `${mf.color}22` : 'var(--border)'}`,
                      }}>
                      <div className="text-[8px] font-bold truncate" style={{ color: d > 0 ? mf.color : 'var(--t4)' }}>{mf.name}</div>
                      <div className="text-[10px] font-mono font-bold" style={{ color: d > 0 ? 'var(--t1)' : 'var(--border-2)' }}>{d.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-4 py-3">
        <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'var(--t3)' }}>{preset.description}</p>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: preset.rules.length, l: 'Rules' }, { v: preset.inputs.length, l: 'Inputs' }].map(({ v, l }) => (
            <div key={l} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
              <div className="text-[14px] font-bold font-mono" style={{ color: 'var(--t2)' }}>{v}</div>
              <div className="text-[8px] uppercase tracking-widest" style={{ color: 'var(--t4)' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function deg(x, mf) {
  if (mf.type === 'triangular') { const [a, b, c] = mf.params; if (x <= a || x >= c) return 0; return x <= b ? (x - a) / (b - a) : (c - x) / (c - b); }
  if (mf.type === 'trapezoidal') { const [a, b, c, d] = mf.params; if (x < a || x > d) return 0; if (x >= b && x <= c) return 1; return x < b ? (x - a) / (b - a) : (d - x) / (d - c); }
  return 0;
}
