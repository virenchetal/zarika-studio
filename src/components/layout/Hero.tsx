export default function Hero() {
  return (
    <section className="min-h-[92vh] flex items-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F0609 0%, #2D0F1A 40%, #1A0A10 100%)" }}>
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23B8973C' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3Ccircle cx='60' cy='20' r='1.5'/%3E%3Ccircle cx='20' cy='60' r='1.5'/%3E%3Ccircle cx='60' cy='60' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center relative z-10 py-10 md:py-16">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold" />
            <span className="text-[11px] tracking-[3px] uppercase text-gold-light">The Finest Sarees, Curated</span>
          </div>
          <h1 className="font-serif text-[clamp(48px,5.5vw,80px)] font-light text-cream leading-[1.05] mb-7">
            Draped in<br />
            <em className="text-gold-light italic">Timeless</em><br />
            Elegance
          </h1>
          <p className="text-white/50 text-[15px] leading-[1.9] mb-10 font-light max-w-[420px]">
            Discover handpicked sarees from the finest weavers across India — from lustrous Kanjivaram silks to breezy summer cottons. Each piece is a story of craft and heritage.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="/shop" className="bg-gold text-charcoal px-9 py-4 text-[11px] tracking-[2px] uppercase font-medium hover:bg-gold-light transition-colors">
              Explore Collection
            </a>
            <a href="/#new-arrivals" className="border border-white/25 text-cream px-9 py-4 text-[11px] tracking-[2px] uppercase hover:border-gold-light hover:text-gold-light transition-colors">
              New Arrivals
            </a>
          </div>
          <div className="flex gap-10 mt-12 pt-8 border-t border-white/10">
            {[["500+", "Curated Styles"], ["48", "Master Weavers"], ["4.9★", "Customer Rating"]].map(([num, label]) => (
              <div key={label}>
                <div className="font-serif text-[28px] text-gold-light font-light">{num}</div>
                <div className="text-[11px] text-white/35 tracking-wide mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden md:grid grid-cols-2 gap-3 h-[520px]">
          <div className="rounded col-span-1 row-span-2 relative overflow-hidden" style={{ background: "linear-gradient(145deg, #8B1A35, #C4416A)" }}>
            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: "linear-gradient(to top, rgba(15,6,9,0.85), transparent)" }}>
              <div className="text-[10px] tracking-[1.5px] uppercase text-gold-light">Bridal</div>
              <div className="font-serif text-lg text-cream mt-1">Kanjivaram Silk</div>
            </div>
          </div>
          <div className="rounded relative overflow-hidden" style={{ background: "linear-gradient(145deg, #1A3D6B, #2E6AAD)" }}>
            <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, rgba(15,6,9,0.85), transparent)" }}>
              <div className="text-[10px] tracking-[1.5px] uppercase text-gold-light">Party</div>
              <div className="font-serif text-base text-cream mt-0.5">Banarasi</div>
            </div>
          </div>
          <div className="rounded relative overflow-hidden" style={{ background: "linear-gradient(145deg, #1E5C2E, #3A9650)" }}>
            <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, rgba(15,6,9,0.85), transparent)" }}>
              <div className="text-[10px] tracking-[1.5px] uppercase text-gold-light">Daily</div>
              <div className="font-serif text-base text-cream mt-0.5">Cotton Ikkat</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
