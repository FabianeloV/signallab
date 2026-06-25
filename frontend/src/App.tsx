import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/templates/AppLayout';
import {
  LaboratorioLTI,
  AnalisisEspectral,
  ReportesTeoremas,
  ExperimentosGuardados,
  Configuracion,
  Login,
} from './components/pages';
import { AuthProvider, useAuth } from './auth';

/**
 * Se usa HashRouter porque GitHub Pages no permite reescribir rutas del
 * servidor: el enrutamiento por hash funciona de forma fiable incluso al
 * recargar una URL profunda.
 */
function AppRoutes() {
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

/** Loader a pantalla completa mientras Firebase restaura la sesión persistida. */
function AuthSplash() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
      }}
    >
      Cargando…
    </div>
  );
}

/**
 * Puerta de autenticación: el login es lo primero que se ve sin sesión.
 * El chequeo de `loading` va antes que `!user` para evitar el parpadeo del
 * login mientras Firebase restaura la sesión guardada al recargar.
 */
function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <AuthSplash />;
  if (!user) return <Login />;
  return <AppRoutes />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
