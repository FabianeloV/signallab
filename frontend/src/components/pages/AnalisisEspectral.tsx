import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '../molecules/PageHeader';
import { StatusPill } from '../molecules/StatusPill';
import { Button } from '../atoms/Button';
import { TheoremBanner } from '../molecules/TheoremBanner';
import {
  SpectralSignalPanel,
  SpectralAnalysisPanel,
  SpectralPlots,
} from '../organisms';
import { useSpectralAnalysis } from '../../hooks/useSpectralAnalysis';
import type { SpectralConfig } from '../../lib/dsp/spectral';
import { downloadJson } from '../../lib/download';
import styles from './Workbench.module.css';

const INITIAL: SpectralConfig = {
  signalType: 'senoide',
  analogFreq: 250,
  samplingFreq: 1000,
  numSamples: 64,
  window: 'hamming',
  fftPoints: 1024,
  scale: 'logaritmica',
};

export function AnalisisEspectral() {
  const [config, setConfig] = useState<SpectralConfig>(INITIAL);
  const result = useSpectralAnalysis(config);

  const update = <K extends keyof SpectralConfig>(
    key: K,
    value: SpectralConfig[K],
  ) => setConfig((c) => ({ ...c, [key]: value }));

  const handleExport = () => {
    downloadJson(
      {
        config,
        señalTiempo: result.timeSignal,
        espectro: {
          omega: result.spectrum.omega,
          magnitud: result.spectrum.magnitude,
          fase: result.spectrum.phase,
        },
      },
      'espectro-signallab.json',
    );
  };

  return (
    <>
      <PageHeader
        title="Análisis Espectral de Señales"
        subtitle="Exploración de la Transformada de Fourier en Tiempo Discreto (DTFT)."
        right={
          <>
            <StatusPill label={`Motor FFT ${config.fftPoints}-pt Activo`} />
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={handleExport}
            >
              Exportar Espectro
            </Button>
          </>
        }
      />

      <div className={styles.workbench}>
        <div className={styles.controls}>
          <SpectralSignalPanel
            signalType={config.signalType}
            analogFreq={config.analogFreq}
            samplingFreq={config.samplingFreq}
            numSamples={config.numSamples}
            onSignalType={(v) => update('signalType', v)}
            onAnalogFreq={(v) => update('analogFreq', v)}
            onSamplingFreq={(v) => {
              // Mantener f0 por debajo de Nyquist al cambiar Fs.
              setConfig((c) => ({
                ...c,
                samplingFreq: v,
                analogFreq: Math.min(c.analogFreq, Math.floor(v / 2)),
              }));
            }}
            onNumSamples={(v) => update('numSamples', v)}
          />
          <SpectralAnalysisPanel
            window={config.window}
            fftPoints={config.fftPoints}
            scale={config.scale}
            onWindow={(v) => update('window', v)}
            onFftPoints={(v) => update('fftPoints', v)}
            onScale={(v) => update('scale', v)}
          />

          <div className={styles.actions}>
            <Button fullWidth onClick={handleExport}>
              Actualizar Espectros
            </Button>
          </div>
        </div>

        <div className={styles.canvas}>
          <TheoremBanner
            tone="green"
            lead="Transformada de Fourier (DTFT):"
            description="Descomposición de la señal en sus componentes frecuenciales."
            formula="X(\Omega) = \sum_{n} x[n]\, e^{-j\Omega n}"
          />
          <div style={{ height: 'var(--space-6)' }} />
          <SpectralPlots
            result={result}
            numSamples={config.numSamples}
            scale={config.scale}
          />
        </div>
      </div>
    </>
  );
}
