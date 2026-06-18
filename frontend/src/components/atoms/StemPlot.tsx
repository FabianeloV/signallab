import { useElementSize } from '../../hooks/useElementSize';
import styles from './Plot.module.css';

interface StemPlotProps {
  samples: number[];
  n0?: number;
  /** Color CSS del trazo y marcadores. */
  color: string;
  height?: number;
  /** Marcadores rellenos o huecos (anillo). */
  markerStyle?: 'filled' | 'open';
  /** Dibuja la línea de cero como guion en lugar del eje sólido. */
  dashedBaseline?: boolean;
  /** Atenúa el trazo (para señales secundarias). */
  faded?: boolean;
  /** Etiquetas numéricas en ejes. */
  showAxisLabels?: boolean;
}

const PAD = { top: 14, right: 10, bottom: 22, left: 30 };

/**
 * Gráfico de tallos (stem plot) para señales discretas: una línea vertical
 * desde el eje cero hasta cada muestra, rematada por un marcador circular.
 */
export function StemPlot({
  samples,
  n0 = 0,
  color,
  height = 150,
  markerStyle = 'filled',
  dashedBaseline = false,
  faded = false,
  showAxisLabels = true,
}: StemPlotProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const w = size.width;

  return (
    <div ref={ref} className={styles.container} style={{ height }}>
      {w > 0 && samples.length > 0 && (
        <svg width={w} height={height} className={faded ? styles.faded : ''}>
          {renderStems(samples, n0, w, height, color, markerStyle, dashedBaseline, showAxisLabels)}
        </svg>
      )}
    </div>
  );
}

function renderStems(
  samples: number[],
  n0: number,
  w: number,
  h: number,
  color: string,
  markerStyle: 'filled' | 'open',
  dashedBaseline: boolean,
  showAxisLabels: boolean,
) {
  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;
  const N = samples.length;

  const maxAbs = Math.max(1e-9, ...samples.map((s) => Math.abs(s)));
  const hasNeg = samples.some((s) => s < 0);
  const yMax = maxAbs;
  const yMin = hasNeg ? -maxAbs : 0;
  const range = yMax - yMin || 1;

  const xOf = (i: number) =>
    PAD.left + (N <= 1 ? innerW / 2 : (i / (N - 1)) * innerW);
  const yOf = (v: number) => PAD.top + innerH - ((v - yMin) / range) * innerH;
  const yZero = yOf(0);

  // Radio del marcador adaptado a la densidad de muestras.
  const r = Math.max(2, Math.min(4, innerW / (N * 2.2)));

  return (
    <g>
      {/* Línea de cero / eje */}
      <line
        x1={PAD.left}
        y1={yZero}
        x2={w - PAD.right}
        y2={yZero}
        stroke={dashedBaseline ? 'var(--color-text-muted)' : 'var(--color-border-strong)'}
        strokeWidth={dashedBaseline ? 1.5 : 1}
        strokeDasharray={dashedBaseline ? '4 4' : undefined}
      />

      {/* Tallos y marcadores */}
      {samples.map((v, i) => {
        const x = xOf(i);
        const y = yOf(v);
        return (
          <g key={i}>
            <line
              x1={x}
              y1={yZero}
              x2={x}
              y2={y}
              stroke={color}
              strokeWidth={1.4}
            />
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={markerStyle === 'filled' ? color : '#fff'}
              stroke={color}
              strokeWidth={1.4}
            />
          </g>
        );
      })}

      {showAxisLabels && (
        <g className={styles.axisText}>
          {/* Etiquetas del eje Y */}
          <text x={PAD.left - 6} y={yOf(yMax) + 3} textAnchor="end">
            {fmt(yMax)}
          </text>
          <text x={PAD.left - 6} y={yOf(yMin) + 3} textAnchor="end">
            {fmt(yMin)}
          </text>
          {/* Etiquetas del eje X (primer y último índice) */}
          <text x={PAD.left} y={h - 6} textAnchor="start">
            {n0}
          </text>
          <text x={w - PAD.right} y={h - 6} textAnchor="end">
            {n0 + N - 1}
          </text>
        </g>
      )}
    </g>
  );
}

function fmt(v: number): string {
  if (v === 0) return '0';
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
