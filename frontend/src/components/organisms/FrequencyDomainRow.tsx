import { PlotCard } from '../molecules/PlotCard';
import { SpectrumPlot } from '../atoms/SpectrumPlot';
import type { AxisTick } from '../atoms/SpectrumPlot';
import { Formula } from '../atoms/Formula';
import type { LTIResult } from '../../hooks/useLTISystem';
import styles from './PlotRow.module.css';

interface FrequencyDomainRowProps {
  result: LTIResult;
}

const PLOT_HEIGHT = 168;

const PI_TICKS: AxisTick[] = [
  { value: -Math.PI, label: '−π' },
  { value: 0, label: '0' },
  { value: Math.PI, label: 'π' },
];

export function FrequencyDomainRow({ result }: FrequencyDomainRowProps) {
  const { X, H, Y } = result;

  const maxX = Math.max(...X.magnitude, 1e-6);
  const maxH = Math.max(...H.magnitude, 1e-6);
  const maxY = Math.max(...Y.magnitude, 1e-6);

  return (
    <section className={styles.freqSection}>
      <h2 className={styles.sectionTitle}>
        Dominio de la Frecuencia (DTFT · Multiplicación)
      </h2>
      <div className={styles.row}>
        <PlotCard title={<>Magnitud <Formula expression="|X(\Omega)|" /></>}>
          <SpectrumPlot
            omega={X.omega}
            values={X.magnitude}
            color="var(--color-primary)"
            height={PLOT_HEIGHT}
            fill
            yDomain={[0, maxX * 1.1]}
            yTicks={magnitudeTicks(maxX)}
            xTicks={PI_TICKS}
          />
        </PlotCard>

        <PlotCard title={<>Magnitud <Formula expression="|H(\Omega)|" /></>}>
          <SpectrumPlot
            omega={H.omega}
            values={H.magnitude}
            color="var(--color-system)"
            height={PLOT_HEIGHT}
            fill
            faded
            yDomain={[0, maxH * 1.1]}
            yTicks={magnitudeTicks(maxH)}
            xTicks={PI_TICKS}
          />
        </PlotCard>

        <PlotCard
          title={
            <>
              Magnitud <Formula expression="|Y(\Omega)| = |X(\Omega)||H(\Omega)|" />
            </>
          }
        >
          <SpectrumPlot
            omega={Y.omega}
            values={Y.magnitude}
            color="var(--color-output)"
            height={PLOT_HEIGHT}
            fill
            yDomain={[0, maxY * 1.1]}
            yTicks={magnitudeTicks(maxY)}
            xTicks={PI_TICKS}
          />
        </PlotCard>
      </div>
    </section>
  );
}

function magnitudeTicks(max: number): AxisTick[] {
  return [
    { value: 0, label: '0.0' },
    { value: max, label: max >= 10 ? max.toFixed(0) : max.toFixed(1) },
  ];
}
