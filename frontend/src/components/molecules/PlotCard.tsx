import type { ReactNode } from 'react';
import { Card } from '../atoms/Card';
import styles from './PlotCard.module.css';

interface PlotCardProps {
  title: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}

export function PlotCard({ title, badge, children }: PlotCardProps) {
  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {badge}
      </div>
      <div className={styles.body}>{children}</div>
    </Card>
  );
}
