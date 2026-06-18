import { useCallback, useLayoutEffect, useRef, useState } from 'react';

interface Size {
  width: number;
  height: number;
}

/**
 * Observa el tamaño en píxeles de un elemento mediante ResizeObserver.
 * Permite dibujar gráficos SVG con coordenadas en píxeles reales (círculos
 * perfectos y trazos nítidos) que se adaptan al ancho del contenedor.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const measure = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setSize({ width, height });
    }
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return { ref, size } as const;
}
