import { Outlet } from 'react-router-dom';
import { Sidebar } from '../organisms/Sidebar';
import styles from './AppLayout.module.css';

/**
 * Estructura general de la aplicación: barra lateral fija a la izquierda y
 * área de contenido desplazable a la derecha, donde el enrutador monta cada
 * página.
 */
export function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
