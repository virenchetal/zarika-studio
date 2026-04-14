import { Category } from "@/types/database";

const defaultCollections = [
  { name: "Wedding Collection", tag: "Bridal", desc: "Handwoven silk sarees for your most important day", style: { background: "linear-gradient(160deg,#C4416A,#8B1A35)" }, href: "/shop?occasion=bridal" },
  { name: "Festive Edit", tag: "Festive", desc: "Vibrant weaves for celebrations & gatherings", style: { background: "linear-gradient(160deg,#6B3DA8,#3D1A6B)" }, href: "/shop?occasion=festive" },
  { name: "Everyday Elegance", tag: "Everyday", desc: "Lightweight drapes for daily grace", style: { background: "linear-gradient(160deg,#3A9650,#1E5C2E)" }, href: "/shop?occasion=everyday" },
];

export default function CollectionsGrid({ categories }: { categories: Category[] }) {
  return (
    <>
      <style>{`
        .collections-grid { display:grid; grid-template-columns:1fr; gap:12px; }
        @media(min-width:768px){ .collections-grid { grid-template-columns:1.5fr 1fr 1fr; height:460px; gap:16px; } }
      `}</style>
      <div className="collections-grid">
        {defaultCollections.map((coll, i) => (
          <a key={i} href={coll.href}
            className="group block rounded overflow-hidden relative"
            style={{...coll.style, minHeight: i===0?"280px":"200px"}}>
            <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0)",transition:"background 0.3s"}} className="group-hover:bg-black/10" />
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,4,6,0.8) 0%,rgba(10,4,6,0.1) 60%,transparent 100%)"}} />
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"28px"}}>
              <div style={{fontSize:"9px",letterSpacing:"2.5px",textTransform:"uppercase",color:"#D4AF62",marginBottom:"8px"}}>{coll.tag}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",color:"white",fontWeight:300,marginBottom:"6px"}}>{coll.name}</div>
              <div style={{fontSize:"12px",color:"rgba(255,255,255,0.55)",lineHeight:1.5}}>{coll.desc}</div>
              <div style={{marginTop:"16px",display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(255,255,255,0.7)"}}>Explore</span>
                <span style={{fontSize:"14px",color:"#D4AF62",transform:"translateX(0)",transition:"transform 0.2s"}} className="group-hover:translate-x-1">→</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
