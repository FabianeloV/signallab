/** Dispara la descarga de una cadena de texto como archivo. */
export function downloadText(
  content: string,
  filename: string,
  mime = 'application/json',
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Serializa un objeto a JSON con sangría y lo descarga. */
export function downloadJson(data: unknown, filename: string): void {
  downloadText(JSON.stringify(data, null, 2), filename, 'application/json');
}
