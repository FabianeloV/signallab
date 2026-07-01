import { useElementSize } from '../../hooks/useElementSize';
import type { ConvolutionFrame, ConvolutionLayout } from '../../lib/dsp';
import type { ContinuousSignal } from '../../types/signal';
import styles from './Plot.module.css';

interface ContinuousConvolutionStageProps {
  frame: ConvolutionFrame;
  layout: ConvolutionLayout & { dt: number };
  x: ContinuousSignal;
  h: ContinuousSignal;
  /** Señal de salida completa y(t), para dibujar su construcción progresiva. */
  output: ContinuousSignal;
  height?: number;
}

const PAD = { top: 18, right: 16, bottom: 22, left: 58 };
const LANE_GAP = 12;
const OUTPUT_GAP = 26;
const OUTPUT_H = 96;
const ARROW_H = 14;

const INPUT_COLOR = 'var(--color-primary)';
const SYSTEM_COLOR = 'var(--color-system)';
const PRODUCT_COLOR = 'var(--color-output)';

/**
 * Versión continua de `ConvolutionStage`: en vez de tallos discretos, dibuja
 * curvas (líneas/área) sobre el eje común τ, ya que x(t−τ) y h(τ) son
 * señales densamente muestreadas. Los deltas de Dirac de x o h se marcan con
 * una flecha corta en vez de la muestra 1/dt (que rompería la escala).
 */
export function ContinuousConvolutionStage({
  frame,
  layout,
  x,
  h,
  output,
  height = 348,
}: ContinuousConvolutionStageProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const w = size.width;

  return (
    <div ref={ref} className={styles.container} style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height}>
          {renderStage(w, height, frame, layout, x, h, output)}
        </svg>
      )}
    </div>
  );
}

/** Índices k (enteros, en la rejilla compartida) donde `sig` tiene un delta. */
function impulseKs(sig: ContinuousSignal, dt: number, offset = 0): Set<number> {
  if (!sig.impulses) return new Set();
  return new Set(sig.impulses.map((imp) => offset + Math.round(imp.t / dt)));
}

function renderStage(
  w: number,
  h: number,
  frame: ConvolutionFrame,
  layout: ConvolutionLayout & { dt: number },
  x: ContinuousSignal,
  h_: ContinuousSignal,
  output: ContinuousSignal,
) {
  const { dt } = layout;
  const innerW = w - PAD.left - PAD.right;
  const { kStart, kEnd } = layout;
  const K = kEnd - kStart + 1;

  const xOf = (k: number) =>
    PAD.left + (K <= 1 ? innerW / 2 : ((k - kStart) / (K - 1)) * innerW);

  const lanesTop = PAD.top;
  const lanesBottom = h - PAD.bottom - OUTPUT_H - OUTPUT_GAP;
  const lanesH = lanesBottom - lanesTop;
  const laneH = (lanesH - 2 * LANE_GAP) / 3;

  // Un delta de h ocurre en el propio τ = k·dt; un delta de x (reflejada y
  // desplazada) ocurre cuando t_frame − τ coincide con el instante del
  // delta, es decir k = n − t_imp/dt.
  const hImpulseKs = impulseKs(h_, dt);
  const xImpulseKs = impulseKs(x, dt, 0);
  const xImpulseKsShifted = new Set([...xImpulseKs].map((i) => frame.n - i));

  const lanes: LaneSpec[] = [
    {
      label: 'x(t−τ)',
      color: INPUT_COLOR,
      max: layout.xMax,
      hasNeg: layout.xHasNeg,
      valueOf: (t) => (t.xOn ? t.x : 0),
      impulseAt: (t) => xImpulseKsShifted.has(t.k),
    },
    {
      label: 'h(τ)',
      color: SYSTEM_COLOR,
      max: layout.hMax,
      hasNeg: layout.hHasNeg,
      valueOf: (t) => (t.hOn ? t.h : 0),
      impulseAt: (t) => hImpulseKs.has(t.k),
    },
    {
      label: 'h·x',
      color: PRODUCT_COLOR,
      max: layout.productMax,
      hasNeg: layout.productHasNeg,
      valueOf: (t) => (t.hOn && t.xOn ? t.product : 0),
      impulseAt: (t) => hImpulseKs.has(t.k) || xImpulseKsShifted.has(t.k),
    },
  ];

  return (
    <g>
      {frame.overlapRange && (
        <OverlapBand
          x1={xOf(frame.overlapRange[0])}
          x2={xOf(frame.overlapRange[1])}
          yTop={lanesTop - 4}
          yBottom={lanesBottom + 4}
        />
      )}

      {lanes.map((lane, i) => {
        const laneTop = lanesTop + i * (laneH + LANE_GAP);
        return (
          <Lane
            key={lane.label}
            lane={lane}
            laneTop={laneTop}
            laneH={laneH}
            taps={frame.taps}
            xOf={xOf}
          />
        );
      })}

      <g className={styles.axisText}>
        <text x={PAD.left} y={lanesBottom + 15} textAnchor="middle">
          {fmtSeconds(kStart * dt)}
        </text>
        <text x={w - PAD.right} y={lanesBottom + 15} textAnchor="middle">
          {fmtSeconds(kEnd * dt)}
        </text>
        <text x={w - PAD.right + 4} y={lanesBottom + 15} textAnchor="start">
          τ
        </text>
      </g>

      <OutputStrip
        w={w}
        top={h - PAD.bottom - OUTPUT_H}
        stripH={OUTPUT_H}
        frame={frame}
        layout={layout}
        output={output}
      />
    </g>
  );
}

interface LaneSpec {
  label: string;
  color: string;
  max: number;
  hasNeg: boolean;
  valueOf: (tap: ConvolutionFrame['taps'][number]) => number;
  impulseAt: (tap: ConvolutionFrame['taps'][number]) => boolean;
}

interface LaneProps {
  lane: LaneSpec;
  laneTop: number;
  laneH: number;
  taps: ConvolutionFrame['taps'];
  xOf: (k: number) => number;
}

function Lane({ lane, laneTop, laneH, taps, xOf }: LaneProps) {
  const zeroY = lane.hasNeg ? laneTop + laneH / 2 : laneTop + laneH;
  const amp = (lane.hasNeg ? laneH / 2 : laneH) * 0.88;
  const yOf = (v: number) => zeroY - (v / lane.max) * amp;

  const points = taps
    .map((tap) => ({ x: xOf(tap.k), y: yOf(lane.valueOf(tap)), impulse: lane.impulseAt(tap) }))
    .filter((p) => !p.impulse);

  const linePath = points.length
    ? `M ${points.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')}`
    : '';

  return (
    <g>
      <line
        x1={xOf(taps[0]?.k ?? 0)}
        y1={zeroY}
        x2={xOf(taps[taps.length - 1]?.k ?? 0)}
        y2={zeroY}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
      />

      <g className={styles.symbolText}>
        <text x={6} y={laneTop + laneH / 2 + 3} textAnchor="start">
          {lane.label}
        </text>
      </g>

      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={lane.color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {taps
        .filter((tap) => lane.impulseAt(tap))
        .map((tap) => {
          const x = xOf(tap.k);
          const v = lane.valueOf(tap);
          const dir = v < 0 ? 1 : -1;
          const tipY = zeroY + dir * ARROW_H;
          return (
            <line
              key={tap.k}
              x1={x}
              y1={zeroY}
              x2={x}
              y2={tipY}
              stroke={lane.color}
              strokeWidth={2.4}
            />
          );
        })}
    </g>
  );
}

function OverlapBand({
  x1,
  x2,
  yTop,
  yBottom,
}: {
  x1: number;
  x2: number;
  yTop: number;
  yBottom: number;
}) {
  return (
    <rect
      x={x1}
      y={yTop}
      width={Math.max(0, x2 - x1)}
      height={yBottom - yTop}
      fill="var(--color-amber-soft)"
      opacity={0.4}
      rx={4}
    />
  );
}

interface OutputStripProps {
  w: number;
  top: number;
  stripH: number;
  frame: ConvolutionFrame;
  layout: ConvolutionLayout & { dt: number };
  output: ContinuousSignal;
}

function OutputStrip({ w, top, stripH, frame, layout, output }: OutputStripProps) {
  const innerW = w - PAD.left - PAD.right;
  const { nStart, nEnd, dt } = layout;
  const M = nEnd - nStart + 1;

  const nOf = (n: number) =>
    PAD.left + (M <= 1 ? innerW / 2 : ((n - nStart) / (M - 1)) * innerW);

  const outMax = Math.max(1e-9, ...output.samples.map((s) => Math.abs(s)));
  const hasNeg = output.samples.some((s) => s < 0);
  const zeroY = hasNeg ? top + stripH / 2 : top + stripH;
  const amp = (hasNeg ? stripH / 2 : stripH) * 0.86;
  const yOf = (v: number) => zeroY - (v / outMax) * amp;

  const points = output.samples.map((v, i) => ({ n: nStart + i, x: nOf(nStart + i), y: yOf(v) }));
  const tracedPath = points.length
    ? `M ${points
        .filter((p) => p.n <= frame.n)
        .map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' L ')}`
    : '';
  const fullPath = points.length
    ? `M ${points.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')}`
    : '';

  return (
    <g>
      <line
        x1={nOf(frame.n)}
        y1={top - 6}
        x2={nOf(frame.n)}
        y2={top + stripH}
        stroke="var(--color-output)"
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.5}
      />

      <line
        x1={PAD.left}
        y1={zeroY}
        x2={w - PAD.right}
        y2={zeroY}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
      />

      <g className={styles.symbolText}>
        <text x={6} y={top + stripH / 2 + 3} textAnchor="start">
          y(t)
        </text>
      </g>

      {fullPath && (
        <path
          d={fullPath}
          fill="none"
          stroke="var(--color-output)"
          strokeWidth={1.3}
          opacity={0.25}
        />
      )}
      {tracedPath && (
        <path
          d={tracedPath}
          fill="none"
          stroke="var(--color-output)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      <circle cx={nOf(frame.n)} cy={yOf(frame.value)} r={4} fill="var(--color-output)" />

      <g className={styles.axisText}>
        <text x={PAD.left} y={top + stripH + 15} textAnchor="middle">
          {fmtSeconds(nStart * dt)}
        </text>
        <text x={w - PAD.right} y={top + stripH + 15} textAnchor="middle">
          {fmtSeconds(nEnd * dt)}
        </text>
        <text x={w - PAD.right + 4} y={top + stripH + 15} textAnchor="start">
          t
        </text>
      </g>
    </g>
  );
}

function fmtSeconds(v: number): string {
  return `${v.toFixed(2)}s`;
}
