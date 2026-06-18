import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './SidebarItem.module.css';

interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
}

export function SidebarItem({ to, icon, label }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${styles.item} ${isActive ? styles.active : ''}`
      }
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </NavLink>
  );
}
