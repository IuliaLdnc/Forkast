import { useEffect, useMemo, useState } from 'react';
import { searchOnline } from '../api/openFoodFacts';
import { FoodProduct, mergeResults, searchFoods } from '../domain/foods';

const DEBOUNCE_MS = 450;
const MIN_ONLINE_QUERY = 2;

// Instant local search plus a debounced Open Food Facts lookup. Online
// results belong to the query they were fetched for: they are cleared as soon
// as the query changes, and late responses for an old query are dropped.
export function useFoodSearch(query: string, catalog: FoodProduct[]) {
  const [online, setOnline] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const local = useMemo(() => searchFoods(query, catalog), [query, catalog]);

  useEffect(() => {
    const q = query.trim();
    setOnline([]);
    if (q.length < MIN_ONLINE_QUERY) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      searchOnline(q).then(found => {
        if (cancelled) return;
        setOnline(found);
        setLoading(false);
      });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const results = useMemo(() => mergeResults(local, online), [local, online]);
  const noResults = query.trim().length >= MIN_ONLINE_QUERY && !loading && results.length === 0;

  return { results, loading, noResults };
}
