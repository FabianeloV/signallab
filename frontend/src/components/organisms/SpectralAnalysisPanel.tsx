import { ControlPanel } from '../molecules/ControlPanel';
import { SelectControl } from '../molecules/SelectControl';
import { RadioGroup } from '../atoms/RadioGroup';
import type { SelectOption } from '../atoms/Select';
import type { RadioOption } from '../atoms/RadioGroup';
import type {
  MagnitudeScale,
  WindowType,
} from '../../types/signal';
import styles from '../molecules/Field.module.css';

const WINDOW_OPTIONS: SelectOption<WindowType>[] = [
  { value: 'hamming', label: 'Hamming' },
  { value: 'hanning', label: 'Hanning' },
  { value: 'blackman', label: 'Blackman' },
  { value: 'rectangular', label: 'Rectangular' },
];

const FFT_OPTIONS: SelectOption<string>[] = [
  { value: '256', label: '256 ptos.' },
  { value: '512', label: '512 ptos.' },
  { value: '1024', label: '1024 ptos.' },
  { value: '2048', label: '2048 ptos.' },
];

const SCALE_OPTIONS: RadioOption<MagnitudeScale>[] = [
  { value: 'lineal', label: 'Lineal' },
  { value: 'logaritmica', label: 'Logarítmica (dB)' },
];

interface SpectralAnalysisPanelProps {
  window: WindowType;
  fftPoints: number;
  scale: MagnitudeScale;
  onWindow: (v: WindowType) => void;
  onFftPoints: (v: number) => void;
  onScale: (v: MagnitudeScale) => void;
}

export function SpectralAnalysisPanel({
  window,
  fftPoints,
  scale,
  onWindow,
  onFftPoints,
  onScale,
}: SpectralAnalysisPanelProps) {
  return (
    <ControlPanel title="Parámetros de Análisis">
      <SelectControl
        label="Ventana (Windowing)"
        value={window}
        options={WINDOW_OPTIONS}
        onChange={onWindow}
      />

      <SelectControl
        label="Puntos FFT (Zero-padding)"
        value={String(fftPoints)}
        options={FFT_OPTIONS}
        onChange={(v) => onFftPoints(Number(v))}
      />

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Escala de Magnitud</span>
        <RadioGroup
          name="magnitude-scale"
          value={scale}
          options={SCALE_OPTIONS}
          onChange={onScale}
        />
      </div>
    </ControlPanel>
  );
}
