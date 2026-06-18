import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/templates/AppLayout';
import {
  LaboratorioLTI,
  AnalisisEspectral,
  ReportesTeoremas,
  ExperimentosGuardados,
  Configuracion,
} from './components/pages';

/**
 * Se usa HashRouter porque GitHub Pages no permite reescribir rutas del
 * servidor: el enrutamiento por hash funciona de forma fiable incluso al
 * recargar una URL profunda.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/laboratorio" replace />} />
          <Route path="/laboratorio" element={<LaboratorioLTI />} />
          <Route path="/analisis" element={<AnalisisEspectral />} />
          <Route path="/experimentos" element={<ExperimentosGuardados />} />
          <Route path="/reportes" element={<ReportesTeoremas />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="*" element={<Navigate to="/laboratorio" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
