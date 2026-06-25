import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { FormulaHint } from '../molecules/FormulaHint';
import { Formula } from '../atoms/Formula';
import { inputSignalFormula } from '../../lib/formulas';
import { INPUT_PARAM_SPECS } from '../../lib/inputParams';
import type { SelectOption } from '../atoms/Select';
import type { InputSignalType } from '../../types/signal';

const INPUT_OPTIONS: SelectOption<InputSignalType>[] = [
  { value: 'exponencial-decreciente', label: 'Exponencial Decreciente' },
  { value: 'exponencial-creciente', label: 'Exponencial Creciente' },
  { value: 'escalon', label: 'Escalón Unitario' },
  { value: 'impulso', label: 'Impulso Unitario' },
  { value: 'senoide', label: 'Senoide Discreta' },
  { value: 'coseno', label: 'Coseno Discreto' },
  { value: 'senoide-amortiguada', label: 'Senoide Amortiguada' },
  { value: 'rampa', label: 'Rampa' },
  { value: 'pulso-rectangular', label: 'Pulso Rectangular' },
  { value: 'triangular', label: 'Pulso Triangular' },
  { value: 'cuadrada', label: 'Onda Cuadrada' },
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
  const selected = INPUT_OPTIONS.find((o) => o.value === inputType);
  const paramSpec = INPUT_PARAM_SPECS[inputType];

  return (
    <ControlPanel title={<>Señal de Entrada <Formula expression="x[n]" /></>}>
      <SelectControl
        label="Tipo de Función"
        value={inputType}
        options={INPUT_OPTIONS}
        onChange={onInputType}
      />

      <FormulaHint
        caption={selected?.label}
        expression={inputSignalFormula(inputType)}
      />

      {paramSpec && (
        <SliderControl
          label={
            <>
              {paramSpec.label} (<Formula expression={paramSpec.symbol} />)
            </>
          }
          value={inputParam}
          min={paramSpec.min}
          max={paramSpec.max}
          step={paramSpec.step}
          displayValue={
            paramSpec.decimals > 0
              ? inputParam.toFixed(paramSpec.decimals)
              : `${inputParam}`
          }
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
