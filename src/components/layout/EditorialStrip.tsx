export default function EditorialStrip() {
  return (
    <div className="py-20 px-4 md:px-10 text-center" style={{ background: "#2C2420" }}>
      <div className="max-w-[700px] mx-auto">
        <p className="font-serif text-[clamp(22px,3vw,34px)] font-light text-cream leading-[1.6] italic mb-5">
          "Every saree we carry is handpicked directly from the weaver's loom — a promise of authenticity that no factory can replicate."
        </p>
        <div className="text-[11px] tracking-[2px] uppercase text-gold-light">— The Zarika Studio Promise</div>
      </div>
    </div>
  );
}
