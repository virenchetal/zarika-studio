import ProductCard from "./ProductCard";
import { Product } from "@/types/database";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-mid">
        <p className="font-serif text-2xl text-dark mb-3">No products found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
