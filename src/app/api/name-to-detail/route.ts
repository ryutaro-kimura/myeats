// Next.js App Router API route to resolve place details from a list of names
// POST /api/places/resolve-details
// Body: {
//   names: string[],
//   prefecture: 'tokyo' | 'fukuoka',
//   language?: string, // default 'ja'
//   textSearchFields?: string, // override X-Goog-FieldMask for Text Search
//   detailsFields?: string // override X-Goog-FieldMask for Place Details (reviews excluded by default)
// }

import { textSearch, placeDetails } from '@/lib/googlePlaces';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Exclude reviews by default per request
const DETAILS_DEFAULT_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'userRatingCount',
  'location',
].join(',');

// Simple concurrency with batching
async function processInBatches<T>(items: T[], batchSize: number, fn: (item: T) => Promise<any>) {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(fn));
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

    // const detFields = '*'

    const BATCH = 5; // concurrency limit

    const settled = await processInBatches(
      names as string[],
      BATCH,
      async (name) => {
        try {
          const place = await textSearch(name, language, prefecture, apiKey);
          if (!place?.id) {
            return {
              status: 'rejected',
              reason: { name, message: 'No place found', stage: 'text-search' },
            };
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
          };
        } catch (e: any) {
          return {
            status: 'rejected',
            reason: { name, message: e?.message || 'Request failed', stage: e?.type || 'unknown', details: e?.details },
          };
        }
      }
    );

    const results: any[] = [];
    const errors: any[] = [];
    for (const item of settled) {
      if (item.status === 'fulfilled') {
        // our fn returns an object with status and value/reason, unwrap accordingly
        const payload = item.value;
        if (payload?.status === 'fulfilled') results.push(payload.value);
        else if (payload?.status === 'rejected') errors.push(payload.reason);
      } else {
        errors.push({ message: 'Unhandled rejection' });
      }
    }

    return Response.json({ results, errors }, { status: 200 });
  } catch (err) {
    console.error('[resolve-details] Unexpected error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
