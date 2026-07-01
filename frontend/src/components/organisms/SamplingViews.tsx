import { PlotCard } from '../molecules/PlotCard';
import { ContinuousPlot } from '../atoms/ContinuousPlot';
import { SpectralReplicaPlot } from '../atoms/SpectralReplicaPlot';
import { Badge } from '../atoms/Badge';
import { Formula } from '../atoms/Formula';
import type { SamplingLabResult } from '../../hooks/useSamplingLab';
import type { AxisTick } from '../atoms/SpectrumPlot';
import styles from './PlotRow.module.css';

interface SamplingViewsProps {
  result: SamplingLabResult;
  fs: number;
}

const TIME_HEIGHT = 220;
const FREQ_HEIGHT = 220;

export function SamplingViews({ result, fs }: SamplingViewsProps) {
  const { curve, samples, bandwidth, nyquistOk, aliasFreq } = result;

  const tEndMs = curve.t[curve.t.length - 1] * 1000;
  const xTicks: AxisTick[] = [
    { value: 0, label: '0 ms' },
    { value: curve.t[curve.t.length - 1], label: `${tEndMs.toFixed(0)} ms` },
  ];

  return (
    <>
      <section>
        <h2 className={styles.sectionTitle}>Dominio del Tiempo: Muestreo de la Señal</h2>
        <PlotCard
          title={<>Señal Continua y Puntos de Muestreo <Formula expression="x(t)" /></>}
          badge={<Badge tone="blue">{samples.length} muestras</Badge>}
        >
          <ContinuousPlot
            t={curve.t}
            values={curve.values}
            color="var(--color-primary)"
            height={TIME_HEIGHT}
            fill
            sampleMarkers={samples.map((s) => ({ x: s.t, y: s.value }))}
            sampleColor="var(--color-output)"
            xTicks={xTicks}
          />
        </PlotCard>
      </section>

      <section className={styles.freqSection}>
        <div className={`${styles.sectionTitle} ${styles.sectionHeader}`}>
          Dominio de la Frecuencia: Réplicas Espectrales
          {nyquistOk ? (
            <Badge tone="green">Fs ≥ 2B — sin aliasing</Badge>
          ) : (
            <Badge tone="amber">Fs {'<'} 2B — traslape espectral</Badge>
          )}
        </div>
        <PlotCard
          title={
            <>
              Espectro Esquemático (Réplicas cada <Formula expression="F_s" />)
            </>
          }
          badge={<Badge tone="purple">B = {bandwidth.toFixed(0)} Hz</Badge>}
        >
          <SpectralReplicaPlot bandwidth={bandwidth} samplingFreq={fs} height={FREQ_HEIGHT} />
        </PlotCard>
        {!nyquistOk && (
          <p className={styles.note}>
            Debido al traslape, la frecuencia percibida tras muestrear es{' '}
            <strong>{aliasFreq.toFixed(1)} Hz</strong> en vez de la original.
          </p>
        )}
      </section>
    </>
  );
}
