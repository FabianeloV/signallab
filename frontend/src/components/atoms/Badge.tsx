import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone =
  | 'blue'
  | 'green'
  | 'purple'
  | 'amber'
  | 'pink'
  | 'gray';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = 'gray', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
