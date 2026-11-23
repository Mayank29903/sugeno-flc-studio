import { evaluateMF } from '../engine/sugeno';

export default function MembershipChart({ variable, inputValue, fuzzified, showIndicator = false, chartId = 'c', compact = false }) {
  const W = compact ? 400 : 560, H = compact ? 150 : 190;
  const P = { t: 20, r: 16, b: compact ? 30 : 36, l: 40 };
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
  const gx = []; for (let v = lo; v <= hi; v += gs) gx.push(v);

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ maxWidth: W, display: 'block' }}>
      <defs>
        {curves.map(({ mf, i }) => (
          <linearGradient key={i} id={`${chartId}g${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mf.color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={mf.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>

      {/* Grid */}
      {[0, .25, .5, .75, 1].map((v, j) => <line key={j} x1={P.l} y1={sy(v)} x2={P.l + pw} y2={sy(v)} stroke="#1a1a1a" strokeWidth={1}/>)}
      {gx.map((v, j) => <line key={j} x1={sx(v)} y1={P.t} x2={sx(v)} y2={P.t + ph} stroke="#141414" strokeWidth={1}/>)}

      {/* Curves */}
      {curves.map(({ mf, d, a, lx, i }) => (
        <g key={i}>
          <path d={a} fill={`url(#${chartId}g${i})`}/>
          <path d={d} fill="none" stroke={mf.color} strokeWidth={2} strokeLinejoin="round"/>
          <text x={sx(lx)} y={sy(1) - 7} textAnchor="middle" fill={mf.color}
            fontSize={compact ? 9 : 10} fontWeight={700} fontFamily="var(--font-sans)">{mf.name}</text>
        </g>
      ))}

      {/* Indicator */}
      {showIndicator && inputValue != null && (
        <g>
          <line x1={sx(inputValue)} y1={P.t} x2={sx(inputValue)} y2={P.t + ph}
            stroke="#4ade80" strokeWidth={1.5} strokeDasharray="5 3" opacity={.7}/>
          {fuzzified?.map((f, i) => f.degree > .001 && (
            <g key={i}>
              <line x1={P.l} y1={sy(f.degree)} x2={sx(inputValue)} y2={sy(f.degree)}
                stroke={variable.membershipFunctions[i]?.color} strokeWidth={.7} strokeDasharray="3 3" opacity={.35}/>
              <circle cx={sx(inputValue)} cy={sy(f.degree)} r={4.5}
                fill={variable.membershipFunctions[i]?.color} stroke="#0a0a0a" strokeWidth={2.5}/>
              <rect x={sx(inputValue) + 9} y={sy(f.degree) - 9} width={50} height={18} rx={5}
                fill="#111" stroke={variable.membershipFunctions[i]?.color} strokeWidth={.7} opacity={.9}/>
              <text x={sx(inputValue) + 34} y={sy(f.degree) + 4} textAnchor="middle" fill="#f5f5f5"
                fontSize={9} fontWeight={700} fontFamily="var(--font-mono)">{f.degree.toFixed(3)}</text>
            </g>
          ))}
          <rect x={sx(inputValue) - 19} y={P.t + ph + 5} width={38} height={16} rx={5}
            fill="rgba(34,197,94,.1)" stroke="rgba(34,197,94,.25)" strokeWidth={.8}/>
          <text x={sx(inputValue)} y={P.t + ph + 16} textAnchor="middle" fill="#4ade80"
            fontSize={9} fontWeight={700} fontFamily="var(--font-mono)">{inputValue.toFixed(1)}</text>
        </g>
      )}

      {/* Axes */}
      <line x1={P.l} y1={P.t + ph} x2={P.l + pw} y2={P.t + ph} stroke="#2a2a2a" strokeWidth={1}/>
      <line x1={P.l} y1={P.t} x2={P.l} y2={P.t + ph} stroke="#2a2a2a" strokeWidth={1}/>
      {[0, .5, 1].map(v => <text key={v} x={P.l - 7} y={sy(v) + 3.5} textAnchor="end" fill="#525252" fontSize={8} fontFamily="var(--font-mono)">{v}</text>)}
      {gx.filter((_, j, a) => j === 0 || j === a.length - 1 || j === Math.floor(a.length / 2)).map(v =>
        <text key={v} x={sx(v)} y={P.t + ph + (showIndicator ? 28 : 18)} textAnchor="middle" fill="#525252" fontSize={8} fontFamily="var(--font-mono)">{v}</text>
      )}
      <text x={12} y={P.t + ph / 2} textAnchor="middle" fill="#333" fontSize={8} fontFamily="var(--font-sans)"
        transform={`rotate(-90,12,${P.t + ph / 2})`}>μ(x)</text>
    </svg>
  );
}
