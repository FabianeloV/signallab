import { PlotCard } from '../molecules/PlotCard';
import { StemPlot } from '../atoms/StemPlot';
import { Badge } from '../atoms/Badge';
import { Formula } from '../atoms/Formula';
import type { LTIResult } from '../../hooks/useLTISystem';
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
  const { x, h, y } = result;

  return (
    <section>
      <h2 className={styles.sectionTitle}>
        Dominio del Tiempo (Convolución Discreta)
      </h2>
      <div className={styles.row}>
        <PlotCard
          title={<>Entrada <Formula expression="x[n]" /></>}
          badge={<Badge tone="blue">{inputLabel}</Badge>}
        >
          <StemPlot
            samples={x.samples}
            n0={x.n0}
            color="var(--color-primary)"
            height={PLOT_HEIGHT}
          />
        </PlotCard>

        <PlotCard
          title={<>Sistema <Formula expression="h[n]" /></>}
          badge={<Badge tone="green">{systemLabel}</Badge>}
        >
          <StemPlot
            samples={h.samples}
            n0={h.n0}
            color="var(--color-system)"
            height={PLOT_HEIGHT}
            faded
          />
        </PlotCard>

        <PlotCard
          title={<>Salida <Formula expression="y[n] = x[n] * h[n]" /></>}
          badge={<Badge tone="purple">Resultado</Badge>}
        >
          <StemPlot
            samples={y.samples}
            n0={y.n0}
            color="var(--color-output)"
            height={PLOT_HEIGHT}
          />
        </PlotCard>
      </div>
    </section>
  );
}
