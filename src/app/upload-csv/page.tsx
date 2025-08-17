'use client';

import React from 'react';

function getFirstCsvField(line: string): string | null {
  // Trim BOM and whitespace
  if (!line) return null;
  if (line.charCodeAt(0) === 0xfeff) line = line.slice(1);
  let inQuotes = false;
  let field = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // handle escaped quotes "" within quoted field
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; continue; }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      break; // first field ends before this comma
    }
    field += ch;
  }
  field = field.trim();
  if (field.startsWith('"') && field.endsWith('"')) field = field.slice(1, -1).trim();
  return field.length > 0 ? field : null;
}

// Google Places businessStatus を日本語表示に整形（4パターン）
function formatBusinessStatus(status?: string): string {
  switch (status) {
    case 'OPERATIONAL':
      return '営業中';
    case 'CLOSED_TEMPORARILY':
      return '臨時休業';
    case 'CLOSED_PERMANENTLY':
      return '閉業';
    case 'BUSINESS_STATUS_UNSPECIFIED':
    default:
      return '不明';
  }
}

export default function UploadCsvPage() {
  const [fileName, setFileName] = React.useState<string>('');
  const [titles, setTitles] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string>('');
  const [prefecture, setPrefecture] = React.useState<'tokyo' | 'fukuoka'>('fukuoka');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<any[]>([]);
  const [errors, setErrors] = React.useState<any[]>([]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setTitles([]);
    setResults([]);
    setErrors([]);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const text = await file.text();
      const norm = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lines = norm.split('\n').map((l) => l.trim());
      if (lines.length === 0) {
        setError('CSV が空です');
        return;
      }
      // skip header line(s). Assume first line is header.
      const dataLines = lines.slice(1).filter((l) => l.length > 0);
      const extracted: string[] = [];
      for (const line of dataLines) {
        const first = getFirstCsvField(line);
        if (first && first !== 'タイトル') extracted.push(first);
      }
      // de-duplicate while preserving order
      const seen = new Set<string>();
      const unique = extracted.filter((t) => {
        const key = t.trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setTitles(unique);
    } catch (err: any) {
      console.error('[upload-csv] parse error', err);
      setError('CSV の解析に失敗しました');
    }
  };

  async function runResolve() {
    setError('');
    setResults([]);
    setErrors([]);
    if (titles.length === 0) {
      setError('タイトルがありません。CSV を読み込んでください。');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/name-to-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: titles, prefecture, language: 'ja' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'API エラー');
      } else {
        setResults(Array.isArray(data?.results) ? data.results : []);
        setErrors(Array.isArray(data?.errors) ? data.errors : []);
      }
    } catch (err: any) {
      console.error('[upload-csv] api error', err);
      setError('ネットワークエラー');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto my-10 px-4">
      <h1 className="text-2xl font-bold mb-4">CSV アップロード（タイトル抽出 → API 実行）</h1>
      <p className="mb-3">1列目「タイトル」の値を抽出し、/api/name-to-detail で詳細解決します。</p>

      <label className="inline-block mb-3">
        <input type="file" accept=".csv" onChange={onFileChange} className="block" />
      </label>

      {/* prefecture selector */}
      <div className="mb-3 flex items-center gap-3">
        <label className="text-sm text-gray-700">Prefecture:</label>
        <select
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value as any)}
          className="border rounded px-2 py-1 bg-white"
        >
          <option value="tokyo">tokyo</option>
          <option value="fukuoka">fukuoka</option>
        </select>
        <button
          onClick={runResolve}
          disabled={loading || titles.length === 0}
          className="ml-2 inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '実行中…' : 'API実行'}
        </button>
      </div>

      {fileName && (
        <p className="mb-3">選択ファイル: <strong>{fileName}</strong></p>
      )}

      {error && (
        <p className="text-red-600 mb-3">{error}</p>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">抽出結果</h2>
        <p className="mb-2">件数: {titles.length}</p>
        <ol className="pl-5 list-decimal">
          {titles.map((t, i) => (
            <li key={`${t}-${i}`}>{t}</li>
          ))}
        </ol>
      </div>

      {/* results */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">API 結果</h2>
        <p className="mb-2">成功: {results.length} / 失敗: {errors.length}</p>
        {results.length > 0 && (
          <ul className="pl-5 list-disc space-y-2">
            {results.map((r, idx) => (
              <li key={r?.placeId || idx}>
                <div>
                  <strong>{r?.name}</strong> — placeId: {r?.placeId || '-'}
                </div>
                {r?.details?.displayName?.text && (
                  <div className="text-gray-600">displayName: {r.details.displayName.text}</div>
                )}
                {r?.details?.shortFormattedAddress && (
                  <div className="text-gray-600">shortFormattedAddress: {r.details.shortFormattedAddress}</div>
                )}
                {typeof r?.details?.primaryType === 'string' && (
                  <div className="text-gray-700">primaryType: {r.details.primaryType}</div>
                )}
                {typeof r?.details?.rating === 'number' && (
                  <div className="text-gray-700">rating: {r.details.rating.toFixed(1)}{typeof r?.details?.userRatingCount === 'number' ? ` (${r.details.userRatingCount})` : ''}</div>
                )}
                {typeof r?.details?.currentOpeningHours?.openNow === 'boolean' && (
                  <div className={r.details.currentOpeningHours.openNow ? 'text-green-700' : 'text-red-700'}>
                    {r.details.currentOpeningHours.openNow ? '営業中' : '営業時間外'}
                  </div>
                )}
                {Array.isArray(r?.details?.regularOpeningHours?.weekdayDescriptions) && r.details.regularOpeningHours.weekdayDescriptions.length > 0 && (
                  <div className="mt-1">
                    <div className="text-gray-700">営業時間:</div>
                    <ul className="pl-5 list-disc text-gray-600">
                      {r.details.regularOpeningHours.weekdayDescriptions.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {typeof r?.details?.businessStatus === 'string' && (
                  <div className="text-gray-700">閉業/営業中：{formatBusinessStatus(r.details.businessStatus)}</div>
                )}
                {(r?.details?.googleMapsUri || r?.details?.websiteUri) && (
                  <div className="mt-1 flex flex-wrap gap-3">
                    {r?.details?.googleMapsUri && (
                      <a
                        href={r.details.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google Maps
                      </a>
                    )}
                    {r?.details?.websiteUri && (
                      <a
                        href={r.details.websiteUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {errors.length > 0 && (
          <ul className="pl-5 mt-2 text-red-600 list-disc space-y-1">
            {errors.map((e, idx) => (
              <li key={idx}>
                <strong>{e?.name || '(no name)'}:</strong> {e?.message || 'error'} {e?.stage ? `(${e.stage})` : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
