export type PlaceDetailsPartial = {
  displayName?: { text?: string; languageCode?: string };
  shortFormattedAddress?: string;
  primaryType?: string;
  primaryTypeDisplayName?: string;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: { openNow?: boolean };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  businessStatus?: string;
  googleMapsUri?: string;
  websiteUri?: string;
};

export type ApiResultItem = {
  name: string;
  placeId?: string;
  textSearch?: unknown;
  details?: PlaceDetailsPartial;
};

export type ApiErrorItem = {
  name?: string;
  message?: string;
  stage?: string;
};
