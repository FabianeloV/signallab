import { useId } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import styles from './Plot.module.css';

export interface AxisTick {
  value: number;
  label: string;
}

interface SpectrumPlotProps {
  /** Eje de frecuencias Ω. */
  omega: number[];
  /** Valores a graficar (magnitud o fase). */
  values: number[];
  color: string;
  height?: number;
  /** Rellena el área bajo la curva. */
  fill?: boolean;
  /** Línea vertical de guion en Ω = 0. */
  centerLine?: boolean;
  /** Dominio vertical [min, max]; se calcula si se omite. */
  yDomain?: [number, number];
  /** Marcas del eje Y con etiquetas. */
  yTicks?: AxisTick[];
  /** Marcas del eje X con etiquetas. */
  xTicks?: AxisTick[];
  /** Valor donde se sitúa la línea base horizontal (0 para fase). */
  baselineValue?: number;
  faded?: boolean;
}

const PAD = { top: 12, right: 12, bottom: 22, left: 34 };

/**
 * Gráfico de espectro: dibuja una curva continua de magnitud o fase sobre el
 * eje de frecuencias normalizadas, con relleno opcional y una línea vertical
 * de referencia en el origen de frecuencias.
 */
export function SpectrumPlot({
  omega,
  values,
  color,
  height = 150,
  fill = false,
  centerLine = true,
  yDomain,
  yTicks,
  xTicks,
  baselineValue,
  faded = false,
}: SpectrumPlotProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const gradientId = useId();
  const w = size.width;

  return (
    <div ref={ref} className={styles.container} style={{ height }}>
      {w > 0 && values.length > 0 && (
        <svg width={w} height={height} className={faded ? styles.faded : ''}>
          {renderSpectrum({
            omega,
            values,
            color,
            w,
            h: height,
            fill,
            centerLine,
            yDomain,
            yTicks,
            xTicks,
            baselineValue,
            gradientId,
          })}
        </svg>
      )}
    </div>
  );
}

interface RenderArgs {
  omega: number[];
  values: number[];
  color: string;
  w: number;
  h: number;
  fill: boolean;
  centerLine: boolean;
  yDomain?: [number, number];
  yTicks?: AxisTick[];
  xTicks?: AxisTick[];
  baselineValue?: number;
  gradientId: string;
}

function renderSpectrum(args: RenderArgs) {
  const {
    omega,
    values,
    color,
    w,
    h,
    fill,
    centerLine,
    yDomain,
    yTicks,
    xTicks,
    baselineValue,
    gradientId,
  } = args;

  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;

  const wMin = omega[0];
  const wMax = omega[omega.length - 1];
  const wRange = wMax - wMin || 1;

  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const [yMin, yMax] = yDomain ?? [dataMin, dataMax];
  const yRange = yMax - yMin || 1;

  const xOf = (o: number) => PAD.left + ((o - wMin) / wRange) * innerW;
  const yOf = (v: number) =>
    PAD.top + innerH - ((v - yMin) / yRange) * innerH;

  const baseY = yOf(baselineValue ?? yMin);

  // Construcción del trazo.
  const linePath = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(omega[i]).toFixed(2)} ${yOf(v).toFixed(2)}`)
    .join(' ');

  const areaPath =
    `M ${xOf(omega[0]).toFixed(2)} ${baseY.toFixed(2)} ` +
    values.map((v, i) => `L ${xOf(omega[i]).toFixed(2)} ${yOf(v).toFixed(2)}`).join(' ') +
    ` L ${xOf(omega[omega.length - 1]).toFixed(2)} ${baseY.toFixed(2)} Z`;

  const centerX = xOf(0);

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Línea base horizontal */}
      <line
        x1={PAD.left}
        y1={baseY}
        x2={w - PAD.right}
        y2={baseY}
        stroke="var(--color-border)"
        strokeWidth={1}
      />

      {/* Relleno */}
      {fill && <path d={areaPath} fill={`url(#${gradientId})`} />}

      {/* Curva */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Línea vertical de referencia en Ω = 0 */}
      {centerLine && centerX >= PAD.left && centerX <= w - PAD.right && (
        <line
          x1={centerX}
          y1={PAD.top - 2}
          x2={centerX}
          y2={PAD.top + innerH}
          stroke="var(--color-text)"
          strokeWidth={2}
          strokeDasharray="3 4"
          opacity={0.85}
        />
      )}

      {/* Marcas del eje Y */}
      {yTicks && (
        <g className={styles.axisText}>
          {yTicks.map((t) => (
            <text key={t.label} x={PAD.left - 6} y={yOf(t.value) + 3} textAnchor="end">
              {t.label}
            </text>
          ))}
        </g>
      )}

      {/* Marcas del eje X */}
      {xTicks && (
        <g className={styles.axisText}>
          {xTicks.map((t) => (
            <text
              key={t.label}
              x={xOf(t.value)}
              y={h - 6}
              textAnchor={
                t.value <= wMin ? 'start' : t.value >= wMax ? 'end' : 'middle'
              }
            >
              {t.label}
            </text>
          ))}
        </g>
      )}
    </g>
  );
}
