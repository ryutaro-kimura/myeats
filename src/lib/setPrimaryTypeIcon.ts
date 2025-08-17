const MAP: Record<string, string | string[]> = {
  acai_shop: '🥤',
  afghani_restaurant: '🥘',
  african_restaurant: '🥘',
  american_restaurant: '🍔',
  asian_restaurant: '🥢',
  bagel_shop: '🥯',
  bakery: '🥐',
  bar: '🍸',
  bar_and_grill: '🍖',
  barbecue_restaurant: '🍖',
  brazilian_restaurant: '🥩',
  breakfast_restaurant: '🍳',
  brunch_restaurant: '🥞',
  buffet_restaurant: '🍽️',
  cafe: '☕',
  cafeteria: '🍽️',
  candy_store: '🍬',
  cat_cafe: '🐱',
  chinese_restaurant: '🥟',
  chocolate_factory: '🍫',
  chocolate_shop: '🍫',
  coffee_shop: '☕',
  confectionery: '🍰',
  deli: '🥪',
  dessert_restaurant: '🍰',
  dessert_shop: '🍨',
  diner: '🍽️',
  dog_cafe: '🐶',
  donut_shop: '🍩',
  fast_food_restaurant: '🍟',
  fine_dining_restaurant: '🍷',
  food_court: '🛍️',
  french_restaurant: '🥖',
  greek_restaurant: '🥙',
  hamburger_restaurant: '🍔',
  ice_cream_shop: '🍨',
  indian_restaurant: '🍛',
  indonesian_restaurant: '🍛',
  italian_restaurant: '🍝',
  japanese_restaurant: ['🍱', '🍣', '🍶'],
  juice_shop: '🧃',
  korean_restaurant: '🥘',
  lebanese_restaurant: '🧆',
  meal_delivery: '🚚',
  meal_takeaway: '🥡',
  mediterranean_restaurant: '🫒',
  mexican_restaurant: ['🌮', '🌯', '🥑'],
  middle_eastern_restaurant: '🧆',
  pizza_restaurant: ['🍕', '🧀'],
  pub: ['🍻', '🍺'],
  ramen_restaurant: ['🍜', '🥟', '🥚'],
  restaurant: '🍽️',
  sandwich_shop: '🥪',
  seafood_restaurant: ['🐟', '🦐', '🦑'],
  spanish_restaurant: '🥘',
  steak_house: ['🥩', '🍷'],
  sushi_restaurant: ['🍣', '🍶', '🐟'],
  tea_house: '🫖',
  thai_restaurant: ['🌶️', '🍜'],
  turkish_restaurant: '🥙',
  vegan_restaurant: ['🥗', '🌿'],
  vegetarian_restaurant: ['🥗', '🥦'],
  vietnamese_restaurant: ['🍜', '🥟', '🥬'],
  wine_bar: ['🍷', '🧀'],
};

export function iconsForPrimaryType(primaryType?: string): string[] {
  if (!primaryType) return [];
  const key = primaryType.trim().toLowerCase();
  const value = MAP[key] ?? '🍽️';
  const arr = Array.isArray(value) ? value : [value];
  // unique and max 3
  return Array.from(new Set(arr)).slice(0, 3);
}

// Backward compatibility export (deprecated)
export function iconForprimaryTypeDisplayName(primaryType?: string): string {
  const icons = iconsForPrimaryType(primaryType);
  return icons[0] ?? '';
}
