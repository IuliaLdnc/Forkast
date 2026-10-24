import { FoodProduct, ONLINE_ID_PREFIX } from '../domain/foods';

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const USER_AGENT = 'Forkast/1.0 (recipe app)';
const TIMEOUT_MS = 10000;

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: Record<string, unknown>;
};

const num = (v: unknown): number => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.round(x * 10) / 10 : 0;
};

// Maps an Open Food Facts product to ours; products without a name or a
// positive calorie value are skipped.
export function toFoodProduct(prod: OffProduct): FoodProduct | null {
  const name = String(prod.product_name ?? '').trim();
  const nutr = prod.nutriments ?? {};
  const kcal = Number(nutr['energy-kcal_100g']);
  if (!name || !Number.isFinite(kcal) || kcal <= 0) return null;
  return {
    id: `${ONLINE_ID_PREFIX}${prod.code ?? name}`,
    name: { en: name, ru: name },
    brand: String(prod.brands ?? '')
      .split(',')[0]
      .trim(),
    per100: {
      kcal: Math.round(kcal),
      protein: num(nutr.proteins_100g),
      fat: num(nutr.fat_100g),
      carbs: num(nutr.carbohydrates_100g),
    },
  };
}

// Searches the Open Food Facts catalogue. Network errors yield no results:
// online search only supplements the local catalogue.
export async function searchOnline(query: string, limit = 15): Promise<FoodProduct[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url =
    `${SEARCH_URL}?search_terms=${encodeURIComponent(q)}` +
    `&search_simple=1&action=process&json=1&page_size=${limit}` +
    '&fields=code,product_name,brands,nutriments';
  // Without a timeout a stalled connection would keep "Searching…" forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: OffProduct[] };
    return (data.products ?? []).map(toFoodProduct).filter((f): f is FoodProduct => f !== null);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
