import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { FormulaHint } from '../molecules/FormulaHint';
import { Formula } from '../atoms/Formula';
import { systemFormula } from '../../lib/formulas';
import type { SelectOption } from '../atoms/Select';
import type { FilterType } from '../../types/signal';

const FILTER_OPTIONS: SelectOption<FilterType>[] = [
  { value: 'promediador-fir', label: 'Promediador Móvil (FIR)' },
  { value: 'promediador-ponderado', label: 'Promediador Ponderado (FIR)' },
  { value: 'pasa-altos-fir', label: 'Pasa-Altos (FIR)' },
  { value: 'diferenciador', label: 'Diferenciador' },
  { value: 'iir-primer-orden', label: 'IIR Primer Orden' },
  { value: 'eco', label: 'Eco (Retardo + Realim.)' },
  { value: 'paso-todo', label: 'Paso-Todo (Retraso)' },
];

/** Sistemas cuyo comportamiento depende del orden M (longitud del FIR). */
const ORDER_FILTERS: FilterType[] = [
  'promediador-fir',
  'promediador-ponderado',
  'pasa-altos-fir',
  'iir-primer-orden',
];

/** Sistemas que usan el retraso / retardo n_d de forma esencial. */
const DELAY_FILTERS: FilterType[] = ['eco', 'paso-todo'];

interface SystemConfigPanelProps {
  filterType: FilterType;
  order: number;
  delay: number;
  onFilterType: (v: FilterType) => void;
  onOrder: (v: number) => void;
  onDelay: (v: number) => void;
}

export function SystemConfigPanel({
  filterType,
  order,
  delay,
  onFilterType,
  onOrder,
  onDelay,
}: SystemConfigPanelProps) {
  // El orden solo aplica a los FIR de longitud variable y al IIR.
  const orderApplies = ORDER_FILTERS.includes(filterType);
  // El retraso es esencial para eco y paso-todo; en el resto solo desplaza h[n].
  const delayApplies = DELAY_FILTERS.includes(filterType);
  const selected = FILTER_OPTIONS.find((o) => o.value === filterType);

  return (
    <ControlPanel title={<>Respuesta al Impulso <Formula expression="h[n]" /></>}>
      <SelectControl
        label="Tipo de Filtro (Sistema LTI)"
        value={filterType}
        options={FILTER_OPTIONS}
        onChange={onFilterType}
      />

      <FormulaHint
        caption={selected?.label}
        expression={systemFormula(filterType)}
      />

      <SliderControl
        label={<>Orden del Filtro (<Formula expression="M" />)</>}
        value={order}
        min={1}
        max={12}
        step={1}
        onChange={onOrder}
        muted={!orderApplies}
      />

      <SliderControl
        label={<>Retraso (<Formula expression="n_d" />)</>}
        value={delay}
        min={0}
        max={10}
        step={1}
        onChange={onDelay}
        muted={!delayApplies && delay === 0}
      />
    </ControlPanel>
  );
}
