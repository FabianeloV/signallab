import { useId } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import type { AxisTick } from './SpectrumPlot';
import styles from './Plot.module.css';

export interface ImpulseMarker {
  /** Instante t (o frecuencia) donde ocurre el delta. */
  x: number;
  /** Peso del delta (área bajo la "muestra" real, no la aproximación 1/dt). */
  weight: number;
}

export interface SampleMarker {
  x: number;
  y: number;
}

interface ContinuousPlotProps {
  /** Eje horizontal (tiempo en segundos). */
  t: number[];
  /** Valores a graficar. */
  values: number[];
  color: string;
  height?: number;
  fill?: boolean;
  faded?: boolean;
  /** Deltas de Dirac a dibujar como flechas en vez de la muestra 1/dt. */
  impulses?: ImpulseMarker[];
  /** Puntos de muestreo a dibujar como círculos sobre la curva. */
  sampleMarkers?: SampleMarker[];
  /** Color de los puntos de muestreo (por defecto, el mismo que la curva). */
  sampleColor?: string;
  /** Marcas del eje X con etiquetas. */
  xTicks?: AxisTick[];
}

const PAD = { top: 16, right: 12, bottom: 22, left: 34 };
const ARROW_H = 40;

/**
 * Gráfico de curva continua para señales de tiempo continuo: una línea (con
 * relleno opcional) sobre el eje del tiempo, más flechas verticales para los
 * deltas de Dirac (cuya "muestra" real, 1/dt, es demasiado grande para
 * dibujarse a escala). Mismo estilo visual que `SpectrumPlot`.
 */
export function ContinuousPlot({
  t,
  values,
  color,
  height = 150,
  fill = false,
  faded = false,
  impulses = [],
  sampleMarkers = [],
  sampleColor,
  xTicks,
}: ContinuousPlotProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const gradientId = useId();
  const w = size.width;

  return (
    <div ref={ref} className={styles.container} style={{ height }}>
      {w > 0 && values.length > 0 && (
        <svg width={w} height={height} className={faded ? styles.faded : ''}>
          {renderPlot({
            t,
            values,
            color,
            w,
            h: height,
            fill,
            impulses,
            sampleMarkers,
            sampleColor: sampleColor ?? color,
            xTicks,
            gradientId,
          })}
        </svg>
      )}
    </div>
  );
}

interface RenderArgs {
  t: number[];
  values: number[];
  color: string;
  w: number;
  h: number;
  fill: boolean;
  impulses: ImpulseMarker[];
  sampleMarkers: SampleMarker[];
  sampleColor: string;
  xTicks?: AxisTick[];
  gradientId: string;
}

function renderPlot(args: RenderArgs) {
  const { t, values, color, w, h, fill, impulses, sampleMarkers, sampleColor, xTicks, gradientId } = args;

  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;

  const tMin = t[0];
  const tMax = t[t.length - 1];
  const tRange = tMax - tMin || 1;
  const dt = t.length > 1 ? t[1] - t[0] : 1;

  // Las muestras que coinciden con un delta se excluyen del trazo y de la
  // escala automática: su valor (1/dt) no representa la curva real.
  const impulseIdx = new Set(
    impulses.map((imp) => Math.round((imp.x - tMin) / dt)).filter((i) => i >= 0 && i < t.length),
  );
  const plotted = values.filter((_, i) => !impulseIdx.has(i));

  const dataMin = Math.min(
    0,
    ...plotted,
    ...impulses.map((i) => Math.min(0, i.weight)),
    ...sampleMarkers.map((s) => s.y),
  );
  const dataMax = Math.max(
    0,
    ...plotted,
    ...impulses.map((i) => Math.max(0, i.weight)),
    ...sampleMarkers.map((s) => s.y),
  );
  const yMin = dataMin;
  const yMax = dataMax || 1;
  const yRange = yMax - yMin || 1;

  const xOf = (time: number) => PAD.left + ((time - tMin) / tRange) * innerW;
  const yOf = (v: number) => PAD.top + innerH - ((v - yMin) / yRange) * innerH;
  const baseY = yOf(0);

  const visible = values
    .map((v, i) => ({ x: xOf(t[i]), y: yOf(v), skip: impulseIdx.has(i) }))
    .filter((p) => !p.skip);

  const linePath = visible.length
    ? `M ${visible.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')}`
    : '';

  const areaPath =
    fill && visible.length
      ? `M ${visible[0].x.toFixed(2)} ${baseY.toFixed(2)} L ` +
        visible.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ') +
        ` L ${visible[visible.length - 1].x.toFixed(2)} ${baseY.toFixed(2)} Z`
      : '';

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Línea base horizontal (t = 0 de amplitud) */}
      <line
        x1={PAD.left}
        y1={baseY}
        x2={w - PAD.right}
        y2={baseY}
        stroke="var(--color-border)"
        strokeWidth={1}
      />

      {fill && areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Flechas de los deltas de Dirac */}
      {impulses.map((imp, i) => {
        const x = xOf(imp.x);
        const dir = imp.weight < 0 ? 1 : -1;
        const tipY = baseY + dir * ARROW_H;
        return (
          <g key={i}>
            <line x1={x} y1={baseY} x2={x} y2={tipY} stroke={color} strokeWidth={2.4} />
            <path
              d={`M ${x - 4} ${tipY - dir * 6} L ${x} ${tipY} L ${x + 4} ${tipY - dir * 6}`}
              fill="none"
              stroke={color}
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <g className={styles.symbolText}>
              <text x={x} y={tipY - dir * 10} textAnchor="middle" style={{ fill: color }}>
                {formatWeight(imp.weight)}
              </text>
            </g>
          </g>
        );
      })}

      {/* Puntos de muestreo sobre la curva */}
      {sampleMarkers.map((s, i) => (
        <circle
          key={i}
          cx={xOf(s.x)}
          cy={yOf(s.y)}
          r={4}
          fill={sampleColor}
          stroke="#fff"
          strokeWidth={1.2}
        />
      ))}

      {xTicks && (
        <g className={styles.axisText}>
          {xTicks.map((tick) => (
            <text
              key={tick.label}
              x={xOf(tick.value)}
              y={h - 6}
              textAnchor={tick.value <= tMin ? 'start' : tick.value >= tMax ? 'end' : 'middle'}
            >
              {tick.label}
            </text>
          ))}
        </g>
      )}
    </g>
  );
}

function formatWeight(v: number): string {
  if (Math.abs(v - 1) < 1e-9) return '1';
  if (Math.abs(v + 1) < 1e-9) return '-1';
  return v.toFixed(2);
}
