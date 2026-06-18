import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base: './'` produce rutas relativas a los assets, lo que permite servir la
// aplicación desde cualquier subruta (p. ej. https://usuario.github.io/signallab/)
// sin tener que acoplar la configuración al nombre del repositorio. Combinado con
// HashRouter, el enrutamiento funciona correctamente en GitHub Pages incluso al
// recargar la página.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
