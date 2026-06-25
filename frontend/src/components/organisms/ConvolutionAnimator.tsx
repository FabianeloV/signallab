import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Formula } from '../atoms/Formula';
import { Slider } from '../atoms/Slider';
import { ConvolutionStage } from '../atoms/ConvolutionStage';
import { convolutionFrame, convolutionLayout } from '../../lib/dsp';
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
 * entrada reflejada x[n−k] se desliza sobre el impulso h[k] mientras el
 * deslizador (o la reproducción automática) recorre la salida muestra a
 * muestra, resaltando en cada paso el solapamiento que produce y[n].
 */
export function ConvolutionAnimator({
  result,
  inputLabel,
  systemLabel,
}: ConvolutionAnimatorProps) {
  const { x, h, y } = result;
  const layout = useMemo(() => convolutionLayout(x, h), [x, h]);
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

  // Reproducción automática: avanza un paso y reinicia al llegar al final.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setN((cur) => (cur >= nEnd ? nStart : cur + 1));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [playing, nStart, nEnd]);

  const frame = useMemo(() => convolutionFrame(x, h, safeN), [x, h, safeN]);

  const stop = (next: number) => {
    setPlaying(false);
    setN(Math.min(nEnd, Math.max(nStart, next)));
  };

  return (
    <section className={rowStyles.freqSection}>
      <h2 className={rowStyles.sectionTitle}>
        Convolución Paso a Paso (señal deslizante)
      </h2>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.titles}>
            <span className={styles.title}>
              <Formula expression="y[n]=\sum_{k} h[k]\,x[n-k]" />
            </span>
            <span className={styles.hint}>
              <Badge tone="blue">{inputLabel}</Badge> se refleja y desliza sobre{' '}
              <Badge tone="green">{systemLabel}</Badge>
            </span>
          </div>
          <div className={styles.legend}>
            <Legend color="var(--color-primary)" label="x[n−k]" />
            <Legend color="var(--color-system)" label="h[k]" />
            <Legend color="var(--color-output)" label="producto" />
            <Legend color="var(--color-amber-soft)" label="solapamiento" swatchBorder />
          </div>
        </div>

        <ConvolutionStage frame={frame} layout={layout} output={y} />

        <div className={styles.readout}>
          En <strong>n = {safeN}</strong> se solapan{' '}
          <strong>{frame.overlap.length}</strong>{' '}
          {frame.overlap.length === 1 ? 'muestra' : 'muestras'} ⇒{' '}
          <span className={styles.value}>
            <Formula expression={`y[${safeN}] = ${formatValue(frame.value)}`} />
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => stop(safeN - 1)}
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
              onClick={() => stop(safeN + 1)}
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
              step={1}
              onChange={stop}
              ariaLabel="Desplazamiento n de la convolución"
            />
          </div>
          <span className={styles.position}>
            {safeN - nStart + 1} / {nEnd - nStart + 1}
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
