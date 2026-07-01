import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { FormulaHint } from '../molecules/FormulaHint';
import { Formula } from '../atoms/Formula';
import { inputSignalFormula } from '../../lib/formulas';
import { getInputParamSpec } from '../../lib/inputParams';
import type { SelectOption } from '../atoms/Select';
import type { InputSignalType, LTIMode } from '../../types/signal';

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
  mode: LTIMode;
  inputType: InputSignalType;
  inputParam: number;
  length: number;
  onInputType: (v: InputSignalType) => void;
  onInputParam: (v: number) => void;
  onLength: (v: number) => void;
}

export function SignalConfigPanel({
  mode,
  inputType,
  inputParam,
  length,
  onInputType,
  onInputParam,
  onLength,
}: SignalConfigPanelProps) {
  const continuous = mode === 'continuo';
  const selected = INPUT_OPTIONS.find((o) => o.value === inputType);
  const paramSpec = getInputParamSpec(inputType, mode);

  return (
    <ControlPanel
      title={<>Señal de Entrada <Formula expression={continuous ? 'x(t)' : 'x[n]'} /></>}
    >
      <SelectControl
        label="Tipo de Función"
        value={inputType}
        options={INPUT_OPTIONS}
        onChange={onInputType}
      />

      <FormulaHint
        caption={selected?.label}
        expression={inputSignalFormula(inputType, mode)}
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
        label={
          continuous ? (
            <>Duración (<Formula expression="T,\ s" />)</>
          ) : (
            <>Longitud (<Formula expression="N" />)</>
          )
        }
        value={length}
        min={5}
        max={40}
        step={1}
        onChange={onLength}
      />
    </ControlPanel>
  );
}
