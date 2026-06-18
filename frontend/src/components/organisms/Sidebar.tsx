import {
  LayoutGrid,
  AudioLines,
  Library,
  BookText,
  Settings,
} from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { SidebarItem } from '../molecules/SidebarItem';
import { UserProfile } from '../molecules/UserProfile';
import styles from './Sidebar.module.css';

const ICON_SIZE = 18;

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Logo />
      </div>

      <nav className={styles.nav}>
        <p className={styles.sectionLabel}>Entorno</p>
        <SidebarItem to="/laboratorio" icon={<LayoutGrid size={ICON_SIZE} />} label="Laboratorio LTI" />
        <SidebarItem to="/analisis" icon={<AudioLines size={ICON_SIZE} />} label="Análisis Espectral" />
        <SidebarItem to="/experimentos" icon={<Library size={ICON_SIZE} />} label="Experimentos Guardados" />

        <p className={styles.sectionLabel}>Documentación</p>
        <SidebarItem to="/reportes" icon={<BookText size={ICON_SIZE} />} label="Reportes y Teoremas" />
        <SidebarItem to="/configuracion" icon={<Settings size={ICON_SIZE} />} label="Configuración" />
      </nav>

      <div className={styles.footer}>
        <UserProfile name="Dra. Elena R." role="Investigadora" />
      </div>
    </aside>
  );
}
