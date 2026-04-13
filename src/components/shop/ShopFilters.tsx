"use client";
import { useRouter, useSearchParams } from "next/navigation";

interface ShopFiltersProps {
  currentFilters: {
    category?: string;
    fabric?: string;
    price?: string;
    occasion?: string;
    sort?: string;
  };
}

export default function ShopFilters({ currentFilters }: ShopFiltersProps) {
  const router = useRouter();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams();
    Object.entries({ ...currentFilters, [key]: value }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-border-light rounded p-5 mb-8 flex gap-6 flex-wrap items-center">
      {[
        { label: "Category", key: "category", options: [["", "All Categories"], ["silk", "Silk Sarees"], ["cotton", "Cotton Sarees"], ["bridal", "Bridal"], ["party", "Party Wear"], ["everyday", "Everyday"]] },
        { label: "Fabric", key: "fabric", options: [["", "All Fabrics"], ["silk", "Pure Silk"], ["cotton", "Cotton"], ["chanderi", "Chanderi"], ["linen", "Linen"], ["tussar", "Tussar"]] },
        { label: "Price Range", key: "price", options: [["", "Any Price"], ["under2000", "Under ₹2,000"], ["2000-5000", "₹2,000–₹5,000"], ["5000-10000", "₹5,000–₹10,000"], ["above10000", "Above ₹10,000"]] },
        { label: "Occasion", key: "occasion", options: [["", "All Occasions"], ["bridal", "Bridal"], ["festive", "Festive"], ["party", "Party"], ["everyday", "Everyday"]] },
        { label: "Sort By", key: "sort", options: [["", "Newest First"], ["price_asc", "Price: Low to High"], ["price_desc", "Price: High to Low"]] },
      ].map(({ label, key, options }) => (
        <div key={key}>
          <label className="block text-[10px] tracking-widest uppercase text-light mb-1.5 font-medium">{label}</label>
          <select
            value={currentFilters[key as keyof typeof currentFilters] || ""}
            onChange={(e) => update(key, e.target.value)}
            className="text-sm text-dark bg-cream border border-border rounded-sm px-3 py-2 min-w-[130px] outline-none focus:border-gold">
            {options.map(([val, lab]) => (
              <option key={val} value={val}>{lab}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
