export default function RuleMatrix({ preset, evaluatedRules, currentStep }) {
  const m1 = preset.inputs[0].membershipFunctions;
  const m2 = preset.inputs[1].membershipFunctions;
  const show = currentStep >= 2;
  const rule = (i, j) => evaluatedRules[i * m2.length + j];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-[10px]" style={{ color: 'var(--t3)' }}>
        <span className="font-semibold" style={{ color: 'var(--t2)' }}>{preset.inputs[0].short}</span>
        <span>×</span>
        <span className="font-semibold" style={{ color: 'var(--t2)' }}>{preset.inputs[1].short}</span>
        <span>→</span>
        <span className="font-semibold" style={{ color: 'var(--t2)' }}>{preset.output.name}</span>
      </div>
      <table className="w-full border-separate" style={{ borderSpacing: 6 }}>
        <thead>
          <tr>
            <th></th>
            {m2.map((m, j) => <th key={j} className="pb-2 text-[10px] font-semibold" style={{ color: m.color }}>{m.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {m1.map((mf1, i) => (
            <tr key={i}>
              <td className="pr-2 text-right text-[10px] font-semibold" style={{ color: mf1.color }}>{mf1.name}</td>
              {m2.map((_, j) => {
                const r = rule(i, j);
                const s = show ? r.firingStrength : 0;
                const on = show && s > 0;
                return (
                  <td key={j}>
                    <div className="rounded-lg p-3 text-center relative transition-all duration-300"
                      style={{
                        background: on ? `rgba(34,197,94,${.04 + s * .18})` : 'var(--bg-3)',
                        border: `1px solid ${on ? `rgba(34,197,94,${.1 + s * .25})` : 'var(--border)'}`,
                        boxShadow: on ? `0 0 ${8 + s * 16}px rgba(34,197,94,${s * .08})` : 'none',
                      }}>
                      <div className="text-[13px] font-bold font-mono" style={{ color: on ? 'var(--t1)' : 'var(--t4)' }}>
                        {r.consequent}<span className="text-[9px] font-normal opacity-40">{preset.output.unit}</span>
                      </div>
                      {show && <div className="text-[9px] font-mono mt-1" style={{ color: on ? 'var(--g400)' : 'var(--border-2)' }}>w={s.toFixed(3)}</div>}
                      <div className="text-[7px] mt-0.5 uppercase tracking-widest" style={{ color: on ? 'var(--t3)' : 'var(--border-2)' }}>{r.label}</div>
                      {on && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--g400)', boxShadow: '0 0 4px var(--g-glow)' }}/>}
                    </div>
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
