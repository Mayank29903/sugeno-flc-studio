import { motion } from 'framer-motion';

export default function RuleMatrix({ preset, evaluatedRules, currentStep }) {
  const mf1 = preset.inputs[0].membershipFunctions;
  const mf2 = preset.inputs[1].membershipFunctions;
  const show = currentStep >= 2;

  const getRule = (i, j) => evaluatedRules[i * mf2.length + j];

  const heat = (s) => {
    if (s <= 0) return 'var(--bg-raised)';
    return `rgba(79,184,196,${0.06 + s * 0.3})`;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{preset.inputs[0].short}</span>
        <span>×</span>
        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{preset.inputs[1].short}</span>
        <span>→</span>
        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{preset.output.name}</span>
        {show && (
          <>
            <span className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
              Active rule
            </span>
            <span className="flex items-center gap-1">
              <span className="w-6 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(79,184,196,0.1), rgba(79,184,196,0.5))' }} />
              Firing strength
            </span>
          </>
        )}
      </div>

      <table className="w-full border-separate" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="p-1.5 text-[10px] text-right" style={{ color: 'var(--text-muted)' }}>
              {preset.inputs[0].short} ↓ \ {preset.inputs[1].short} →
            </th>
            {mf2.map((m, j) => (
              <th key={j} className="p-1.5 text-[10px] font-semibold text-center" style={{ color: m.color }}>{m.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mf1.map((m1, i) => (
            <tr key={i}>
              <td className="p-1.5 text-[10px] font-semibold text-right" style={{ color: m1.color }}>{m1.name}</td>
              {mf2.map((m2, j) => {
                const r = getRule(i, j);
                const s = show ? r.firingStrength : 0;
                const active = show && s > 0;
                return (
                  <td key={j}>
                    <div className="rounded-md p-2.5 text-center relative transition-all duration-300"
                      style={{
                        background: heat(s),
                        border: `1px solid ${active ? `rgba(79,184,196,${0.15 + s * 0.3})` : 'var(--border)'}`,
                        boxShadow: active ? `0 0 ${8 + s * 12}px rgba(79,184,196,${s * 0.1})` : 'none',
                      }}>
                      <div className="text-xs font-bold font-mono" style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {r.consequent}<span className="text-[9px] font-normal opacity-50">{preset.output.unit}</span>
                      </div>
                      {show && (
                        <div className="text-[9px] font-mono mt-1" style={{ color: active ? 'var(--accent)' : 'var(--border-light)' }}>
                          w={s.toFixed(3)}
                        </div>
                      )}
                      <div className="text-[8px] mt-0.5 uppercase tracking-wider" style={{ color: active ? 'var(--text-muted)' : 'var(--border-light)' }}>
                        {r.label}
                      </div>
                      {active && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                      )}
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
