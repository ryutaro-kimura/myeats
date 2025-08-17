import React from 'react';
import type { ApiResultItem } from '@/types/place';
import Link from 'next/link';
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

export function PlaceCard({ item }: { item: ApiResultItem }) {
  const d = item.details;
  const icons = iconsForPrimaryType(d?.primaryType);
  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {d?.displayName?.text || item.name}
          </h3>
          {d?.shortFormattedAddress && (
            <p className="text-sm text-gray-600">{d.shortFormattedAddress}</p>
          )}
          {d?.primaryTypeDisplayName?.text && (
            <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
              {icons.map((ic, i) => (
                <span key={i} aria-hidden>{ic}</span>
              ))}
              <span>{d.primaryTypeDisplayName.text}</span>
            </p>
          )}
          {typeof d?.rating === 'number' && (
            <p className="text-sm text-gray-800 mt-1">
              {d.rating.toFixed(1)}{typeof d?.userRatingCount === 'number' ? ` (${d.userRatingCount})` : ''}
            </p>
          )}
          {typeof d?.currentOpeningHours?.openNow === 'boolean' && (
            <p className={d.currentOpeningHours.openNow ? 'text-green-700 text-sm mt-1' : 'text-red-700 text-sm mt-1'}>
              {d.currentOpeningHours.openNow ? '営業中' : '営業時間外'}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
            {statusLabel(d?.businessStatus)}
          </span>
          <div className="flex gap-3">
            {item.placeId && (
              <Link
                className="text-blue-600 text-sm hover:underline"
                href={`/places/${item.placeId}?name=${encodeURIComponent(item.name)}${d?.shortFormattedAddress ? `&addr=${encodeURIComponent(d.shortFormattedAddress)}` : ''}${d?.primaryType ? `&type=${encodeURIComponent(d.primaryType)}` : ''}${typeof d?.rating === 'number' ? `&rating=${encodeURIComponent(String(d.rating))}` : ''}${typeof d?.userRatingCount === 'number' ? `&ratings=${encodeURIComponent(String(d.userRatingCount))}` : ''}${typeof d?.currentOpeningHours?.openNow === 'boolean' ? `&open=${d.currentOpeningHours.openNow ? '1' : '0'}` : ''}${d?.businessStatus ? `&status=${encodeURIComponent(d.businessStatus)}` : ''}${d?.googleMapsUri ? `&maps=${encodeURIComponent(d.googleMapsUri)}` : ''}${d?.websiteUri ? `&site=${encodeURIComponent(d.websiteUri)}` : ''}${d?.primaryTypeDisplayName?.text ? `&typeName=${encodeURIComponent(d.primaryTypeDisplayName.text)}` : ''}`}
              >
                詳細
              </Link>
            )}
            {d?.googleMapsUri && (
              <a className="text-blue-600 text-sm hover:underline" href={d.googleMapsUri} target="_blank" rel="noopener noreferrer">Maps</a>
            )}
            {d?.websiteUri && (
              <a className="text-blue-600 text-sm hover:underline" href={d.websiteUri} target="_blank" rel="noopener noreferrer">Website</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
