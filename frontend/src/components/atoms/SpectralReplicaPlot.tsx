import { useElementSize } from '../../hooks/useElementSize';
import styles from './Plot.module.css';

interface SpectralReplicaPlotProps {
  /** Ancho de banda B (Hz) de la señal original. */
  bandwidth: number;
  /** Frecuencia de muestreo Fs (Hz). */
  samplingFreq: number;
  height?: number;
}

const PAD = { top: 16, right: 16, bottom: 26, left: 16 };
const REPLICA_COLOR = 'var(--color-primary)';
const COPY_COLOR = 'var(--color-text-muted)';
const OVERLAP_COLOR = 'var(--color-amber-strong)';
const BAND_COLOR = 'var(--color-primary)';

/**
 * Diagrama esquemático (no una FFT real) del espectro de una señal
 * banda-limitada replicado periódicamente cada Fs, tal como se enseña el
 * criterio de muestreo de Nyquist: cada copia es un triángulo genérico de
 * semi-ancho B centrado en k·Fs. Cuando 2B > Fs, las copias adyacentes se
 * solapan — esa intersección se sombrea (traslape espectral / aliasing).
 */
export function SpectralReplicaPlot({
  bandwidth,
  samplingFreq,
  height = 200,
}: SpectralReplicaPlotProps) {
  const { ref, size } = useElementSize<HTMLDivElement>();
  const w = size.width;

  return (
    <div ref={ref} className={styles.container} style={{ height }}>
      {w > 0 && bandwidth > 0 && samplingFreq > 0 && (
        <svg width={w} height={height}>
          {renderReplicas(w, height, bandwidth, samplingFreq)}
        </svg>
      )}
    </div>
  );
}

function renderReplicas(w: number, h: number, B: number, fs: number) {
  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;

  const maxHz = Math.max(2.5 * fs, 2.2 * B);
  const kMax = Math.ceil(maxHz / fs);

  const xOf = (f: number) => PAD.left + ((f + maxHz) / (2 * maxHz)) * innerW;
  const yOf = (amplitude: number) => PAD.top + (1 - amplitude) * innerH;
  const baseY = yOf(0);

  const ks = Array.from({ length: 2 * kMax + 1 }, (_, i) => i - kMax);

  const overlaps = ks
    .filter((k) => k < kMax)
    .map((k) => {
      const left = (k + 1) * fs - B;
      const right = k * fs + B;
      return right > left ? { left, right } : null;
    })
    .filter((o): o is { left: number; right: number } => o !== null);

  const trianglePath = (center: number) =>
    `M ${xOf(center - B).toFixed(2)} ${baseY.toFixed(2)} ` +
    `L ${xOf(center).toFixed(2)} ${yOf(1).toFixed(2)} ` +
    `L ${xOf(center + B).toFixed(2)} ${baseY.toFixed(2)} Z`;

  const nyquistTicks = [-fs / 2, fs / 2].filter((f) => Math.abs(f) <= maxHz);
  const axisTicks = ks
    .map((k) => k * fs)
    .filter((f) => Math.abs(f) <= maxHz);

  return (
    <g>
      {/* Ancho de banda de la señal original (copia k = 0) */}
      <rect
        x={xOf(-B)}
        y={PAD.top}
        width={Math.max(0, xOf(B) - xOf(-B))}
        height={innerH}
        fill={BAND_COLOR}
        opacity={0.08}
      />

      {/* Zonas de traslape entre copias adyacentes */}
      {overlaps.map((o, i) => (
        <rect
          key={i}
          x={xOf(o.left)}
          y={PAD.top}
          width={Math.max(0, xOf(o.right) - xOf(o.left))}
          height={innerH}
          fill={OVERLAP_COLOR}
          opacity={0.35}
        />
      ))}

      {/* Línea de cero */}
      <line
        x1={PAD.left}
        y1={baseY}
        x2={w - PAD.right}
        y2={baseY}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
      />

      {/* Réplicas espectrales */}
      {ks.map((k) => (
        <path
          key={k}
          d={trianglePath(k * fs)}
          fill={k === 0 ? REPLICA_COLOR : COPY_COLOR}
          fillOpacity={k === 0 ? 0.28 : 0.14}
          stroke={k === 0 ? REPLICA_COLOR : COPY_COLOR}
          strokeWidth={k === 0 ? 2 : 1.4}
        />
      ))}

      {/* Líneas de Nyquist (±Fs/2) */}
      {nyquistTicks.map((f) => (
        <line
          key={f}
          x1={xOf(f)}
          y1={PAD.top - 4}
          x2={xOf(f)}
          y2={baseY}
          stroke="var(--color-amber-strong)"
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
      ))}

      <g className={styles.axisText}>
        {axisTicks.map((f) => (
          <text key={f} x={xOf(f)} y={h - 8} textAnchor="middle">
            {formatHz(f)}
          </text>
        ))}
        {nyquistTicks.map((f) => (
          <text
            key={`nyq-${f}`}
            x={xOf(f)}
            y={PAD.top - 6}
            textAnchor="middle"
            fill="var(--color-amber-strong)"
          >
            ±Fs/2
          </text>
        ))}
      </g>
    </g>
  );
}

function formatHz(f: number): string {
  if (f === 0) return '0';
  const abs = Math.abs(f);
  const sign = f < 0 ? '−' : '';
  return abs >= 1000 ? `${sign}${(abs / 1000).toFixed(1)}k` : `${sign}${abs.toFixed(0)}`;
}
