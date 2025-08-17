export type Prefecture = 'tokyo' | 'fukuoka';

const PREF_BIAS: Record<Prefecture, { center: { latitude: number; longitude: number }; radius: number }> = {
  tokyo: { center: { latitude: 35.6762, longitude: 139.6503 }, radius: 25000 },
  fukuoka: { center: { latitude: 33.5902, longitude: 130.4017 }, radius: 15000 },
};

export async function textSearch(
  query: string,
  languageCode: string,
  prefecture: Prefecture,
  apiKey: string
) {
  const bias = PREF_BIAS[prefecture];
  const payload = {
    textQuery: query,
    languageCode,
    pageSize: 1,
    locationBias: {
      circle: {
        center: bias.center,
        radius: bias.radius,
      },
    },
  };

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const text = await res.text();
  if (!res.ok) {
    let details: unknown = text;
    try { details = JSON.parse(text); } catch {}
    throw { type: 'text-search', status: res.status, details };
  }
  let json: any;
  try { json = JSON.parse(text); } catch { json = {}; }
  const place = Array.isArray(json?.places) && json.places.length > 0 ? json.places[0] : null;
  return place;
}

export async function placeDetails(
  placeId: string,
  languageCode: string,
  fields: string,
  apiKey: string
) {
  const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${encodeURIComponent(languageCode)}`;
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fields,
    },
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) {
    let details: unknown = text;
    try { details = JSON.parse(text); } catch {}
    throw { type: 'place-details', status: res.status, details };
  }
  try { return JSON.parse(text); } catch { return text; }
}
