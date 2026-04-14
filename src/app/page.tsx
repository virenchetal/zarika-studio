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

        {/* Craft Story Strip */}
        <section style={{background:"white",padding:"64px 24px"}}>
          <div style={{maxWidth:"1280px",margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"48px",textAlign:"center"}}>
            {[
              {icon:"🧵",title:"Direct from Weavers",desc:"We travel to Kanchipuram, Varanasi & Pochampally to source directly from the artisans who make them."},
              {icon:"✋",title:"Handpicked, Every Piece",desc:"Each saree is individually selected for quality, colour fidelity and craftsmanship before it reaches you."},
              {icon:"📦",title:"Delivered with Care",desc:"Sarees are folded and packed in tissue, boxed carefully so they arrive exactly as they left the weaver's hands."},
            ].map(item=>(
              <div key={item.title}>
                <div style={{fontSize:"32px",marginBottom:"16px"}}>{item.icon}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",color:"#2C2420",marginBottom:"10px",fontWeight:400}}>{item.title}</div>
                <div style={{fontSize:"13px",color:"#A09890",lineHeight:1.8}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

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
