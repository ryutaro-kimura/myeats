// Next.js App Router API route for Google Maps Place Details API
// GET /api/place-details?placeId=...&language=ja&fields=id,displayName,formattedAddress

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'internationalPhoneNumber',
  'currentOpeningHours',
  'reviews',
].join(',');

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const placeId = url.searchParams.get('placeId');
    const language = url.searchParams.get('language') || 'ja';
    const fields = url.searchParams.get('fields') || DEFAULT_FIELDS;

    if (!placeId) {
      return Response.json(
        { error: 'Missing required query parameter: placeId' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Server misconfiguration: GOOGLE_MAPS_API_KEY is not set' },
        { status: 500 }
      );
    }

    const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(
      placeId
    )}?languageCode=${encodeURIComponent(language)}`;

    const upstream = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fields,
      },
      // Disable Next.js fetch caching for dynamic responses
      cache: 'no-store',
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      // Try to pass through upstream error details when possible
      let details: unknown;
      try {
        details = JSON.parse(text);
      } catch {
        details = text;
      }
      return Response.json(
        {
          error: 'Upstream Places API error',
          status: upstream.status,
          details,
        },
        { status: upstream.status }
      );
    }

    // Successful JSON payload
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      // If Google returns non-JSON, pass raw text
      return new Response(text, {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    return Response.json(data, { status: 200 });
  } catch (err) {
    console.error('[place-details] Unexpected error:', err);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
