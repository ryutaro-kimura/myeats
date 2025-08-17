import React from 'react';
import { PlaceDetail } from '@/components/PlaceDetail';
import type { ApiResultItem } from '@/types/place';

export default async function PlaceDetailPage({ params, searchParams }: any) {
  const p = await params;
  const sp = await searchParams;
  const name = (sp?.name as string) || '';

  const item: ApiResultItem = {
    name,
    placeId: p?.placeId as string,
    details: {
      displayName: { text: name || 'Place' },
      shortFormattedAddress: (sp?.addr as string) || undefined,
      primaryType: (sp?.type as string) || undefined,
      primaryTypeDisplayName: sp?.typeName ? { text: sp.typeName as string } : undefined,
      rating: sp?.rating ? Number(sp.rating) : undefined,
      userRatingCount: sp?.ratings ? Number(sp.ratings) : undefined,
      currentOpeningHours: { openNow: sp?.open ? (sp.open as string) === '1' : undefined },
      regularOpeningHours: { weekdayDescriptions: [] },
      businessStatus: (sp?.status as string) || undefined,
      googleMapsUri: (sp?.maps as string) || undefined,
      websiteUri: (sp?.site as string) || undefined,
    },
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <PlaceDetail item={item} />
    </main>
  );
}
