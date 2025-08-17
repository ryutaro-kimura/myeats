import React from 'react';
import type { ApiResultItem } from '@/types/place';
import { iconsForPrimaryType } from '@/lib/setPrimaryTypeIcon';

function statusLabel(status?: string) {
  switch (status) {
    case 'OPERATIONAL':
      return '営業中';
    case 'CLOSED_TEMPORARILY':
      return '臨時休業';
    case 'CLOSED_PERMANENTLY':
      return '閉業';
    default:
      return '不明';
  }
}

export function PlaceDetail({ item }: { item: ApiResultItem }) {
  const d = item.details;
  const icons = iconsForPrimaryType(d?.primaryType);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{d?.displayName?.text || item.name}</h1>
        {d?.shortFormattedAddress && (
          <p className="text-gray-700">{d.shortFormattedAddress}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
          {d?.primaryTypeDisplayName?.text && (
            <span className="inline-flex items-center gap-1">
              {icons.map((ic, i) => (
                <span key={i} aria-hidden>{ic}</span>
              ))}
              <span>{d.primaryTypeDisplayName.text}</span>
            </span>
          )}
          {typeof d?.rating === 'number' && (
            <span>評価 {d.rating.toFixed(1)}{typeof d?.userRatingCount === 'number' ? ` (${d.userRatingCount})` : ''}</span>
          )}
          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100">{statusLabel(d?.businessStatus)}</span>
          {typeof d?.currentOpeningHours?.openNow === 'boolean' && (
            <span className={d.currentOpeningHours.openNow ? 'text-green-700' : 'text-red-700'}>
              {d.currentOpeningHours.openNow ? '営業中' : '営業時間外'}
            </span>
          )}
        </div>
        <div className="mt-2 flex gap-4">
          {d?.googleMapsUri && (
            <a className="text-blue-600 hover:underline" href={d.googleMapsUri} target="_blank" rel="noopener noreferrer">Google Maps</a>
          )}
          {d?.websiteUri && (
            <a className="text-blue-600 hover:underline" href={d.websiteUri} target="_blank" rel="noopener noreferrer">Website</a>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">営業時間</h2>
        {/* 本日 */}
        {typeof d?.currentOpeningHours?.openNow === 'boolean' && (
          <p className="text-sm mb-2">本日: {d.currentOpeningHours.openNow ? '営業中' : '営業時間外'}</p>
        )}
        {/* 曜日別 */}
        {Array.isArray(d?.regularOpeningHours?.weekdayDescriptions) && d!.regularOpeningHours!.weekdayDescriptions!.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {d!.regularOpeningHours!.weekdayDescriptions!.map((w: string, i: number) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
