import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { Formula } from '../atoms/Formula';
import type { SelectOption } from '../atoms/Select';
import type { TestSignalType } from '../../types/signal';

const SIGNAL_OPTIONS: SelectOption<TestSignalType>[] = [
  { value: 'senoide', label: 'Senoide Discreta' },
  { value: 'suma-senoides', label: 'Suma de Senoides' },
  { value: 'chirp', label: 'Chirp (Barrido)' },
  { value: 'cuadrada', label: 'Onda Cuadrada' },
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
  return (
    <ControlPanel title={<>Señal de Prueba <Formula expression="x[n]" /></>}>
      <SelectControl
        label="Tipo de Señal"
        value={signalType}
        options={SIGNAL_OPTIONS}
        onChange={onSignalType}
      />

      <SliderControl
        label={<>Frecuencia Analógica (<Formula expression="f_0" /> en Hz)</>}
        value={analogFreq}
        min={1}
        max={Math.floor(samplingFreq / 2)}
        step={1}
        displayValue={`${analogFreq}`}
        onChange={onAnalogFreq}
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
