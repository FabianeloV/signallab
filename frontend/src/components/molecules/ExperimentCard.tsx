import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { StemPlot } from '../atoms/StemPlot';
import { SpectrumPlot } from '../atoms/SpectrumPlot';
import type { Experiment } from '../../data/experiments';
import styles from './ExperimentCard.module.css';

interface ExperimentCardProps {
  experiment: Experiment;
  onLoad?: () => void;
}

export function ExperimentCard({ experiment, onLoad }: ExperimentCardProps) {
  const isLab = experiment.type === 'lab';

  return (
    <Card interactive className={styles.card}>
      <div className={styles.preview}>
        <ExperimentPreview experiment={experiment} />
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{experiment.title}</h3>
          <Badge tone={isLab ? 'amber' : 'green'}>
            {isLab ? 'Laboratorio LTI' : 'Análisis Espectral'}
          </Badge>
        </div>
        <p className={styles.description}>{experiment.description}</p>

        <div className={styles.footer}>
          <button className={styles.loadBtn} onClick={onLoad}>
            Cargar Experimento
          </button>
        </div>
      </div>
    </Card>
  );
}

/** Miniatura decorativa: refleja el tipo de experimento con datos sintéticos. */
function ExperimentPreview({ experiment }: { experiment: Experiment }) {
  if (experiment.preview === 'spectrum') {
    const N = 64;
    const omega = Array.from(
      { length: N },
      (_, i) => -Math.PI + (2 * Math.PI * i) / (N - 1),
    );
    const values = omega.map(
      (o) => Math.exp(-Math.pow((o - 0.6) * 2.2, 2)) * 0.9 + 0.05,
    );
    return (
      <SpectrumPlot
        omega={omega}
        values={values}
        color="var(--color-system)"
        height={96}
        fill
        centerLine={false}
        faded
      />
    );
  }

  const samples = experiment.previewSamples ?? [
    0.2, 0.85, 0.65, -0.35, -0.55, 0.25, 0.3,
  ];
  return (
    <StemPlot
      samples={samples}
      color="var(--color-primary)"
      height={96}
      dashedBaseline
      showAxisLabels={false}
    />
  );
}
