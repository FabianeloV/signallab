import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { SliderControl } from '../molecules/SliderControl';
import { Formula } from '../atoms/Formula';
import type { SelectOption } from '../atoms/Select';
import type { FilterType } from '../../types/signal';

const FILTER_OPTIONS: SelectOption<FilterType>[] = [
  { value: 'promediador-fir', label: 'Promediador Móvil (FIR)' },
  { value: 'diferenciador', label: 'Diferenciador' },
  { value: 'iir-primer-orden', label: 'IIR Primer Orden' },
  { value: 'paso-todo', label: 'Paso-Todo (Retraso)' },
];

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
  // El orden no aplica a sistemas de longitud fija (diferenciador, paso-todo).
  const orderApplies =
    filterType === 'promediador-fir' || filterType === 'iir-primer-orden';

  return (
    <ControlPanel title={<>Respuesta al Impulso <Formula expression="h[n]" /></>}>
      <SelectControl
        label="Tipo de Filtro (Sistema LTI)"
        value={filterType}
        options={FILTER_OPTIONS}
        onChange={onFilterType}
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
        muted={delay === 0}
      />
    </ControlPanel>
  );
}
