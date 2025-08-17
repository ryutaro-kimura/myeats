// Next.js App Router API route to resolve place details from a list of names
// POST /api/name-to-detail
// Body: {
//   names: string[],
//   prefecture: 'tokyo' | 'fukuoka',
//   language?: string, // default 'ja'
//   detailsFields?: string // override X-Goog-FieldMask for Place Details (reviews excluded by default)
// }

import { textSearch, placeDetails } from '@/lib/googlePlaces';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Exclude reviews by default per request
const DETAILS_DEFAULT_FIELDS = [
  'shortFormattedAddress',
  'primaryType',
  'primaryTypeDisplayName',
  'rating',
  'userRatingCount',
  'currentOpeningHours.openNow',
  'regularOpeningHours.weekdayDescriptions',
  'googleMapsUri',
  'websiteUri',
  'businessStatus',
].join(',');

// Simple concurrency with batching (each task handles its own errors)
async function processInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.all(batch.map(fn));
    results.push(...settled);
  }
  return results;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Server misconfiguration: GOOGLE_MAPS_API_KEY is not set' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null) as any | null;
    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { names, prefecture, language = 'ja', detailsFields } = body as {
      names: unknown;
      prefecture: 'tokyo' | 'fukuoka';
      language?: string;
      detailsFields?: string;
    };

    if (!Array.isArray(names) || names.length === 0 || !names.every((n) => typeof n === 'string' && n.trim().length > 0)) {
      return Response.json({ error: 'Invalid field: names must be a non-empty array of strings' }, { status: 400 });
    }
    if (prefecture !== 'tokyo' && prefecture !== 'fukuoka') {
      return Response.json({ error: "Invalid field: prefecture must be 'tokyo' or 'fukuoka'" }, { status: 400 });
    }

    // Ensure reviews are excluded from details
    const detFields = (detailsFields?.trim() || DETAILS_DEFAULT_FIELDS)
      .split(',')
      .map((s) => s.trim())
      .filter((f) => f && f !== 'reviews')
      .join(',');

    const BATCH = 5; // concurrency limit

    const payloads = await processInBatches(
      names as string[],
      BATCH,
      async (name) => {
        try {
          const place = await textSearch(name, language, prefecture, apiKey);
          if (!place?.id) {
            return {
              status: 'rejected',
              reason: { name, message: 'No place found', stage: 'text-search' },
            } as const;
          }
          const details = await placeDetails(place.id, language, detFields, apiKey);
          return {
            status: 'fulfilled',
            value: {
              name,
              placeId: place.id,
              textSearch: place,
              details,
            },
          } as const;
        } catch (e: any) {
          return {
            status: 'rejected',
            reason: { name, message: e?.message || 'Request failed', stage: e?.type || 'unknown', details: e?.details },
          } as const;
        }
      }
    );

    const results: any[] = [];
    const errors: any[] = [];
    for (const payload of payloads) {
      if (payload?.status === 'fulfilled') results.push(payload.value);
      else if (payload?.status === 'rejected') errors.push(payload.reason);
    }

    return Response.json({ results, errors }, { status: 200 });
  } catch (err) {
    console.error('[resolve-details] Unexpected error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
