import { getProducts, getCategories } from "@/lib/api/products";
import Hero from "@/components/layout/Hero";
import TrustStrip from "@/components/layout/TrustStrip";
import CollectionsGrid from "@/components/shop/CollectionsGrid";
import ProductGrid from "@/components/shop/ProductGrid";
import EditorialStrip from "@/components/layout/EditorialStrip";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function HomePage() {
  const [featuredProducts, newArrivals, categories] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    getProducts({ limit: 4, sort: "newest" }),
    getCategories(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />

        {/* Collections */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-10 py-24" id="collections">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[3px] uppercase text-gold mb-3">Browse by Occasion</p>
              <h2 className="font-serif text-4xl font-light text-dark">Our Collections</h2>
            </div>
            <a href="/shop" className="text-[11px] tracking-widest uppercase text-gold border-b border-gold pb-0.5">View All</a>
          </div>
          <CollectionsGrid categories={categories} />
        </section>

        {/* Featured */}
        <section className="bg-cream2 py-24">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[10px] tracking-[3px] uppercase text-gold mb-3">Handpicked for You</p>
                <h2 className="font-serif text-4xl font-light text-dark">Featured Sarees</h2>
              </div>
              <a href="/shop" className="text-[11px] tracking-widest uppercase text-gold border-b border-gold pb-0.5">Shop All</a>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>

        <EditorialStrip />

        {/* New Arrivals */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-10 py-24" id="new-arrivals">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[3px] uppercase text-gold mb-3">Just Landed</p>
              <h2 className="font-serif text-4xl font-light text-dark">New Arrivals</h2>
            </div>
            <a href="/shop" className="text-[11px] tracking-widest uppercase text-gold border-b border-gold pb-0.5">View All New</a>
          </div>
          <ProductGrid products={newArrivals} />
        </section>
      </main>
      <Footer />
    </>
  );
}
