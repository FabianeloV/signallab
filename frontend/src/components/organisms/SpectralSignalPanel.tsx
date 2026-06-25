import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { FormulaHint } from '../molecules/FormulaHint';
import { Formula } from '../atoms/Formula';
import { spectralSignalFormula } from '../../lib/formulas';
import type { SelectOption } from '../atoms/Select';
import type { TestSignalType } from '../../types/signal';

const SIGNAL_OPTIONS: SelectOption<TestSignalType>[] = [
  { value: 'senoide', label: 'Senoide Discreta' },
  { value: 'coseno', label: 'Coseno Discreto' },
  { value: 'suma-senoides', label: 'Suma de Senoides' },
  { value: 'cuadrada', label: 'Onda Cuadrada' },
  { value: 'diente-sierra', label: 'Diente de Sierra' },
  { value: 'triangular', label: 'Onda Triangular' },
  { value: 'chirp', label: 'Chirp (Barrido)' },
  { value: 'am', label: 'Modulación AM' },
  { value: 'ruido', label: 'Ruido Blanco' },
];

const FS_OPTIONS: SelectOption<string>[] = [
  { value: '500', label: '500 Hz' },
  { value: '1000', label: '1000 Hz' },
  { value: '2000', label: '2000 Hz' },
  { value: '4000', label: '4000 Hz' },
  { value: '8000', label: '8000 Hz' },
];

interface SpectralSignalPanelProps {
  signalType: TestSignalType;
  analogFreq: number;
  samplingFreq: number;
  numSamples: number;
  onSignalType: (v: TestSignalType) => void;
  onAnalogFreq: (v: number) => void;
  onSamplingFreq: (v: number) => void;
  onNumSamples: (v: number) => void;
}

export function SpectralSignalPanel({
  signalType,
  analogFreq,
  samplingFreq,
  numSamples,
  onSignalType,
  onAnalogFreq,
  onSamplingFreq,
  onNumSamples,
}: SpectralSignalPanelProps) {
  const selected = SIGNAL_OPTIONS.find((o) => o.value === signalType);

  return (
    <ControlPanel title={<>Señal de Prueba <Formula expression="x[n]" /></>}>
      <SelectControl
        label="Tipo de Señal"
        value={signalType}
        options={SIGNAL_OPTIONS}
        onChange={onSignalType}
      />

      <FormulaHint
        caption={selected?.label}
        expression={spectralSignalFormula(signalType)}
      />

      <SliderControl
        // El máximo llega hasta Fs (no solo Fs/2) para permitir el submuestreo
        // por encima de Nyquist y poder observar el aliasing.
        label={<>Frecuencia Analógica (<Formula expression="f_0" /> en Hz)</>}
        value={analogFreq}
        min={1}
        max={samplingFreq - 1}
        step={1}
        displayValue={`${analogFreq}`}
        onChange={onAnalogFreq}
        // El ruido blanco no depende de f0: se atenúa para indicarlo.
        muted={signalType === 'ruido'}
      />

      <SelectControl
        label={<>Frec. Muestreo (<Formula expression="F_s" /> en Hz)</>}
        value={String(samplingFreq)}
        options={FS_OPTIONS}
        onChange={(v) => onSamplingFreq(Number(v))}
      />

      <SliderControl
        label={<>Número de Muestras (<Formula expression="N" />)</>}
        value={numSamples}
        min={16}
        max={256}
        step={8}
        onChange={onNumSamples}
      />
    </ControlPanel>
  );
}
