const items = [
  { icon: "🚚", text: "Free Shipping Above ₹2,000" },
  { icon: "↩", text: "Easy 7-Day Returns" },
  { icon: "✓", text: "100% Authentic Weaves" },
  { icon: "🔒", text: "Secure Payments" },
  { icon: "📞", text: "COD Available" },
];

export default function TrustStrip() {
  return (
    <div style={{background:"#6B1A2A",borderTop:"none"}}>
      <div className="max-w-[1280px] mx-auto px-2 md:px-10 grid grid-cols-2 md:grid-cols-5">
        {items.map((item, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-4 md:px-6 py-4 ${i < items.length - 1 ? "border-r border-white/10" : ""}`}>
            <span style={{fontSize:"14px",flexShrink:0,opacity:0.9}}>{item.icon}</span>
            <span style={{fontSize:"11px",color:"rgba(255,255,255,0.75)",letterSpacing:"0.5px"}}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
