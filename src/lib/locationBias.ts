export interface LocationBiasConfig {
  center: { latitude: number; longitude: number };
  radius: number; // meters
}

// Extendable mapping for prefecture-based location bias.
// Keys are lowercased identifiers (e.g., 'tokyo', 'fukuoka').
export const PREFECTURE_BIAS: Record<string, LocationBiasConfig> = {
  tokyo: { center: { latitude: 35.6762, longitude: 139.6503 }, radius: 25000 },
  fukuoka: { center: { latitude: 33.5902, longitude: 130.4017 }, radius: 15000 },
};

export function resolvePrefectureBias(key: string | null | undefined): LocationBiasConfig | null {
  if (!key || typeof key !== 'string') return null;
  const normalized = key.trim().toLowerCase();
  return PREFECTURE_BIAS[normalized] || null;
}

export function getSupportedPrefectureKeys(): string[] {
  return Object.keys(PREFECTURE_BIAS);
}
