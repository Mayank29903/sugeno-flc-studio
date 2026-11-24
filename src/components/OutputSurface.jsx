import { useMemo } from 'react';
import { runSugenoPipeline } from '../engine/sugeno';

export default function OutputSurface({ preset, inputs, output }) {
  const N = 25;
  const W = 720, H = 340;
  const [lo1, hi1] = preset.inputs[0].range;
  const [lo2, hi2] = preset.inputs[1].range;

  const { zGrid, minZ, maxZ, minPt, maxPt } = useMemo(() => {
    const zGrid = [];
    let minZ = Infinity, maxZ = -Infinity;
    let minPt = { i: 0, j: 0 }, maxPt = { i: 0, j: 0 };
    for (let j = 0; j <= N; j++) {
      for (let i = 0; i <= N; i++) {
        const x1 = lo1 + (i / N) * (hi1 - lo1);
        const x2 = lo2 + (j / N) * (hi2 - lo2);
        const { result } = runSugenoPipeline(preset, [x1, x2]);
        const z = result.output;
        zGrid.push(z);
        if (z < minZ) { minZ = z; minPt = { i, j }; }
        if (z > maxZ) { maxZ = z; maxPt = { i, j }; }
      }
    }
    return { zGrid, minZ, maxZ, minPt, maxPt };
  }, [preset, lo1, hi1, lo2, hi2]);

  const nz = z => maxZ > minZ ? (z - minZ) / (maxZ - minZ) : 0.5;
  const getZ = (i, j) => zGrid[j * (N + 1) + i] ?? 0;

  const ox = 230, oy = 270;
  const proj = (gi, gj, z) => ({
    x: ox + gi * 12.5 - gj * 6.5,
    y: oy + gi * 2.2 - gj * 5.8 - nz(z) * 55,
  });

  const { quads, majorWires } = useMemo(() => {
    const quads = [];
    for (let j = N - 1; j >= 0; j--) {
      for (let i = 0; i < N; i++) {
        const z00 = getZ(i, j), z10 = getZ(i + 1, j);
        const z11 = getZ(i + 1, j + 1), z01 = getZ(i, j + 1);
        const avg = (z00 + z10 + z11 + z01) / 4;
        const p = [proj(i, j, z00), proj(i + 1, j, z10), proj(i + 1, j + 1, z11), proj(i, j + 1, z01)];
        quads.push({
          d: `M${p[0].x},${p[0].y}L${p[1].x},${p[1].y}L${p[2].x},${p[2].y}L${p[3].x},${p[3].y}Z`,
          t: nz(avg),
        });
      }
    }

    const majorWires = [];
    const steps = [0, 5, 10, 15, 20, 25];
    for (const jj of steps) {
      let d = '';
      for (let i = 0; i <= N; i++) {
        const p = proj(i, jj, getZ(i, jj));
        d += (i === 0 ? 'M' : 'L') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }
      majorWires.push(d);
    }
    for (const ii of steps) {
      let d = '';
      for (let j = 0; j <= N; j++) {
        const p = proj(ii, j, getZ(ii, j));
        d += (j === 0 ? 'M' : 'L') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }
      majorWires.push(d);
    }

    return { quads, majorWires };
  }, [zGrid, minZ, maxZ]);

  // Current input point
  const ci = Math.max(0, Math.min(N, ((inputs[0] - lo1) / (hi1 - lo1)) * N));
  const cj = Math.max(0, Math.min(N, ((inputs[1] - lo2) / (hi2 - lo2)) * N));
  const cp = proj(ci, cj, output);
  const cpBase = proj(ci, cj, minZ);

  // Annotation points
  const maxP = proj(maxPt.i, maxPt.j, getZ(maxPt.i, maxPt.j));
  const minP = proj(minPt.i, minPt.j, getZ(minPt.i, minPt.j));

  // Axis endpoints
  const axOrigin = proj(0, 0, getZ(0, 0));
  const axI = proj(N, 0, getZ(N, 0));
  const axJ = proj(0, N, getZ(0, N));

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Filled surface */}
      {quads.map((q, i) => (
        <path key={i} d={q.d} fill={surfColor(q.t)}
          stroke={`rgba(37,99,235,${(0.04 + q.t * 0.08).toFixed(3)})`} strokeWidth={0.3} />
      ))}

      {/* Major wireframe */}
      {majorWires.map((d, i) => (
        <path key={`w${i}`} d={d} fill="none" stroke="rgba(37,99,235,0.15)" strokeWidth={0.5} />
      ))}

      {/* Max annotation */}
      <circle cx={maxP.x} cy={maxP.y} r={3} fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth={1} />
      <line x1={maxP.x} y1={maxP.y} x2={maxP.x + 30} y2={maxP.y - 20}
        stroke="rgba(37,99,235,0.25)" strokeWidth={0.5} />
      <text x={maxP.x + 32} y={maxP.y - 22} fill="#6b7280" fontSize={8} fontFamily="var(--font-mono)">
        Max: {maxZ.toFixed(2)}{preset.output.unit}
      </text>

      {/* Min annotation */}
      <circle cx={minP.x} cy={minP.y} r={3} fill="none" stroke="rgba(37,99,235,0.3)" strokeWidth={1} />
      <text x={minP.x - 5} y={minP.y + 15} fill="#9ca3af" fontSize={8} fontFamily="var(--font-mono)" textAnchor="end">
        Min: {minZ.toFixed(2)}{preset.output.unit}
      </text>

      {/* Current point vertical drop */}
      <line x1={cp.x} y1={cp.y} x2={cpBase.x} y2={cpBase.y}
        stroke="#2563eb" strokeWidth={0.8} strokeDasharray="3 2" opacity={0.4} />

      {/* Current point marker */}
      <circle cx={cp.x} cy={cp.y} r={5} fill="#2563eb" stroke="#fff" strokeWidth={2.5} />

      {/* Current value label */}
      <rect x={cp.x + 12} y={cp.y - 22} width={90} height={22} rx={4}
        fill="#fff" stroke="rgba(37,99,235,0.3)" strokeWidth={0.7} />
      <text x={cp.x + 57} y={cp.y - 8} textAnchor="middle"
        fill="#111827" fontSize={10} fontFamily="var(--font-mono)" fontWeight={600}>
        z* = {output.toFixed(2)}{preset.output.unit}
      </text>

      {/* Axis arrows & labels */}
      <line x1={axOrigin.x} y1={axOrigin.y + 5} x2={axI.x + 10} y2={axI.y + 5}
        stroke="#d1d5db" strokeWidth={0.8} />
      <text x={axI.x + 15} y={axI.y + 9} fill="#6b7280" fontSize={9} fontFamily="var(--font-mono)">x₁</text>
      <line x1={axOrigin.x - 3} y1={axOrigin.y + 3} x2={axJ.x - 3} y2={axJ.y - 5}
        stroke="#d1d5db" strokeWidth={0.8} />
      <text x={axJ.x - 10} y={axJ.y - 8} fill="#6b7280" fontSize={9} fontFamily="var(--font-mono)">x₂</text>

      {/* Scale info */}
      <text x={W - 15} y={25} textAnchor="end" fill="#9ca3af" fontSize={8} fontFamily="var(--font-mono)">
        {maxZ.toFixed(1)}{preset.output.unit}
      </text>
      <text x={W - 15} y={H - 8} textAnchor="end" fill="#9ca3af" fontSize={8} fontFamily="var(--font-mono)">
        {minZ.toFixed(1)}{preset.output.unit}
      </text>

      {/* Colorbar */}
      <defs>
        <linearGradient id="cbar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={surfColor(0)} />
          <stop offset="50%" stopColor={surfColor(0.5)} />
          <stop offset="100%" stopColor={surfColor(1)} />
        </linearGradient>
      </defs>
      <rect x={W - 30} y={50} width={10} height={H - 100} rx={2} fill="url(#cbar)" stroke="#e0e4eb" strokeWidth={0.5} />
    </svg>
  );
}

function surfColor(t) {
  // Light theme: soft slate-blue gradient
  const r = Math.round(210 - t * 90);
  const g = Math.round(220 - t * 65);
  const b = Math.round(240 - t * 25);
  return `rgb(${r},${g},${b})`;
}
