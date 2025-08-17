'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PlaceDetail } from '@/components/PlaceDetail';
import type { ApiResultItem } from '@/types/place';

// NOTE: データ取得は本来 placeId でサーバーから取得すべきですが、
// ここではモック/検索パラメータからの受け渡しを想定した雛形です。

export default function PlaceDetailPage({ params }: { params: { placeId: string } }) {
  const search = useSearchParams();
  const name = search.get('name') || '';

  const item: ApiResultItem = {
    name,
    placeId: params.placeId,
    details: {
      displayName: { text: name || 'Place' },
      shortFormattedAddress: search.get('addr') || undefined,
      primaryType: search.get('type') || undefined,
      rating: search.get('rating') ? Number(search.get('rating')) : undefined,
      userRatingCount: search.get('ratings') ? Number(search.get('ratings')) : undefined,
      currentOpeningHours: { openNow: search.get('open') ? search.get('open') === '1' : undefined },
      regularOpeningHours: { weekdayDescriptions: [] },
      businessStatus: search.get('status') || undefined,
      googleMapsUri: search.get('maps') || undefined,
      websiteUri: search.get('site') || undefined,
    },
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <PlaceDetail item={item} />
    </main>
  );
}
