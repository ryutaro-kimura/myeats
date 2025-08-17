'use client';

import React from 'react';
import { PlaceCard } from '@/components/PlaceCard';
import type { ApiResultItem } from '@/types/place';
import { parseCsvTitles } from '@/lib/csv';

export default function PlacesPage() {
  const [query, setQuery] = React.useState('');
  const [filterOpenNow, setFilterOpenNow] = React.useState<'all' | 'open' | 'closed'>('all');
  const [items, setItems] = React.useState<ApiResultItem[]>([]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [importError, setImportError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const filtered = items.filter((it) => {
    const t = (it.details?.displayName?.text || it.name || '').toLowerCase();
    const okQuery = query ? t.includes(query.toLowerCase()) : true;
    const openNow = it.details?.currentOpeningHours?.openNow;
    const okOpenNow = filterOpenNow === 'all' ? true : filterOpenNow === 'open' ? openNow === true : openNow === false;
    return okQuery && okOpenNow;
  });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImportError('');
    setImporting(true);
    try {
      const text = await files[0].text();
      const titles = parseCsvTitles(text);
      if (titles.length === 0) {
        setImportError('CSV が空か、タイトルが取得できません');
        return;
      }
      const res = await fetch('/api/name-to-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: titles, prefecture: 'fukuoka', language: 'ja' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setImportError((data as any)?.error || 'API エラー');
        return;
      }
      const okResults = Array.isArray((data as any)?.results) ? (data as any).results as ApiResultItem[] : [];
      setItems(okResults);
      setModalOpen(false);
    } catch (e) {
      console.error('[places] import error', e);
      setImportError('取り込みに失敗しました');
    } finally {
      setImporting(false);
      setDragOver(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Places</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          CSV からインポート
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワード検索"
          className="border rounded px-3 py-2 w-64"
        />
        <select
          value={filterOpenNow}
          onChange={(e) => setFilterOpenNow(e.target.value as any)}
          className="border rounded px-2 py-2"
        >
          <option value="all">すべて</option>
          <option value="open">営業中</option>
          <option value="closed">営業時間外</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600">データがありません。CSV からインポートしてください。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <PlaceCard key={item.placeId || item.name} item={item} />
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">CSV をインポート</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              className={
                'border-2 border-dashed rounded p-8 text-center ' +
                (dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300')
              }
            >
              <p className="mb-3">ここにファイルをドラッグ＆ドロップ</p>
              <p className="text-sm text-gray-600 mb-4">または</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleFiles(e.target.files)}
                className="block"
              />
            </div>

            {importError && <p className="text-red-600 mt-3">{importError}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-3 py-2 rounded border">キャンセル</button>
              <button disabled className="px-3 py-2 rounded bg-blue-600 text-white opacity-50 cursor-not-allowed">
                {importing ? '取り込み中…' : '取り込み'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
