import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { evaluateMF } from '../engine/sugeno';

export default function MembershipChart({
  variable, inputValue, fuzzified, showIndicator = false, chartId = 'chart', compact = false,
}) {
  const width = compact ? 380 : 520;
  const height = compact ? 160 : 200;
  const pad = { top: 22, right: 20, bottom: compact ? 32 : 38, left: 42 };
  const pw = width - pad.left - pad.right;
  const ph = height - pad.top - pad.bottom;
  const [rMin, rMax] = variable.range;

  const x = (v) => pad.left + ((v - rMin) / (rMax - rMin)) * pw;
  const y = (v) => pad.top + ph - v * ph;

  // Curves
  const curves = variable.membershipFunctions.map((mf, idx) => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const xv = rMin + (i / 200) * (rMax - rMin);
      pts.push([x(xv), y(evaluateMF(xv, mf))]);
    }
    const line = pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px},${py}`).join(' ');
    const area = `M${x(rMin)},${y(0)} ` + pts.map(([px, py]) => `L${px},${py}`).join(' ') + ` L${x(rMax)},${y(0)} Z`;
    const lx = mf.type === 'triangular' ? mf.params[1] : (mf.params[1] + mf.params[2]) / 2;
    return { mf, line, area, lx, idx };
  });

  // Grid
  const gRange = rMax - rMin;
  const gStep = gRange <= 10 ? 1 : gRange <= 20 ? 2 : 5;
  const gx = [];
  for (let v = rMin; v <= rMax; v += gStep) gx.push(v);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ maxWidth: width, display: 'block' }}>
      <rect x="0" y="0" width={width} height={height} fill="var(--bg-base)" rx="0" />

      <defs>
        {curves.map(({ mf, idx }) => (
          <linearGradient key={idx} id={`${chartId}-g${idx}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mf.color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={mf.color} stopOpacity={0.01} />
          </linearGradient>
        ))}
      </defs>

      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
        <line key={`h${i}`} x1={pad.left} y1={y(v)} x2={pad.left + pw} y2={y(v)} stroke="var(--border)" strokeWidth={0.5} />
      ))}
      {gx.map((v, i) => (
        <line key={`v${i}`} x1={x(v)} y1={pad.top} x2={x(v)} y2={pad.top + ph} stroke="var(--border)" strokeWidth={0.5} strokeOpacity={0.5} />
      ))}

      {/* Curves */}
      {curves.map(({ mf, line, area, lx, idx }) => (
        <g key={idx}>
          <path d={area} fill={`url(#${chartId}-g${idx})`} />
          <path d={line} fill="none" stroke={mf.color} strokeWidth={2} strokeLinejoin="round" />
          <text x={x(lx)} y={y(1) - 6} textAnchor="middle" fill={mf.color} fontSize={compact ? 9 : 10} fontWeight={700} fontFamily="var(--font-sans)">
            {mf.name}
          </text>
        </g>
      ))}

      {/* Indicator */}
      {showIndicator && inputValue !== undefined && (
        <g>
          <line x1={x(inputValue)} y1={pad.top} x2={x(inputValue)} y2={pad.top + ph}
            stroke="var(--text-primary)" strokeWidth={1} strokeDasharray="5 3" strokeOpacity={0.6} />
          {fuzzified?.map((f, i) => f.degree > 0.001 ? (
            <g key={i}>
              <line x1={pad.left} y1={y(f.degree)} x2={x(inputValue)} y2={y(f.degree)}
                stroke={variable.membershipFunctions[i]?.color} strokeWidth={0.8} strokeDasharray="3 3" strokeOpacity={0.4} />
              <circle cx={x(inputValue)} cy={y(f.degree)} r={4}
                fill={variable.membershipFunctions[i]?.color} stroke="var(--bg-base)" strokeWidth={2} />
              <rect x={x(inputValue) + 8} y={y(f.degree) - 9} width={48} height={18} rx={4}
                fill="var(--bg-raised)" stroke={variable.membershipFunctions[i]?.color} strokeWidth={0.8} strokeOpacity={0.4} />
              <text x={x(inputValue) + 32} y={y(f.degree) + 4} textAnchor="middle" fill="var(--text-primary)"
                fontSize={9} fontWeight={700} fontFamily="var(--font-mono)">
                {f.degree.toFixed(3)}
              </text>
            </g>
          ) : null)}
          <rect x={x(inputValue) - 18} y={pad.top + ph + 4} width={36} height={16} rx={4}
            fill="var(--accent-bg)" stroke="var(--accent-dim)" strokeWidth={0.8} />
          <text x={x(inputValue)} y={pad.top + ph + 15} textAnchor="middle" fill="var(--accent)"
            fontSize={9} fontWeight={700} fontFamily="var(--font-mono)">
            {inputValue.toFixed(1)}
          </text>
        </g>
      )}

      {/* Axes */}
      <line x1={pad.left} y1={pad.top + ph} x2={pad.left + pw} y2={pad.top + ph} stroke="var(--border-light)" strokeWidth={1} />
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + ph} stroke="var(--border-light)" strokeWidth={1} />

      {[0, 0.5, 1].map(v => (
        <text key={v} x={pad.left - 7} y={y(v) + 3.5} textAnchor="end" fill="var(--text-muted)" fontSize={8} fontFamily="var(--font-mono)">{v}</text>
      ))}
      {gx.filter((_, i, a) => i === 0 || i === a.length - 1 || i === Math.floor(a.length / 2)).map(v => (
        <text key={v} x={x(v)} y={pad.top + ph + (showIndicator ? 28 : 18)} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="var(--font-mono)">{v}</text>
      ))}

      <text x={12} y={pad.top + ph / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={8} fontFamily="var(--font-sans)"
        transform={`rotate(-90, 12, ${pad.top + ph / 2})`}>μ(x)</text>
    </svg>
  );
}
