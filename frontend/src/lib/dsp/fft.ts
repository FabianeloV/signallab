/**
 * Transformada Rápida de Fourier (FFT) radix-2 iterativa (Cooley–Tukey).
 *
 * Opera in-place sobre los arreglos de parte real e imaginaria. Si la longitud
 * no es potencia de dos, los vectores deben rellenarse con ceros (zero-padding)
 * antes de llamar a `fft`. El helper `nextPow2` y `padToPow2` facilitan esto.
 */

/** Devuelve la menor potencia de dos mayor o igual que `n`. */
export function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/**
 * Rellena con ceros un arreglo real hasta una longitud objetivo (potencia de
 * dos). No modifica el arreglo de entrada.
 */
export function padToPow2(samples: number[], targetLength?: number): number[] {
  const target = targetLength ?? nextPow2(samples.length);
  const out = samples.slice(0, target);
  while (out.length < target) out.push(0);
  return out;
}

/**
 * FFT in-place. `re` e `im` deben tener la misma longitud, potencia de dos.
 * `inverse = true` calcula la IFFT (con el factor de normalización 1/N).
 */
export function fft(re: number[], im: number[], inverse = false): void {
  const n = re.length;
  if (n <= 1) return;
  if ((n & (n - 1)) !== 0) {
    throw new Error(`fft: la longitud debe ser potencia de dos, se recibió ${n}`);
  }

  // Reordenamiento por inversión de bits.
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // Mariposas (butterflies).
  const sign = inverse ? 1 : -1;
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (sign * 2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const aRe = re[i + k];
        const aIm = im[i + k];
        const bRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const bIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = aRe + bRe;
        im[i + k] = aIm + bIm;
        re[i + k + len / 2] = aRe - bRe;
        im[i + k + len / 2] = aIm - bIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

/**
 * Reordena un espectro de FFT (frecuencias 0..2π) para centrarlo en cero
 * (-π..π), equivalente a `fftshift` de NumPy.
 */
export function fftShift<T>(arr: T[]): T[] {
  const n = arr.length;
  const half = Math.ceil(n / 2);
  return [...arr.slice(half), ...arr.slice(0, half)];
}
