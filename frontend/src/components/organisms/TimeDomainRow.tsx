import { PlotCard } from '../molecules/PlotCard';
import { StemPlot } from '../atoms/StemPlot';
import { ContinuousPlot } from '../atoms/ContinuousPlot';
import { Badge } from '../atoms/Badge';
import { Formula } from '../atoms/Formula';
import type { LTIResult } from '../../hooks/useLTISystem';
import type { ContinuousSignal } from '../../types/signal';
import type { AxisTick } from '../atoms/SpectrumPlot';
import styles from './PlotRow.module.css';

interface TimeDomainRowProps {
  result: LTIResult;
  inputLabel: string;
  systemLabel: string;
}

const PLOT_HEIGHT = 168;

export function TimeDomainRow({
  result,
  inputLabel,
  systemLabel,
}: TimeDomainRowProps) {
  return (
    <section>
      <h2 className={styles.sectionTitle}>
        {result.mode === 'continuo'
          ? 'Dominio del Tiempo (Convolución Continua)'
          : 'Dominio del Tiempo (Convolución Discreta)'}
      </h2>
      <div className={styles.row}>
        <PlotCard
          title={<>Entrada <Formula expression={result.mode === 'continuo' ? 'x(t)' : 'x[n]'} /></>}
          badge={<Badge tone="blue">{inputLabel}</Badge>}
        >
          {result.mode === 'continuo' ? (
            <ContinuousPlot
              t={timeAxis(result.x)}
              values={result.x.samples}
              color="var(--color-primary)"
              height={PLOT_HEIGHT}
              fill
              impulses={toImpulseMarkers(result.x)}
              xTicks={timeTicks(result.x)}
            />
          ) : (
            <StemPlot
              samples={result.x.samples}
              n0={result.x.n0}
              color="var(--color-primary)"
              height={PLOT_HEIGHT}
            />
          )}
        </PlotCard>

        <PlotCard
          title={<>Sistema <Formula expression={result.mode === 'continuo' ? 'h(t)' : 'h[n]'} /></>}
          badge={<Badge tone="green">{systemLabel}</Badge>}
        >
          {result.mode === 'continuo' ? (
            <ContinuousPlot
              t={timeAxis(result.h)}
              values={result.h.samples}
              color="var(--color-system)"
              height={PLOT_HEIGHT}
              fill
              faded
              impulses={toImpulseMarkers(result.h)}
              xTicks={timeTicks(result.h)}
            />
          ) : (
            <StemPlot
              samples={result.h.samples}
              n0={result.h.n0}
              color="var(--color-system)"
              height={PLOT_HEIGHT}
              faded
            />
          )}
        </PlotCard>

        <PlotCard
          title={
            <>
              Salida{' '}
              <Formula
                expression={result.mode === 'continuo' ? 'y(t) = x(t) * h(t)' : 'y[n] = x[n] * h[n]'}
              />
            </>
          }
          badge={<Badge tone="purple">Resultado</Badge>}
        >
          {result.mode === 'continuo' ? (
            <ContinuousPlot
              t={timeAxis(result.y)}
              values={result.y.samples}
              color="var(--color-output)"
              height={PLOT_HEIGHT}
              fill
              impulses={toImpulseMarkers(result.y)}
              xTicks={timeTicks(result.y)}
            />
          ) : (
            <StemPlot
              samples={result.y.samples}
              n0={result.y.n0}
              color="var(--color-output)"
              height={PLOT_HEIGHT}
            />
          )}
        </PlotCard>
      </div>
    </section>
  );
}

function timeAxis(sig: ContinuousSignal): number[] {
  return Array.from({ length: sig.samples.length }, (_, i) => sig.t0 + i * sig.dt);
}

function toImpulseMarkers(sig: ContinuousSignal) {
  return sig.impulses?.map((imp) => ({ x: imp.t, weight: imp.weight })) ?? [];
}

function timeTicks(sig: ContinuousSignal): AxisTick[] {
  const tEnd = sig.t0 + (sig.samples.length - 1) * sig.dt;
  return [
    { value: sig.t0, label: `${sig.t0.toFixed(2)}s` },
    { value: tEnd, label: `${tEnd.toFixed(2)}s` },
  ];
}

