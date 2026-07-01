import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { PageHeader } from '../molecules/PageHeader';
import { StatusPill } from '../molecules/StatusPill';
import { Button } from '../atoms/Button';
import { RadioGroup } from '../atoms/RadioGroup';
import type { RadioOption } from '../atoms/RadioGroup';
import { TheoremBanner } from '../molecules/TheoremBanner';
import {
  SignalConfigPanel,
  SystemConfigPanel,
  TimeDomainRow,
  ConvolutionAnimator,
  FrequencyDomainRow,
} from '../organisms';
import { useLTISystem } from '../../hooks/useLTISystem';
import type { LTIConfig } from '../../hooks/useLTISystem';
import type { LTIMode } from '../../types/signal';
import { generateLTIReport } from '../../lib/api/reports';
import { downloadJson } from '../../lib/download';
import { inputLabel, filterLabel } from '../../lib/labels';
import { defaultInputParam } from '../../lib/inputParams';
import styles from './Workbench.module.css';

const INITIAL: LTIConfig = {
  mode: 'discreto',
  inputType: 'exponencial-decreciente',
  inputParam: 0.75,
  length: 20,
  filterType: 'promediador-fir',
  order: 6,
  delay: 0,
};

const MODE_OPTIONS: RadioOption<LTIMode>[] = [
  { value: 'discreto', label: 'Tiempo Discreto' },
  { value: 'continuo', label: 'Tiempo Continuo' },
];

type Status = { kind: 'ok' | 'error'; text: string } | null;

export function LaboratorioLTI() {
  const location = useLocation();
  const navigate = useNavigate();
  const nav = location.state as { preset?: LTIConfig; presetName?: string } | null;

  const [config, setConfig] = useState<LTIConfig>(() => nav?.preset ?? INITIAL);
  const [status, setStatus] = useState<Status>(
    nav?.presetName
      ? { kind: 'ok', text: `Experimento cargado: ${nav.presetName}.` }
      : null,
  );
  const [loading, setLoading] = useState(false);

  // El preset ya quedó capturado en el estado inicial; limpiamos el state del
  // historial para que "Atrás" o una recarga no vuelvan a imponerlo sobre las
  // ediciones del usuario.
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = useLTISystem(config);

  const update = <K extends keyof LTIConfig>(key: K, value: LTIConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const handleExport = () => {
    downloadJson(
      {
        config,
        x: result.x,
        h: result.h,
        y: result.y,
        spectra: {
          X: { omega: result.X.omega, magnitud: result.X.magnitude },
          H: { omega: result.H.omega, magnitud: result.H.magnitude },
          Y: { omega: result.Y.omega, magnitud: result.Y.magnitude },
        },
      },
      'datos-lti-signallab.json',
    );
    setStatus({ kind: 'ok', text: 'Datos exportados como JSON.' });
  };

  const handleReport = async () => {
    if (config.mode === 'continuo') return;
    setLoading(true);
    setStatus(null);
    const res = await generateLTIReport(config);
    setStatus({ kind: res.ok ? 'ok' : 'error', text: res.message });
    setLoading(false);
  };

  return (
    <>
      <PageHeader
        title="Convolución y Transformada de Fourier (DTFT)"
        subtitle="Laboratorio virtual para sistemas lineales invariantes en el tiempo."
        right={
          <>
            <StatusPill label="Motor Matemático Activo" />
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={handleExport}
            >
              Exportar Datos
            </Button>
          </>
        }
      />

      <div className={styles.workbench}>
        <div className={styles.controls}>
          <RadioGroup
            name="lti-mode"
            value={config.mode}
            options={MODE_OPTIONS}
            onChange={(v) => update('mode', v)}
          />

          <SignalConfigPanel
            mode={config.mode}
            inputType={config.inputType}
            inputParam={config.inputParam}
            length={config.length}
            onInputType={(v) =>
              setConfig((c) => ({
                ...c,
                inputType: v,
                inputParam: defaultInputParam(v) ?? c.inputParam,
              }))
            }
            onInputParam={(v) => update('inputParam', v)}
            onLength={(v) => update('length', v)}
          />
          <SystemConfigPanel
            mode={config.mode}
            filterType={config.filterType}
            order={config.order}
            delay={config.delay}
            onFilterType={(v) => update('filterType', v)}
            onOrder={(v) => update('order', v)}
            onDelay={(v) => update('delay', v)}
          />

          <div className={styles.actions}>
            <Button fullWidth onClick={() => setStatus({ kind: 'ok', text: 'Sistemas recalculados.' })}>
              Calcular Sistemas
            </Button>
            <Button
              variant="secondary"
              fullWidth
              icon={<FileText size={16} />}
              onClick={handleReport}
              disabled={loading || config.mode === 'continuo'}
            >
              {config.mode === 'continuo'
                ? 'Reporte solo en Tiempo Discreto'
                : loading
                  ? 'Generando reporte…'
                  : 'Generar Reporte Formal'}
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
            tone="amber"
            lead="Teorema de Convolución:"
            description="La convolución en el dominio del tiempo equivale a la multiplicación en el dominio de la frecuencia."
            formula={
              config.mode === 'continuo'
                ? 'y(t) = x(t) * h(t) \\;\\Rightarrow\\; Y(j\\omega) = X(j\\omega)H(j\\omega)'
                : 'y[n] = x[n] * h[n] \\;\\Rightarrow\\; Y(\\Omega) = X(\\Omega)H(\\Omega)'
            }
          />
          <div style={{ height: 'var(--space-6)' }} />
          <TimeDomainRow
            result={result}
            inputLabel={inputLabel(config.inputType)}
            systemLabel={filterLabel(config.filterType)}
          />
          <ConvolutionAnimator
            result={result}
            inputLabel={inputLabel(config.inputType)}
            systemLabel={filterLabel(config.filterType)}
          />
          <FrequencyDomainRow result={result} />
        </div>
      </div>
    </>
  );
}
