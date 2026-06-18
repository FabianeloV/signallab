import { PlotCard } from '../molecules/PlotCard';
import { StemPlot } from '../atoms/StemPlot';
import { SpectrumPlot } from '../atoms/SpectrumPlot';
import type { AxisTick } from '../atoms/SpectrumPlot';
import { Badge } from '../atoms/Badge';
import { Formula } from '../atoms/Formula';
import type { SpectralResult } from '../../lib/dsp/spectral';
import type { MagnitudeScale } from '../../types/signal';
import styles from './SpectralPlots.module.css';

interface SpectralPlotsProps {
  result: SpectralResult;
  numSamples: number;
  scale: MagnitudeScale;
}

const FREQ_TICKS: AxisTick[] = [
  { value: -Math.PI, label: '−π' },
  { value: -Math.PI / 2, label: '−π/2' },
  { value: 0, label: '0' },
  { value: Math.PI / 2, label: 'π/2' },
  { value: Math.PI, label: 'π' },
];

const PHASE_TICKS: AxisTick[] = [
  { value: -Math.PI, label: '−π' },
  { value: 0, label: '0' },
  { value: Math.PI, label: 'π' },
];

const DB_TICKS: AxisTick[] = [
  { value: 0, label: '0 dB' },
  { value: -20, label: '−20' },
  { value: -40, label: '−40' },
  { value: -80, label: '−80 dB' },
];

export function SpectralPlots({
  result,
  numSamples,
  scale,
}: SpectralPlotsProps) {
  const { timeSignal, spectrum } = result;
  const isDb = scale === 'logaritmica';
  const maxMag = Math.max(...spectrum.magnitude, 1e-6);

  return (
    <div className={styles.stack}>
      <PlotCard
        title={<>Señal en el Dominio del Tiempo <Formula expression="x[n]" /></>}
        badge={<Badge tone="amber">{numSamples} Muestras</Badge>}
      >
        <StemPlot
          samples={timeSignal}
          color="var(--color-primary)"
          height={188}
          dashedBaseline
          markerStyle="open"
        />
      </PlotCard>

      <div className={styles.duo}>
        <PlotCard
          title={<>Espectro de Magnitud <Formula expression="|X(\Omega)|" /></>}
          badge={<Badge tone="blue">{isDb ? 'Escala dB' : 'Lineal'}</Badge>}
        >
          <SpectrumPlot
            omega={spectrum.omega}
            values={spectrum.magnitude}
            color="var(--color-system)"
            height={210}
            fill
            faded
            yDomain={isDb ? [-80, 2] : [0, maxMag * 1.1]}
            yTicks={isDb ? DB_TICKS : magnitudeTicks(maxMag)}
            xTicks={FREQ_TICKS}
          />
        </PlotCard>

        <PlotCard
          title={<>Espectro de Fase <Formula expression="\angle X(\Omega)" /></>}
          badge={<Badge tone="blue">Radianes</Badge>}
        >
          <SpectrumPlot
            omega={spectrum.omega}
            values={spectrum.phase}
            color="var(--color-output)"
            height={210}
            yDomain={[-Math.PI, Math.PI]}
            baselineValue={0}
            yTicks={PHASE_TICKS}
            xTicks={FREQ_TICKS}
          />
        </PlotCard>
      </div>
    </div>
  );
}

function magnitudeTicks(max: number): AxisTick[] {
  return [
    { value: 0, label: '0' },
    { value: max, label: max >= 10 ? max.toFixed(0) : max.toFixed(1) },
  ];
}
