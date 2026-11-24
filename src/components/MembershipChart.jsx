import { evaluateMF } from '../engine/sugeno';

export default function MembershipChart({ variable, inputValue, fuzzified, showIndicator = false, chartId = 'c', compact = false }) {
  const W = compact ? 400 : 520, H = compact ? 140 : 180;
  const P = { t: 20, r: 14, b: compact ? 28 : 34, l: 38 };
  const pw = W - P.l - P.r, ph = H - P.t - P.b;
  const [lo, hi] = variable.range;
  const sx = v => P.l + ((v - lo) / (hi - lo)) * pw;
  const sy = v => P.t + ph - v * ph;

  const curves = variable.membershipFunctions.map((mf, i) => {
    const pts = [];
    for (let n = 0; n <= 200; n++) {
      const xv = lo + (n / 200) * (hi - lo);
      pts.push([sx(xv), sy(evaluateMF(xv, mf))]);
    }
    const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'}${x},${y}`).join('');
    const a = `M${sx(lo)},${sy(0)} ${pts.map(([x, y]) => `L${x},${y}`).join('')} L${sx(hi)},${sy(0)}Z`;
    const lx = mf.type === 'triangular' ? mf.params[1] : (mf.params[1] + mf.params[2]) / 2;
    return { mf, d, a, lx, i };
  });

  const gs = (hi - lo) <= 10 ? 1 : (hi - lo) <= 20 ? 2 : 5;
  const gx = [];
  for (let v = lo; v <= hi; v += gs) gx.push(v);

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: W, display: 'block' }}>
      <defs>
        {curves.map(({ mf, i }) => (
          <linearGradient key={i} id={`${chartId}g${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mf.color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={mf.color} stopOpacity={0.02} />
          </linearGradient>
        ))}
      </defs>

      {/* Grid */}
      {[0, .25, .5, .75, 1].map((v, j) =>
        <line key={`h${j}`} x1={P.l} y1={sy(v)} x2={P.l + pw} y2={sy(v)} stroke="#eef0f4" strokeWidth={1} />
      )}
      {gx.map((v, j) =>
        <line key={`v${j}`} x1={sx(v)} y1={P.t} x2={sx(v)} y2={P.t + ph} stroke="#f3f4f6" strokeWidth={1} />
      )}

      {/* Curves */}
      {curves.map(({ mf, d, a, lx, i }) => (
        <g key={i}>
          <path d={a} fill={`url(#${chartId}g${i})`} />
          <path d={d} fill="none" stroke={mf.color} strokeWidth={1.8} strokeLinejoin="round" />
          <text x={sx(lx)} y={sy(1) - 7} textAnchor="middle" fill={mf.color}
            fontSize={compact ? 8 : 9} fontWeight={700} fontFamily="var(--font-mono)"
            style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mf.name}</text>
        </g>
      ))}

      {/* Input indicator */}
      {showIndicator && inputValue != null && (
        <g>
          <line x1={sx(inputValue)} y1={P.t} x2={sx(inputValue)} y2={P.t + ph}
            stroke="#2563eb" strokeWidth={1.2} strokeDasharray="5 3" opacity={.5} />
          {fuzzified?.map((f, i) => f.degree > .001 && (
            <g key={i}>
              <line x1={P.l} y1={sy(f.degree)} x2={sx(inputValue)} y2={sy(f.degree)}
                stroke={variable.membershipFunctions[i]?.color} strokeWidth={.7} strokeDasharray="2 3" opacity={.3} />
              <circle cx={sx(inputValue)} cy={sy(f.degree)} r={4}
                fill={variable.membershipFunctions[i]?.color} stroke="#fff" strokeWidth={2} />
              <rect x={sx(inputValue) + 8} y={sy(f.degree) - 10} width={48} height={18} rx={4}
                fill="#fff" stroke={variable.membershipFunctions[i]?.color} strokeWidth={.7} />
              <text x={sx(inputValue) + 32} y={sy(f.degree) + 2} textAnchor="middle" fill="#111827"
                fontSize={9} fontWeight={600} fontFamily="var(--font-mono)">{f.degree.toFixed(3)}</text>
            </g>
          ))}
          <rect x={sx(inputValue) - 18} y={P.t + ph + 4} width={36} height={16} rx={4}
            fill="var(--accent-light)" stroke="var(--accent-border)" strokeWidth={.7} />
          <text x={sx(inputValue)} y={P.t + ph + 15} textAnchor="middle" fill="#2563eb"
            fontSize={9} fontWeight={700} fontFamily="var(--font-mono)">{inputValue.toFixed(1)}</text>
        </g>
      )}

      {/* Axes */}
      <line x1={P.l} y1={P.t + ph} x2={P.l + pw} y2={P.t + ph} stroke="#d1d5db" strokeWidth={1} />
      <line x1={P.l} y1={P.t} x2={P.l} y2={P.t + ph} stroke="#d1d5db" strokeWidth={1} />
      {[0, .5, 1].map(v =>
        <text key={v} x={P.l - 6} y={sy(v) + 3} textAnchor="end" fill="#9ca3af"
          fontSize={7} fontFamily="var(--font-mono)">{v}</text>
      )}
      {gx.filter((_, j, a) => j === 0 || j === a.length - 1 || j === Math.floor(a.length / 2)).map(v =>
        <text key={v} x={sx(v)} y={P.t + ph + (showIndicator ? 26 : 16)} textAnchor="middle"
          fill="#9ca3af" fontSize={7} fontFamily="var(--font-mono)">{v}</text>
      )}
      <text x={10} y={P.t + ph / 2} textAnchor="middle" fill="#d1d5db" fontSize={7}
        fontFamily="var(--font-mono)" transform={`rotate(-90,10,${P.t + ph / 2})`}>μ(x)</text>
    </svg>
  );
}
