import { getProducts } from "@/lib/api/products";
import ProductGrid from "@/components/shop/ProductGrid";
import ShopFilters from "@/components/shop/ShopFilters";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    fabric?: string;
    price?: string;
    occasion?: string;
    sort?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  let minPrice, maxPrice;
  if (params.price === "under2000") { maxPrice = 2000; }
  else if (params.price === "2000-5000") { minPrice = 2000; maxPrice = 5000; }
  else if (params.price === "5000-10000") { minPrice = 5000; maxPrice = 10000; }
  else if (params.price === "above10000") { minPrice = 10000; }

  const products = await getProducts({
    category: params.category,
    fabric: params.fabric,
    occasion: params.occasion,
    sort: params.sort,
    minPrice,
    maxPrice,
  });

  return (
    <>
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-4 md:px-10 py-8 md:py-12">
        <div className="text-xs text-mid mb-6">
          <a href="/" className="hover:text-maroon cursor-pointer">Home</a>
          {" › "} All Sarees
        </div>
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-light text-dark">All Sarees</h1>
            <p className="text-sm text-light mt-1.5">{products.length} handpicked styles</p>
          </div>
        </div>
        <ShopFilters currentFilters={params} />
        <ProductGrid products={products} />
      </main>
      <Footer />
    </>
  );
}
