export default function RuleMatrix({ preset, evaluatedRules, currentStep }) {
  const m1 = preset.inputs[0].membershipFunctions;
  const m2 = preset.inputs[1].membershipFunctions;
  const show = currentStep >= 2;
  const rule = (i, j) => evaluatedRules[i * m2.length + j];
  const activeCount = show ? evaluatedRules.filter(r => r.firingStrength > 0).length : 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 font-mono text-[9px] tracking-[0.1em] uppercase"
        style={{ color: 'var(--t3)' }}>
        <span style={{ color: 'var(--t2)' }}>{preset.inputs[0].short}</span>
        <span>×</span>
        <span style={{ color: 'var(--t2)' }}>{preset.inputs[1].short}</span>
        <span>→</span>
        <span style={{ color: 'var(--t2)' }}>{preset.output.name}</span>
        {show && (
          <span className="ml-auto" style={{ color: 'var(--t4)' }}>
            {activeCount} of {evaluatedRules.length} active
          </span>
        )}
      </div>

      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="p-2 text-right font-mono text-[8px] tracking-wider uppercase"
              style={{ color: 'var(--t4)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              {preset.inputs[0].short} ↓ \ {preset.inputs[1].short} →
            </th>
            {m2.map((m, j) => (
              <th key={j} className="p-2 font-mono text-[9px] tracking-wider font-bold"
                style={{ color: m.color, borderBottom: '1px solid var(--border)', borderLeft: j > 0 ? '1px solid var(--border)' : 'none' }}>
                {m.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {m1.map((mf1, i) => (
            <tr key={i}>
              <td className="p-2 text-right font-mono text-[9px] tracking-wider font-bold"
                style={{ color: mf1.color, borderRight: '1px solid var(--border)', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                {mf1.name}
              </td>
              {m2.map((_, j) => {
                const r = rule(i, j);
                const s = show ? r.firingStrength : 0;
                const on = show && s > 0;
                return (
                  <td key={j} className="text-center relative"
                    style={{
                      padding: '12px 10px',
                      background: on ? `rgba(201,65,88,${0.03 + s * 0.12})` : 'var(--bg-1)',
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                      borderLeft: j > 0 ? '1px solid var(--border)' : 'none',
                    }}>
                    <div className="font-mono text-[13px] font-bold"
                      style={{ color: on ? 'var(--t1)' : 'var(--t4)' }}>
                      {r.consequent}
                      <span className="text-[8px] font-normal opacity-40">{preset.output.unit}</span>
                    </div>
                    {show && (
                      <div className="font-mono text-[9px] mt-0.5"
                        style={{ color: on ? 'var(--accent)' : 'var(--border-2)' }}>
                        w={s.toFixed(3)}
                      </div>
                    )}
                    <div className="font-mono text-[7px] mt-0.5 uppercase tracking-widest"
                      style={{ color: on ? 'var(--t3)' : 'var(--border-2)' }}>
                      {r.label}
                    </div>
                    {on && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5"
                        style={{ background: 'var(--accent)' }} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
