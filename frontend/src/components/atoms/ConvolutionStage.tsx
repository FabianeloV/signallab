import { useElementSize } from '../../hooks/useElementSize';
import type {
  ConvolutionFrame,
  ConvolutionLayout,
  ConvolutionTap,
} from '../../lib/dsp';
import type { DiscreteSignal } from '../../types/signal';
import styles from './Plot.module.css';

interface ConvolutionStageProps {
  frame: ConvolutionFrame;
  layout: ConvolutionLayout;
  /** Señal de salida completa y[n], para dibujar su construcción progresiva. */
  output: DiscreteSignal;
  height?: number;
}

const PAD = { top: 18, right: 16, bottom: 22, left: 58 };
const LANE_GAP = 12;
const OUTPUT_GAP = 26;
const OUTPUT_H = 96;

const INPUT_COLOR = 'var(--color-primary)';
const SYSTEM_COLOR = 'var(--color-system)';
const PRODUCT_COLOR = 'var(--color-output)';

/**
 * Figura de la convolución como reflexión-desplazamiento. Sobre un eje común k
 * se apilan tres pistas: la entrada reflejada y desplazada x[n−k] (el tren
 * móvil), el sistema fijo h[k] (el impulso) y el producto punto a punto, cuya
 * suma forma una muestra de la salida. Una banda resalta el solapamiento y, en
 * la franja inferior, y[n] se va construyendo a medida que el tren avanza.
 */
export function ConvolutionStage({
  frame,
  layout,
  output,
  height = 348,
}: ConvolutionStageProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const w = size.width;

  return (
    <div ref={ref} className={styles.container} style={{ height }}>
      {w > 0 && (
        <svg width={w} height={height}>
          {renderStage(w, height, frame, layout, output)}
        </svg>
      )}
    </div>
  );
}

interface LaneSpec {
  label: string;
  color: string;
  max: number;
  hasNeg: boolean;
  /** Devuelve el valor a graficar para una muestra, o null si no se dibuja. */
  valueOf: (tap: ConvolutionTap) => number | null;
  /** Atenúa los marcadores fuera del solapamiento (tren móvil). */
  dimOutsideOverlap?: boolean;
}

function renderStage(
  w: number,
  h: number,
  frame: ConvolutionFrame,
  layout: ConvolutionLayout,
  output: DiscreteSignal,
) {
  const innerW = w - PAD.left - PAD.right;
  const { kStart, kEnd } = layout;
  const K = kEnd - kStart + 1;

  const xOf = (k: number) =>
    PAD.left + (K <= 1 ? innerW / 2 : ((k - kStart) / (K - 1)) * innerW);
  const step = K <= 1 ? innerW : innerW / (K - 1);
  const r = Math.max(2, Math.min(4.5, step / 2.4));

  const lanesTop = PAD.top;
  const lanesBottom = h - PAD.bottom - OUTPUT_H - OUTPUT_GAP;
  const lanesH = lanesBottom - lanesTop;
  const laneH = (lanesH - 2 * LANE_GAP) / 3;

  const lanes: LaneSpec[] = [
    {
      label: 'x[n−k]',
      color: INPUT_COLOR,
      max: layout.xMax,
      hasNeg: layout.xHasNeg,
      valueOf: (t) => (t.xOn ? t.x : null),
      dimOutsideOverlap: true,
    },
    {
      label: 'h[k]',
      color: SYSTEM_COLOR,
      max: layout.hMax,
      hasNeg: layout.hHasNeg,
      valueOf: (t) => (t.hOn ? t.h : null),
    },
    {
      label: 'h·x',
      color: PRODUCT_COLOR,
      max: layout.productMax,
      hasNeg: layout.productHasNeg,
      valueOf: (t) => (t.hOn && t.xOn ? t.product : null),
    },
  ];

  return (
    <g>
      {/* Banda de solapamiento (detrás de todo) */}
      {frame.overlapRange && (
        <OverlapBand
          x1={xOf(frame.overlapRange[0]) - step / 2}
          x2={xOf(frame.overlapRange[1]) + step / 2}
          yTop={lanesTop - 4}
          yBottom={lanesBottom + 4}
        />
      )}

      {/* Pistas k: x[n−k], h[k] y el producto */}
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
            r={r}
          />
        );
      })}

      {/* Etiquetas del eje k */}
      <g className={styles.axisText}>
        <text x={PAD.left} y={lanesBottom + 15} textAnchor="middle">
          {kStart}
        </text>
        <text x={w - PAD.right} y={lanesBottom + 15} textAnchor="middle">
          {kEnd}
        </text>
        <text x={w - PAD.right + 4} y={lanesBottom + 15} textAnchor="start">
          k
        </text>
      </g>

      {/* Franja inferior: la salida y[n] que se va construyendo */}
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

interface LaneProps {
  lane: LaneSpec;
  laneTop: number;
  laneH: number;
  taps: ConvolutionTap[];
  xOf: (k: number) => number;
  r: number;
}

function Lane({ lane, laneTop, laneH, taps, xOf, r }: LaneProps) {
  const zeroY = lane.hasNeg ? laneTop + laneH / 2 : laneTop + laneH;
  const amp = (lane.hasNeg ? laneH / 2 : laneH) * 0.88;
  const yOf = (v: number) => zeroY - (v / lane.max) * amp;
  const x1 = xOf(taps[0]?.k ?? 0);
  const x2 = xOf(taps[taps.length - 1]?.k ?? 0);

  return (
    <g>
      {/* Línea de cero de la pista */}
      <line
        x1={x1}
        y1={zeroY}
        x2={x2}
        y2={zeroY}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
      />

      {/* Etiqueta de la pista */}
      <g className={styles.symbolText}>
        <text x={6} y={laneTop + laneH / 2 + 3} textAnchor="start">
          {lane.label}
        </text>
      </g>

      {/* Tallos y marcadores */}
      {taps.map((tap) => {
        const v = lane.valueOf(tap);
        if (v === null) return null;
        const x = xOf(tap.k);
        const y = yOf(v);
        const inOverlap = tap.hOn && tap.xOn;
        const dim = lane.dimOutsideOverlap && !inOverlap;
        return (
          <g key={tap.k} opacity={dim ? 0.32 : 1}>
            <line
              x1={x}
              y1={zeroY}
              x2={x}
              y2={y}
              stroke={lane.color}
              strokeWidth={1.4}
            />
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={lane.color}
              stroke={lane.color}
              strokeWidth={1.4}
            />
          </g>
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
    <g>
      <rect
        x={x1}
        y={yTop}
        width={Math.max(0, x2 - x1)}
        height={yBottom - yTop}
        fill="var(--color-amber-soft)"
        opacity={0.55}
        rx={4}
      />
      {[x1, x2].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={yTop}
          x2={x}
          y2={yBottom}
          stroke="var(--color-amber-strong)"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
      ))}
    </g>
  );
}

interface OutputStripProps {
  w: number;
  top: number;
  stripH: number;
  frame: ConvolutionFrame;
  layout: ConvolutionLayout;
  output: DiscreteSignal;
}

function OutputStrip({
  w,
  top,
  stripH,
  frame,
  layout,
  output,
}: OutputStripProps) {
  const innerW = w - PAD.left - PAD.right;
  const { nStart, nEnd } = layout;
  const M = nEnd - nStart + 1;

  const nOf = (n: number) =>
    PAD.left + (M <= 1 ? innerW / 2 : ((n - nStart) / (M - 1)) * innerW);

  const outMax = Math.max(
    1e-9,
    ...output.samples.map((s) => Math.abs(s)),
  );
  const hasNeg = output.samples.some((s) => s < 0);
  const zeroY = hasNeg ? top + stripH / 2 : top + stripH;
  const amp = (hasNeg ? stripH / 2 : stripH) * 0.86;
  const yOf = (v: number) => zeroY - (v / outMax) * amp;
  const r = Math.max(2, Math.min(4, innerW / (M * 2.2)));

  return (
    <g>
      {/* Guía vertical en la muestra que se está calculando */}
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

      {/* Línea de cero */}
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
          y[n]
        </text>
      </g>

      {output.samples.map((v, i) => {
        const n = output.n0 + i;
        const x = nOf(n);
        const y = yOf(v);
        const isCurrent = n === frame.n;
        const isPast = n < frame.n;
        const color = 'var(--color-output)';
        const opacity = isCurrent ? 1 : isPast ? 0.9 : 0.25;
        return (
          <g key={n} opacity={opacity}>
            <line
              x1={x}
              y1={zeroY}
              x2={x}
              y2={y}
              stroke={color}
              strokeWidth={isCurrent ? 2 : 1.3}
            />
            <circle
              cx={x}
              cy={y}
              r={isCurrent ? r + 1.5 : r}
              fill={isCurrent ? color : isPast ? color : '#fff'}
              stroke={color}
              strokeWidth={1.4}
            />
          </g>
        );
      })}

      {/* Etiquetas del eje n (el valor y[n] se muestra en el lector de la tarjeta) */}
      <g className={styles.axisText}>
        <text x={PAD.left} y={top + stripH + 15} textAnchor="middle">
          {nStart}
        </text>
        <text x={w - PAD.right} y={top + stripH + 15} textAnchor="middle">
          {nEnd}
        </text>
        <text x={w - PAD.right + 4} y={top + stripH + 15} textAnchor="start">
          n
        </text>
      </g>
    </g>
  );
}
