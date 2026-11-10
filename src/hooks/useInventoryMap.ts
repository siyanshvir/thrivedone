import { useQuery } from "@tanstack/react-query";

/** Fetches all inventory from D1 and returns a sku→stock_left map. */
export function useInventoryMap(): Record<string, number> {
  const { data = [] } = useQuery<{ sku: string; stock_left: number }[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await fetch("/api/inventory");
      const json = await res.json() as any;
      return json.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const map: Record<string, number> = {};
  data.forEach((item) => {
    if (item.sku) map[item.sku] = item.stock_left ?? 0;
  });
  return map;
}

/** Returns a label + Tailwind colour classes for a given stock count. */
export function stockBadge(stockLeft: number | undefined): {
  label: string;
  dot: string;
  text: string;
  bg: string;
} | null {
  if (stockLeft === undefined) return null;
  const n = Number(stockLeft);
  if (n < 0)  return { label: "Backordered",      dot: "bg-purple-400", text: "text-purple-300", bg: "bg-purple-400/15 border-purple-400/30" };
  if (n === 0) return { label: "Out of Stock",     dot: "bg-red-500",    text: "text-red-400",    bg: "bg-red-500/15 border-red-500/30" };
  if (n <= 5)  return { label: "Almost Out",       dot: "bg-orange-400", text: "text-orange-300", bg: "bg-orange-400/15 border-orange-400/30" };
  if (n <= 15) return { label: "Low Stock",        dot: "bg-amber-400",  text: "text-amber-300",  bg: "bg-amber-400/15 border-amber-400/30" };
  return       { label: "In Stock",               dot: "bg-green-400",  text: "text-green-300",  bg: "bg-green-400/15 border-green-400/30" };
}
