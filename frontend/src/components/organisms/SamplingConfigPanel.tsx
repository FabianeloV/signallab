import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { FormulaHint } from '../molecules/FormulaHint';
import { Formula } from '../atoms/Formula';
import type { SelectOption } from '../atoms/Select';
import type { SamplingSignalType } from '../../types/signal';

const SIGNAL_OPTIONS: SelectOption<SamplingSignalType>[] = [
  { value: 'tono-puro', label: 'Tono Puro' },
  { value: 'dos-tonos', label: 'Suma de Dos Tonos' },
];

const SIGNAL_FORMULAS: Record<SamplingSignalType, string> = {
  'tono-puro': 'x(t) = \\sin(2\\pi f_0 t)',
  'dos-tonos': 'x(t) = \\sin(2\\pi f_0 t) + 0.6\\sin(2\\pi\\cdot 1.7f_0 t)',
};

interface SamplingConfigPanelProps {
  signalType: SamplingSignalType;
  f0: number;
  fs: number;
  windowMs: number;
  onSignalType: (v: SamplingSignalType) => void;
  onF0: (v: number) => void;
  onFs: (v: number) => void;
  onWindowMs: (v: number) => void;
}

export function SamplingConfigPanel({
  signalType,
  f0,
  fs,
  windowMs,
  onSignalType,
  onF0,
  onFs,
  onWindowMs,
}: SamplingConfigPanelProps) {
  const selected = SIGNAL_OPTIONS.find((o) => o.value === signalType);

  return (
    <ControlPanel title={<>Señal Continua <Formula expression="x(t)" /></>}>
      <SelectControl
        label="Tipo de Señal"
        value={signalType}
        options={SIGNAL_OPTIONS}
        onChange={onSignalType}
      />

      <FormulaHint caption={selected?.label} expression={SIGNAL_FORMULAS[signalType]} />

      <SliderControl
        label={<>Frecuencia (<Formula expression="f_0" /> en Hz)</>}
        value={f0}
        min={10}
        max={500}
        step={5}
        onChange={onF0}
      />

      <SliderControl
        label={<>Frec. de Muestreo (<Formula expression="F_s" /> en Hz)</>}
        value={fs}
        min={20}
        max={2000}
        step={10}
        onChange={onFs}
      />

      <FormulaHint
        caption="Criterio de Muestreo (Nyquist-Shannon)"
        expression="F_s > 2B"
      />

      <SliderControl
        label={<>Ventana Visible (ms)</>}
        value={windowMs}
        min={10}
        max={200}
        step={5}
        onChange={onWindowMs}
      />
    </ControlPanel>
  );
}
