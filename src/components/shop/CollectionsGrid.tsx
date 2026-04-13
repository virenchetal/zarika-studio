import { Category } from "@/types/database";

const defaultCollections = [
  { name: "Wedding Collection", tag: "Bridal", count: "24 exclusive styles", style: { background: "linear-gradient(145deg, #8B1A35, #C4416A)" }, href: "/shop?category=bridal" },
  { name: "Festive Edit", tag: "Festive", count: "48 vibrant styles", style: { background: "linear-gradient(145deg, #3D1A6B, #6B3DA8)" }, href: "/shop?occasion=festive" },
  { name: "Everyday Elegance", tag: "Everyday", count: "62 casual styles", style: { background: "linear-gradient(145deg, #1E5C2E, #3A9650)" }, href: "/shop?category=everyday" },
];

export default function CollectionsGrid({ categories }: { categories: Category[] }) {
  return (
    <>
    <style>{`
      .collections-grid { grid-template-columns: 1fr; height: auto; }
      @media (min-width: 768px) { .collections-grid { grid-template-columns: 1.4fr 1fr 1fr; height: 480px; } }
    `}</style>
    <div className="grid gap-3 md:gap-4 collections-grid" style={{}}>
      {defaultCollections.map((coll, i) => (
        <a key={i} href={coll.href}
          className="rounded overflow-hidden relative cursor-pointer group block"
          style={coll.style}>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: "linear-gradient(to top, rgba(15,6,9,0.82), transparent)" }}>
            <div className="text-[10px] tracking-[2px] uppercase text-gold-light mb-1.5">{coll.tag}</div>
            <div className="font-serif text-[22px] text-cream font-light">{coll.name}</div>
            <div className="text-xs mt-1" style={{ color: "rgba(250,248,243,0.5)" }}>{coll.count}</div>
          </div>
        </a>
      ))}
    </div>
    </>
  );
}
