import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '../molecules/PageHeader';
import { StatusPill } from '../molecules/StatusPill';
import { Button } from '../atoms/Button';
import { TheoremBanner } from '../molecules/TheoremBanner';
import { SamplingConfigPanel, SamplingViews } from '../organisms';
import { useSamplingLab } from '../../hooks/useSamplingLab';
import type { SamplingConfig } from '../../hooks/useSamplingLab';
import { downloadJson } from '../../lib/download';
import styles from './Workbench.module.css';

const INITIAL: SamplingConfig = {
  signalType: 'tono-puro',
  f0: 300,
  fs: 400,
  windowMs: 30,
};

export function MuestreoAliasing() {
  const [config, setConfig] = useState<SamplingConfig>(INITIAL);
  const result = useSamplingLab(config);

  const update = <K extends keyof SamplingConfig>(key: K, value: SamplingConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const handleExport = () => {
    downloadJson(
      {
        config,
        curva: { t: result.curve.t, valores: result.curve.values },
        muestras: result.samples,
        anchoDeBanda: result.bandwidth,
        criterioNyquist: result.nyquistOk,
        frecuenciaAliasing: result.nyquistOk ? null : result.aliasFreq,
      },
      'muestreo-signallab.json',
    );
  };

  return (
    <>
      <PageHeader
        title="Muestreo y Aliasing"
        subtitle="Cómo se muestrea una función continua y qué ocurre cuando se viola el criterio de Nyquist."
        right={
          <>
            <StatusPill label={result.nyquistOk ? 'Sin Aliasing' : 'Aliasing Activo'} />
            <Button variant="secondary" icon={<Download size={16} />} onClick={handleExport}>
              Exportar Datos
            </Button>
          </>
        }
      />

      <div className={styles.workbench}>
        <div className={styles.controls}>
          <SamplingConfigPanel
            signalType={config.signalType}
            f0={config.f0}
            fs={config.fs}
            windowMs={config.windowMs}
            onSignalType={(v) => update('signalType', v)}
            onF0={(v) => update('f0', v)}
            onFs={(v) => update('fs', v)}
            onWindowMs={(v) => update('windowMs', v)}
          />
        </div>

        <div className={styles.canvas}>
          <TheoremBanner
            tone="amber"
            lead="Teorema de Muestreo (Nyquist-Shannon):"
            description="Una señal de ancho de banda B puede reconstruirse sin pérdida solo si se muestrea a una frecuencia mayor al doble de esa banda; si no, las réplicas espectrales se traslapan (aliasing)."
            formula="F_s > 2B \;\Rightarrow\; \text{sin traslape espectral}"
          />
          <div style={{ height: 'var(--space-6)' }} />
          <SamplingViews result={result} fs={config.fs} />
        </div>
      </div>
    </>
  );
}
