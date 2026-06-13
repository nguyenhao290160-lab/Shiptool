// Utilities for exporting reports: JSON and CSV

export function generateReportFileName(prefix = 'shiproute-report', ext = 'json') {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.${ext}`;
}

export function downloadTextFile(content: string, filename: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) return '';
  const s = String(value).replace(/"/g, '""');
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return `"${s}"`;
  }
  return s;
}

export function exportReportJson(obj: unknown, filename?: string) {
  const name = filename ?? generateReportFileName('shiproute-report', 'json');
  const content = JSON.stringify(obj, null, 2);
  downloadTextFile(content, name, 'application/json;charset=utf-8');
}

export function exportReportCsv(rows: Record<string, unknown>[], headers: string[], filename?: string) {
  const name = filename ?? generateReportFileName('shiproute-report', 'csv');
  const lines = [headers.join(',')];
  for (const r of rows) {
    const line = headers.map((h) => escapeCsvValue(r[h] ?? '')).join(',');
    lines.push(line);
  }
  const content = lines.join('\n');
  downloadTextFile(content, name, 'text/csv;charset=utf-8;');
}
