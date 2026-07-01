import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Formula } from '../atoms/Formula';
import { Slider } from '../atoms/Slider';
import { ConvolutionStage } from '../atoms/ConvolutionStage';
import { ContinuousConvolutionStage } from '../atoms/ContinuousConvolutionStage';
import {
  continuousConvolutionFrame,
  continuousConvolutionLayout,
  convolutionFrame,
  convolutionLayout,
} from '../../lib/dsp';
import type { ConvolutionLayout } from '../../lib/dsp';
import type { LTIResult } from '../../hooks/useLTISystem';
import rowStyles from './PlotRow.module.css';
import styles from './ConvolutionAnimator.module.css';

interface ConvolutionAnimatorProps {
  result: LTIResult;
  inputLabel: string;
  systemLabel: string;
}

/** Milisegundos entre fotogramas durante la reproducción automática. */
const STEP_MS = 420;

/**
 * Tarjeta interactiva que muestra la convolución como un "tren móvil": la
 * entrada reflejada x[n−k] (o x(t−τ) en continuo) se desliza sobre el
 * impulso h[k]/h(τ) mientras el deslizador (o la reproducción automática)
 * recorre la salida, resaltando en cada paso el solapamiento que produce
 * y[n] (o y(t)).
 */
export function ConvolutionAnimator({
  result,
  inputLabel,
  systemLabel,
}: ConvolutionAnimatorProps) {
  const continuous = result.mode === 'continuo';

  const layout = useMemo(
    () =>
      result.mode === 'continuo'
        ? continuousConvolutionLayout(result.x, result.h)
        : convolutionLayout(result.x, result.h),
    [result],
  );
  const { nStart, nEnd } = layout;

  const [n, setN] = useState(nStart);
  const [playing, setPlaying] = useState(false);

  // Al cambiar las señales, el nuevo rango [nStart, nEnd] ya está disponible en
  // este render, pero `n` aún conserva el valor anterior (el reencuadre corre
  // tras pintar). Derivamos un índice saneado para que cada fotograma sea
  // coherente con el rango vigente y nunca quede fuera de él.
  const safeN = Math.min(nEnd, Math.max(nStart, n));

  // Persistimos la corrección en el estado para los renders siguientes.
  useEffect(() => {
    if (n !== safeN) setN(safeN);
  }, [n, safeN]);

  const dt = continuous ? (layout as ConvolutionLayout & { dt: number }).dt : 1;
  // En continuo, cada "paso" avanza 1 segundo (no 1 muestra de la rejilla
  // interna, que sería un incremento imperceptible de solo `dt` segundos).
  const step = continuous ? Math.max(1, Math.round(1 / dt)) : 1;

  // Reproducción automática: avanza un paso y reinicia al llegar al final.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setN((cur) => (cur >= nEnd ? nStart : Math.min(nEnd, cur + step)));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [playing, nStart, nEnd, step]);

  const frame = useMemo(
    () =>
      result.mode === 'continuo'
        ? continuousConvolutionFrame(result.x, result.h, safeN)
        : convolutionFrame(result.x, result.h, safeN),
    [result, safeN],
  );

  const stop = (next: number) => {
    setPlaying(false);
    setN(Math.min(nEnd, Math.max(nStart, next)));
  };

  const readoutLabel = continuous ? `t = ${(safeN * dt).toFixed(2)}s` : `n = ${safeN}`;
  const readoutFormula = continuous
    ? `y(${(safeN * dt).toFixed(2)}) = ${formatValue(frame.value)}`
    : `y[${safeN}] = ${formatValue(frame.value)}`;

  return (
    <section className={rowStyles.freqSection}>
      <h2 className={rowStyles.sectionTitle}>
        Convolución Paso a Paso ({continuous ? 'integral deslizante' : 'señal deslizante'})
      </h2>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titles}>
            <span className={styles.title}>
              <Formula
                expression={
                  continuous
                    ? 'y(t)=\\int h(\\tau)\\,x(t-\\tau)\\,d\\tau'
                    : 'y[n]=\\sum_{k} h[k]\\,x[n-k]'
                }
              />
            </span>
            <span className={styles.hint}>
              <Badge tone="blue">{inputLabel}</Badge> se refleja y desliza sobre{' '}
              <Badge tone="green">{systemLabel}</Badge>
            </span>
          </div>
          <div className={styles.legend}>
            <Legend color="var(--color-primary)" label={continuous ? 'x(t−τ)' : 'x[n−k]'} />
            <Legend color="var(--color-system)" label={continuous ? 'h(τ)' : 'h[k]'} />
            <Legend color="var(--color-output)" label="producto" />
            <Legend color="var(--color-amber-soft)" label="solapamiento" swatchBorder />
          </div>
        </div>

        {result.mode === 'continuo' ? (
          <ContinuousConvolutionStage
            frame={frame}
            layout={layout as ReturnType<typeof continuousConvolutionLayout>}
            x={result.x}
            h={result.h}
            output={result.y}
          />
        ) : (
          <ConvolutionStage frame={frame} layout={layout} output={result.y} />
        )}

        <div className={styles.readout}>
          En <strong>{readoutLabel}</strong> se solapan{' '}
          <strong>{frame.overlap.length}</strong>{' '}
          {frame.overlap.length === 1 ? 'muestra' : 'muestras'} ⇒{' '}
          <span className={styles.value}>
            <Formula expression={readoutFormula} />
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => stop(safeN - step)}
              disabled={safeN <= nStart}
              aria-label="Paso anterior"
            >
              <SkipBack size={16} />
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.playButton}`}
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pausar' : 'Reproducir'}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => stop(safeN + step)}
              disabled={safeN >= nEnd}
              aria-label="Paso siguiente"
            >
              <SkipForward size={16} />
            </button>
          </div>
          <div className={styles.sliderWrap}>
            <Slider
              value={safeN}
              min={nStart}
              max={nEnd}
              step={step}
              onChange={stop}
              ariaLabel="Desplazamiento n de la convolución"
            />
          </div>
          <span className={styles.position}>
            {continuous
              ? `${Math.round((safeN - nStart) / step) + 1} / ${Math.floor((nEnd - nStart) / step) + 1}`
              : `${safeN - nStart + 1} / ${nEnd - nStart + 1}`}
          </span>
        </div>
      </Card>
    </section>
  );
}

function Legend({
  color,
  label,
  swatchBorder = false,
}: {
  color: string;
  label: string;
  swatchBorder?: boolean;
}) {
  return (
    <span className={styles.legendItem}>
      <span
        className={styles.swatch}
        style={{
          background: color,
          border: swatchBorder ? '1px solid var(--color-amber-strong)' : 'none',
        }}
      />
      {label}
    </span>
  );
}

function formatValue(v: number): string {
  if (Math.abs(v) < 1e-9) return '0';
  if (Math.abs(v) >= 100) return v.toFixed(1);
  return v.toFixed(3);
}
