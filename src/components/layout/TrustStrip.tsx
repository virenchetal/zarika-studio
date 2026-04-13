const items = [
  { icon: "🚚", text: "Free Shipping Above ₹2,000" },
  { icon: "↩", text: "Easy 7-Day Returns" },
  { icon: "✓", text: "100% Authentic Weaves" },
  { icon: "🔒", text: "Secure Payments" },
  { icon: "📞", text: "COD Available" },
];

export default function TrustStrip() {
  return (
    <div className="bg-white border-y border-border-light overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-2 md:px-10 grid grid-cols-2 md:grid-cols-5">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 md:px-6 py-4 text-xs text-mid tracking-wide ${i < items.length - 1 ? "border-r border-border-light" : ""}`}>
            <span className="text-base shrink-0">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
