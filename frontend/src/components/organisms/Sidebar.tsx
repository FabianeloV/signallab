import {
  LayoutGrid,
  AudioLines,
  Waves,
  Library,
  BookText,
  Settings,
  LogOut,
} from 'lucide-react';
import { Logo } from '../atoms/Logo';
import { Button } from '../atoms/Button';
import { SidebarItem } from '../molecules/SidebarItem';
import { UserProfile } from '../molecules/UserProfile';
import { useAuth } from '../../auth';
import styles from './Sidebar.module.css';

const ICON_SIZE = 18;

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Logo />
      </div>

      <nav className={styles.nav}>
        <p className={styles.sectionLabel}>Entorno</p>
        <SidebarItem to="/laboratorio" icon={<LayoutGrid size={ICON_SIZE} />} label="Laboratorio LTI" />
        <SidebarItem to="/analisis" icon={<AudioLines size={ICON_SIZE} />} label="Análisis Espectral" />
        <SidebarItem to="/muestreo" icon={<Waves size={ICON_SIZE} />} label="Muestreo y Aliasing" />
        <SidebarItem to="/experimentos" icon={<Library size={ICON_SIZE} />} label="Experimentos de Ejemplo" />

        <p className={styles.sectionLabel}>Documentación</p>
        <SidebarItem to="/reportes" icon={<BookText size={ICON_SIZE} />} label="Reportes y Teoremas" />
        <SidebarItem to="/configuracion" icon={<Settings size={ICON_SIZE} />} label="Configuración" />
      </nav>

      <div className={styles.footer}>
        <UserProfile
          name={user?.displayName ?? user?.email ?? 'Usuario'}
          role={user?.email ?? ''}
          photoURL={user?.photoURL}
        />
        <Button
          variant="ghost"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className={styles.logout}
          onClick={() => void signOut()}
        >
          <LogOut size={ICON_SIZE} />
        </Button>
      </div>
    </aside>
  );
}
