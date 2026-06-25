import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

type Status = { kind: 'ok' | 'error'; text: string } | null;

export function AnalisisEspectral() {
  const location = useLocation();
  const navigate = useNavigate();
  const nav = location.state as
    | { preset?: SpectralConfig; presetName?: string }
    | null;

  const [config, setConfig] = useState<SpectralConfig>(
    () => nav?.preset ?? INITIAL,
  );
  const [status, setStatus] = useState<Status>(
    nav?.presetName
      ? { kind: 'ok', text: `Experimento cargado: ${nav.presetName}.` }
      : null,
  );
  const result = useSpectralAnalysis(config);

  // El preset ya quedó capturado en el estado inicial; limpiamos el state del
  // historial para que "Atrás" o una recarga no vuelvan a imponerlo.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              // Mantener f0 dentro del rango del slider (máx. Fs − 1) al cambiar Fs.
              setConfig((c) => ({
                ...c,
                samplingFreq: v,
                analogFreq: Math.min(c.analogFreq, v - 1),
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
            <Button
              fullWidth
              onClick={() =>
                setStatus({ kind: 'ok', text: 'Espectros actualizados.' })
              }
            >
              Actualizar Espectros
            </Button>
            {status && (
              <p
                className={`${styles.statusMessage} ${
                  status.kind === 'ok' ? styles.statusOk : styles.statusError
                }`}
              >
                {status.text}
              </p>
            )}
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
