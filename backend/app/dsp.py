"""Motor de cálculo DSP del backend (NumPy).

Replica la lógica del frontend para que los reportes reflejen exactamente lo
que el usuario observa en pantalla: generación de señales, convolución, DTFT y
análisis espectral (ventana + FFT)."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .models import LTIReportRequest, SpectralReportRequest


@dataclass
class Signal:
    n0: int
    samples: np.ndarray  # 1-D real


@dataclass
class Spectrum:
    omega: np.ndarray
    magnitude: np.ndarray
    phase: np.ndarray


# --------------------------------------------------------------------------- #
# Señales de entrada x[n]
# --------------------------------------------------------------------------- #
def make_input_signal(req: LTIReportRequest) -> Signal:
    n = req.length
    t = req.input_type
    p = req.input_param
    idx = np.arange(n)

    if t == "exponencial-decreciente":
        return Signal(0, np.power(p, idx))
    if t == "escalon":
        return Signal(0, np.ones(n))
    if t == "impulso":
        s = np.zeros(n)
        s[0] = 1.0
        return Signal(0, s)
    if t == "senoide":
        return Signal(0, np.sin(2 * np.pi * p * idx))
    if t == "rampa":
        return Signal(0, idx / max(n - 1, 1))
    return Signal(0, np.power(0.75, idx))


# --------------------------------------------------------------------------- #
# Sistemas h[n]
# --------------------------------------------------------------------------- #
def make_system(req: LTIReportRequest) -> Signal:
    t = req.filter_type
    order = req.order
    delay = req.delay

    if t == "promediador-fir":
        length = order + 1
        return Signal(delay, np.full(length, 1.0 / length))
    if t == "diferenciador":
        return Signal(delay, np.array([1.0, -1.0]))
    if t == "iir-primer-orden":
        length = max(order + 1, 8)
        return Signal(delay, np.power(0.7, np.arange(length)))
    if t == "paso-todo":
        return Signal(delay, np.array([1.0]))
    return Signal(delay, np.full(order + 1, 1.0 / (order + 1)))


def convolve(x: Signal, h: Signal) -> Signal:
    if x.samples.size == 0 or h.samples.size == 0:
        return Signal(x.n0 + h.n0, np.array([]))
    y = np.convolve(x.samples, h.samples)
    return Signal(x.n0 + h.n0, y)


# --------------------------------------------------------------------------- #
# DTFT (evaluación directa sobre rejilla [-pi, pi])
# --------------------------------------------------------------------------- #
def dtft(signal: Signal, num_points: int = 256) -> Spectrum:
    omega = np.linspace(-np.pi, np.pi, num_points)
    n = signal.n0 + np.arange(signal.samples.size)
    # X(w) = sum_n x[n] e^{-jwn}  -> matriz (num_points x len)
    exponent = np.exp(-1j * np.outer(omega, n))
    x_omega = exponent @ signal.samples.astype(complex)
    return Spectrum(omega, np.abs(x_omega), np.angle(x_omega))


# --------------------------------------------------------------------------- #
# Ventanas
# --------------------------------------------------------------------------- #
def make_window(kind: str, n: int) -> np.ndarray:
    if n <= 1:
        return np.ones(max(n, 1))
    k = np.arange(n)
    if kind == "hamming":
        return 0.54 - 0.46 * np.cos(2 * np.pi * k / (n - 1))
    if kind == "hanning":
        return 0.5 - 0.5 * np.cos(2 * np.pi * k / (n - 1))
    if kind == "blackman":
        return (
            0.42
            - 0.5 * np.cos(2 * np.pi * k / (n - 1))
            + 0.08 * np.cos(4 * np.pi * k / (n - 1))
        )
    return np.ones(n)  # rectangular


# --------------------------------------------------------------------------- #
# Análisis espectral
# --------------------------------------------------------------------------- #
def generate_test_signal(req: SpectralReportRequest) -> np.ndarray:
    w0 = 2 * np.pi * req.analog_freq / req.sampling_freq
    n = np.arange(req.num_samples)
    t = req.signal_type
    if t == "senoide":
        return np.sin(w0 * n)
    if t == "suma-senoides":
        return np.sin(w0 * n) + 0.5 * np.sin(2.5 * w0 * n)
    if t == "chirp":
        return np.sin(w0 * n * n / (2 * req.num_samples))
    if t == "cuadrada":
        s = np.sign(np.sin(w0 * n))
        s[s == 0] = 1
        return s
    return np.sin(w0 * n)


@dataclass
class SpectralResult:
    time_signal: np.ndarray
    omega: np.ndarray
    magnitude: np.ndarray  # lineal o dB según escala
    magnitude_linear: np.ndarray
    phase: np.ndarray
    normalized_freq: float


def analyze_spectrum(req: SpectralReportRequest) -> SpectralResult:
    time_signal = generate_test_signal(req)
    windowed = time_signal * make_window(req.window, req.num_samples)

    nfft = int(req.fft_points)
    spectrum = np.fft.fft(windowed, n=nfft)
    spectrum = np.fft.fftshift(spectrum)

    freqs = np.fft.fftshift(np.fft.fftfreq(nfft)) * 2 * np.pi  # [-pi, pi)
    mag_lin = np.abs(spectrum)
    phase = np.angle(spectrum)

    if req.scale == "logaritmica":
        peak = max(mag_lin.max(), 1e-12)
        mag = 20 * np.log10((mag_lin + 1e-12) / peak)
        mag = np.maximum(mag, -80.0)
    else:
        mag = mag_lin

    return SpectralResult(
        time_signal=time_signal,
        omega=freqs,
        magnitude=mag,
        magnitude_linear=mag_lin,
        phase=phase,
        normalized_freq=2 * np.pi * req.analog_freq / req.sampling_freq,
    )
