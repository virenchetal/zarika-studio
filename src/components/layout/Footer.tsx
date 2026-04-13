const footerLinks = {
  Shop: [
    { label: "Silk Sarees", href: "/shop?category=silk" },
    { label: "Cotton Sarees", href: "/shop?category=cotton" },
    { label: "Bridal Collection", href: "/shop?category=bridal" },
    { label: "Festive Edit", href: "/shop?occasion=festive" },
    { label: "New Arrivals", href: "/#new-arrivals" },
  ],
  Help: [
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Exchanges", href: "/returns" },
    { label: "Track Your Order", href: "/profile#orders" },
    { label: "Contact Us", href: "/contact" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "#1A1614" }}>
      <div className="max-w-[1280px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <div>
          <div className="font-serif text-xl font-semibold tracking-[3px] text-cream uppercase mb-4">
            Zarika<span className="text-gold font-light"> Studio</span>
          </div>
          <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Handpicked sarees from master weavers across India. Every piece is a work of art, every thread a story.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            📞 +91 63048 24387 · Hyderabad, India
          </p>
        </div>
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <div className="text-[10px] tracking-[2px] uppercase mb-4 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
              {title}
            </div>
            {links.map((link) => (
              <a key={link.label} href={link.href}
                className="block text-sm mb-2 transition-colors hover:text-gold-light"
                style={{ color: "rgba(255,255,255,0.45)" }}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t px-4 md:px-10 py-5 max-w-[1280px] mx-auto flex justify-between items-center text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.2)" }}>
        <span>© 2026 Zarika Studio. All rights reserved.</span>
        <a href="/admin-login" className="hover:opacity-40 transition-opacity" style={{ color: "rgba(255,255,255,0.06)", fontSize: "11px" }}>
          Staff Login
        </a>
      </div>
    </footer>
  );
}
