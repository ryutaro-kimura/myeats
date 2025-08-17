// Next.js App Router API route for Google Maps Places Text Search API (v1)
// POST /api/text-search  with JSON body
//   { textQuery: string, pageSize?: number, pageToken?: string, languageCode?: string,
//     locationBias?: { circle?: { center: { latitude: number, longitude: number }, radius: number }}}
// GET /api/text-search?q=...&language=ja&pageSize=5&lat=35.68&lng=139.76&radius=500
//   Convenience GET that builds a POST payload behind the scenes

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
].join(',');

async function callTextSearch(payload: unknown, fields: string, apiKey: string): Promise<Response> {
  const upstream = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fields,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await upstream.text();

  if (!upstream.ok) {
    let details: unknown;
    try {
      details = JSON.parse(text);
    } catch {
      details = text;
    }
    return Response.json(
      { error: 'Upstream Places Text Search API error', status: upstream.status, details },
      { status: upstream.status }
    );
  }

  try {
    const data = JSON.parse(text);
    return Response.json(data, { status: 200 });
  } catch {
    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
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
      return Response.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { textQuery, pageSize, pageToken, languageCode = 'ja', locationBias } = body;

    if (!textQuery || typeof textQuery !== 'string') {
      return Response.json(
        { error: 'Missing or invalid required field: textQuery' },
        { status: 400 }
      );
    }

    // Clamp pageSize to a reasonable range (API allows up to 20)
    const safePageSize = typeof pageSize === 'number' ? Math.max(1, Math.min(20, Math.floor(pageSize))) : undefined;

    const payload: any = { textQuery, languageCode };
    if (safePageSize) payload.pageSize = safePageSize;
    if (pageToken && typeof pageToken === 'string') payload.pageToken = pageToken;
    if (locationBias && typeof locationBias === 'object') payload.locationBias = locationBias;

    const url = new URL(req.url);
    const fields = url.searchParams.get('fields') || DEFAULT_FIELDS;

    return await callTextSearch(payload, fields, apiKey);
  } catch (err) {
    console.error('[text-search] Unexpected error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Server misconfiguration: GOOGLE_MAPS_API_KEY is not set' },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const q = url.searchParams.get('q');
    const language = url.searchParams.get('language') || 'ja';
    const pageSizeParam = url.searchParams.get('pageSize');
    const pageToken = url.searchParams.get('pageToken') || undefined;
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const radius = url.searchParams.get('radius');
    const fields = url.searchParams.get('fields') || DEFAULT_FIELDS;

    if (!q) {
      return Response.json(
        { error: 'Missing required query parameter: q' },
        { status: 400 }
      );
    }

    let locationBias: any | undefined = undefined;
    if (lat && lng && radius) {
      const latNum = Number(lat);
      const lngNum = Number(lng);
      const radiusNum = Number(radius);
      if (Number.isFinite(latNum) && Number.isFinite(lngNum) && Number.isFinite(radiusNum)) {
        locationBias = {
          circle: {
            center: { latitude: latNum, longitude: lngNum },
            radius: radiusNum,
          },
        };
      }
    }

    const safePageSize = pageSizeParam ? Math.max(1, Math.min(20, Math.floor(Number(pageSizeParam)))) : undefined;

    const payload: any = { textQuery: q, languageCode: language };
    if (safePageSize) payload.pageSize = safePageSize;
    if (pageToken) payload.pageToken = pageToken;
    if (locationBias) payload.locationBias = locationBias;

    return await callTextSearch(payload, fields, apiKey);
  } catch (err) {
    console.error('[text-search] Unexpected error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
