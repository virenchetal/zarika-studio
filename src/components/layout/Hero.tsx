export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{background:"#FAF8F3",minHeight:"88vh",display:"flex",alignItems:"center"}}>
      {/* Subtle pattern */}
      <div className="absolute inset-0" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23B8973C' fill-opacity='0.04'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,backgroundSize:"60px"}} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-10 w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center py-16 md:py-20">

          {/* Left - Text */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div style={{width:"32px",height:"1px",background:"#B8973C"}} />
              <span style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#B8973C"}}>The Finest Sarees, Curated</span>
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(52px,5.5vw,82px)",fontWeight:300,color:"#1A1210",lineHeight:1.05,marginBottom:"24px"}}>
              Draped in<br />
              <em style={{color:"#6B1A2A",fontStyle:"italic"}}>Timeless</em><br />
              Elegance
            </h1>
            <p style={{fontSize:"15px",color:"#6B635C",lineHeight:1.9,marginBottom:"40px",maxWidth:"420px",fontWeight:300}}>
              Handpicked sarees from master weavers across India — from lustrous Kanjivaram silks to breezy summer cottons. Each piece is a story of craft and heritage.
            </p>
            <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"48px"}}>
              <a href="/shop" style={{background:"#6B1A2A",color:"white",padding:"16px 36px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none",fontWeight:500,transition:"all 0.2s"}}>
                Explore Collection
              </a>
              <a href="/shop?sort=newest" style={{border:"1px solid #6B1A2A",color:"#6B1A2A",padding:"16px 36px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none",transition:"all 0.2s"}}>
                New Arrivals
              </a>
            </div>
            <div style={{display:"flex",gap:"40px",paddingTop:"32px",borderTop:"1px solid #EDE6DC"}}>
              {[["500+","Curated Styles"],["48","Master Weavers"],["4.9★","Customer Rating"]].map(([num,label])=>(
                <div key={label}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",color:"#6B1A2A",fontWeight:400}}>{num}</div>
                  <div style={{fontSize:"11px",color:"#A09890",letterSpacing:"0.5px",marginTop:"4px"}}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Editorial image grid */}
          <div className="hidden md:grid" style={{gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:"12px",height:"540px"}}>
            {/* Large left card */}
            <div style={{gridRow:"1 / 3",borderRadius:"4px",overflow:"hidden",position:"relative",background:"linear-gradient(160deg,#C4416A,#8B1A35)"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,4,8,0.75) 0%,transparent 50%)"}} />
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px"}}>
                <div style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:"#D4AF62",marginBottom:"6px"}}>Bridal</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",color:"white",fontWeight:300}}>Kanjivaram Silk</div>
              </div>
            </div>
            {/* Top right */}
            <div style={{borderRadius:"4px",overflow:"hidden",position:"relative",background:"linear-gradient(160deg,#2E6AAD,#1A3D6B)"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,4,8,0.75) 0%,transparent 60%)"}} />
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px"}}>
                <div style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:"#D4AF62",marginBottom:"4px"}}>Party</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",color:"white",fontWeight:300}}>Banarasi</div>
              </div>
            </div>
            {/* Bottom right */}
            <div style={{borderRadius:"4px",overflow:"hidden",position:"relative",background:"linear-gradient(160deg,#3A9650,#1E5C2E)"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(15,4,8,0.75) 0%,transparent 60%)"}} />
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px"}}>
                <div style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:"#D4AF62",marginBottom:"4px"}}>Daily</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",color:"white",fontWeight:300}}>Cotton Ikkat</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
