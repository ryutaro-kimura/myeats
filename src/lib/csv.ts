// CSV helpers to extract first-column titles
export function getFirstCsvField(line: string): string | null {
  if (!line) return null;
  if (line.charCodeAt(0) === 0xfeff) line = line.slice(1);
  let inQuotes = false;
  let field = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; continue; }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) break;
    field += ch;
  }
  field = field.trim();
  if (field.startsWith('"') && field.endsWith('"')) field = field.slice(1, -1).trim();
  return field.length > 0 ? field : null;
}

export function parseCsvTitles(text: string): string[] {
  const norm = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = norm.split('\n').map((l) => l.trim());
  if (lines.length === 0) return [];
  const dataLines = lines.slice(1).filter((l) => l.length > 0);
  const extracted: string[] = [];
  for (const line of dataLines) {
    const first = getFirstCsvField(line);
    if (first && first !== 'タイトル') extracted.push(first);
  }
  const seen = new Set<string>();
  return extracted.filter((t) => {
    const key = t.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
