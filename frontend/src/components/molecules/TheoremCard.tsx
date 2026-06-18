import { FileText, Play, MoreVertical } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { Formula } from '../atoms/Formula';
import type { Theorem } from '../../data/theorems';
import styles from './TheoremCard.module.css';

interface TheoremCardProps {
  theorem: Theorem;
  onOpenLab?: () => void;
}

export function TheoremCard({ theorem, onOpenLab }: TheoremCardProps) {
  const isLab = theorem.action === 'lab';

  return (
    <Card interactive className={styles.card}>
      <div className={styles.head}>
        <div>
          <h3 className={styles.title}>{theorem.title}</h3>
          <div className={styles.badges}>
            <Badge tone={theorem.category.tone}>{theorem.category.label}</Badge>
            <Badge tone="gray">{theorem.chapter}</Badge>
          </div>
        </div>
        <button className={styles.menu} aria-label="Más opciones">
          <MoreVertical size={16} />
        </button>
      </div>

      <p className={styles.description}>{theorem.description}</p>

      <div className={styles.formulaBox}>
        <Formula expression={theorem.formula} display />
      </div>

      <div className={styles.footer}>
        <span className={styles.status}>{theorem.footerLabel}</span>
        <button
          className={`${styles.action} ${isLab ? styles.actionPrimary : ''}`}
          onClick={isLab ? onOpenLab : undefined}
        >
          {isLab ? <Play size={14} /> : <FileText size={14} />}
          {isLab ? 'Abrir en Laboratorio' : 'Ver Apuntes'}
        </button>
      </div>
    </Card>
  );
}
