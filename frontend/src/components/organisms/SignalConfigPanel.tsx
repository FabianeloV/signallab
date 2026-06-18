import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { Formula } from '../atoms/Formula';
import type { SelectOption } from '../atoms/Select';
import type { InputSignalType } from '../../types/signal';

const INPUT_OPTIONS: SelectOption<InputSignalType>[] = [
  { value: 'exponencial-decreciente', label: 'Exponencial Decreciente' },
  { value: 'escalon', label: 'Escalón Unitario' },
  { value: 'impulso', label: 'Impulso Unitario' },
  { value: 'senoide', label: 'Senoide Discreta' },
  { value: 'rampa', label: 'Rampa' },
];

interface SignalConfigPanelProps {
  inputType: InputSignalType;
  inputParam: number;
  length: number;
  onInputType: (v: InputSignalType) => void;
  onInputParam: (v: number) => void;
  onLength: (v: number) => void;
}

export function SignalConfigPanel({
  inputType,
  inputParam,
  length,
  onInputType,
  onInputParam,
  onLength,
}: SignalConfigPanelProps) {
  const showDecay = inputType === 'exponencial-decreciente';
  const showFreq = inputType === 'senoide';

  return (
    <ControlPanel title={<>Señal de Entrada <Formula expression="x[n]" /></>}>
      <SelectControl
        label="Tipo de Función"
        value={inputType}
        options={INPUT_OPTIONS}
        onChange={onInputType}
      />

      {showDecay && (
        <SliderControl
          label={<>Factor de Decaimiento (<Formula expression="a" />)</>}
          value={inputParam}
          min={0.1}
          max={0.99}
          step={0.01}
          displayValue={inputParam.toFixed(2)}
          onChange={onInputParam}
        />
      )}

      {showFreq && (
        <SliderControl
          label={<>Frecuencia (<Formula expression="f" />)</>}
          value={inputParam}
          min={0.01}
          max={0.5}
          step={0.01}
          displayValue={inputParam.toFixed(2)}
          onChange={onInputParam}
        />
      )}

      <SliderControl
        label={<>Longitud (<Formula expression="N" />)</>}
        value={length}
        min={5}
        max={40}
        step={1}
        onChange={onLength}
      />
    </ControlPanel>
  );
}
