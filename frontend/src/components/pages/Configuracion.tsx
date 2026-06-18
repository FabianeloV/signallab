import { Server, Cpu, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../molecules/PageHeader';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { API_BASE_URL, HAS_BACKEND } from '../../lib/api/config';
import styles from './Configuracion.module.css';

export function Configuracion() {
  return (
    <>
      <PageHeader
        title="Configuración"
        subtitle="Estado del entorno, parámetros del motor de cálculo e información del proyecto."
      />

      <div className={styles.sections}>
        <Card padded className={styles.section}>
          <div className={styles.sectionHead}>
            <Server size={18} className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>Motor de Reportes (Backend)</h2>
              <p className={styles.sectionDesc}>
                Servicio Python en Railway que recompone los cálculos con
                NumPy/SciPy y compila los reportes LaTeX a PDF.
              </p>
            </div>
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.label}>Estado de conexión</span>
              <span className={styles.value}>
                {HAS_BACKEND ? (
                  <Badge tone="green">
                    <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                    Configurado
                  </Badge>
                ) : (
                  <Badge tone="amber">
                    <AlertCircle size={12} style={{ marginRight: 4 }} />
                    No configurado
                  </Badge>
                )}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>URL del servicio</span>
              <span className={styles.valueMono}>
                {HAS_BACKEND ? API_BASE_URL : 'VITE_API_URL no definida'}
              </span>
            </div>
            <p className={styles.hint}>
              Para habilitar la descarga de reportes PDF, define la variable de
              entorno <code>VITE_API_URL</code> en el build del frontend
              apuntando al dominio del servicio desplegado en Railway. Mientras
              tanto, todo el cálculo y la exportación de datos en JSON funcionan
              localmente sin backend.
            </p>
          </div>
        </Card>

        <Card padded className={styles.section}>
          <div className={styles.sectionHead}>
            <Cpu size={18} className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>Motor de Cálculo (Frontend)</h2>
              <p className={styles.sectionDesc}>
                Todos los algoritmos de señales se ejecutan en el navegador en
                TypeScript, lo que mantiene la aplicación funcional sin servidor.
              </p>
            </div>
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.label}>Evaluación de la DTFT</span>
              <span className={styles.value}>256 puntos en [−π, π]</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Algoritmo espectral</span>
              <span className={styles.value}>FFT radix-2 (Cooley–Tukey)</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Ventanas disponibles</span>
              <span className={styles.value}>
                Hamming · Hanning · Blackman · Rectangular
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Convolución</span>
              <span className={styles.value}>Lineal directa y circular</span>
            </div>
          </div>
        </Card>

        <Card padded className={styles.section}>
          <div className={styles.sectionHead}>
            <Info size={18} className={styles.sectionIcon} />
            <div>
              <h2 className={styles.sectionTitle}>Acerca de SignalLab</h2>
              <p className={styles.sectionDesc}>
                Laboratorio virtual de sistemas lineales invariantes en el
                tiempo (LTI) para docencia de Señales y Sistemas.
              </p>
            </div>
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.label}>Versión</span>
              <span className={styles.value}>1.0.0</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Frontend</span>
              <span className={styles.value}>React · TypeScript · Vite</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Despliegue</span>
              <span className={styles.value}>GitHub Pages + Railway</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Referencia teórica</span>
              <span className={styles.value}>
                Oppenheim, Señales y Sistemas
              </span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
