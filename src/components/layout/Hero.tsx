export default function Hero() {
  const weaveOrigins = ["Kanchipuram", "Varanasi", "Pochampally", "Paithani"];
  const fabrics = ["Silk · Cotton · Linen · Chanderi"];

  return (
    <section style={{background:"#FAF8F3",minHeight:"90vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden"}}>
      {/* Decorative background watermark */}
      <div style={{position:"absolute",right:"-20px",top:"50%",transform:"translateY(-50%)",fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(120px,15vw,200px)",fontWeight:300,color:"rgba(107,26,42,0.04)",lineHeight:1,userSelect:"none",whiteSpace:"nowrap",pointerEvents:"none"}}>
        Zarika
      </div>

      <div style={{maxWidth:"1280px",margin:"0 auto",padding:"80px 40px",width:"100%",position:"relative",zIndex:1}}>
        <div style={{maxWidth:"760px"}}>

          {/* Eyebrow */}
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"32px"}}>
            <div style={{width:"48px",height:"1px",background:"#B8973C"}} />
            <span style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#B8973C",fontWeight:500}}>Handcrafted in India</span>
          </div>

          {/* Headline */}
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(56px,7vw,96px)",fontWeight:300,color:"#1A1210",lineHeight:1.0,marginBottom:"32px"}}>
            Sarees that<br/>
            <span style={{color:"#6B1A2A",fontStyle:"italic"}}>tell a story.</span>
          </h1>

          {/* Subtext */}
          <p style={{fontSize:"16px",color:"#6B635C",lineHeight:1.85,marginBottom:"48px",maxWidth:"520px",fontWeight:300}}>
            Each piece is handpicked directly from master weavers in Kanchipuram, Varanasi, and Pochampally — where tradition meets artistry.
          </p>

          {/* CTAs */}
          <div style={{display:"flex",gap:"16px",flexWrap:"wrap",marginBottom:"64px"}}>
            <a href="/shop" style={{background:"#6B1A2A",color:"white",padding:"18px 40px",fontSize:"11px",letterSpacing:"2.5px",textTransform:"uppercase",textDecoration:"none",fontWeight:500}}>
              Shop Collection
            </a>
            <a href="/about" style={{color:"#6B1A2A",padding:"18px 40px",fontSize:"11px",letterSpacing:"2.5px",textTransform:"uppercase",textDecoration:"none",borderBottom:"1px solid #6B1A2A",display:"flex",alignItems:"center",gap:"8px"}}>
              Our Story →
            </a>
          </div>

          {/* Bottom info strip */}
          <div style={{display:"flex",gap:"0",paddingTop:"40px",borderTop:"1px solid #EDE6DC"}}>
            <div style={{flex:1,paddingRight:"40px",borderRight:"1px solid #EDE6DC",marginRight:"40px"}}>
              <div style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"10px"}}>We source from</div>
              {weaveOrigins.map((item) => (
                <div key={item} style={{fontSize:"14px",color:"#2C2420",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.8}}>{item}</div>
              ))}
            </div>
            <div style={{flex:1,paddingRight:"40px",borderRight:"1px solid #EDE6DC",marginRight:"40px"}}>
              <div style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"10px"}}>Fabrics</div>
              <div style={{fontSize:"14px",color:"#2C2420",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.8}}>Silk · Cotton</div>
              <div style={{fontSize:"14px",color:"#2C2420",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.8}}>Linen · Chanderi</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"10px"}}>Delivery</div>
              <div style={{fontSize:"14px",color:"#2C2420",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.8}}>5–7 business days</div>
              <div style={{fontSize:"14px",color:"#2C2420",fontFamily:"'Cormorant Garamond',serif",lineHeight:1.8}}>Pan India</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical decorative text */}
      <div className="hidden md:flex" style={{position:"absolute",right:"60px",top:"50%",transform:"translateY(-50%) rotate(90deg)",transformOrigin:"center",gap:"32px",alignItems:"center"}}>
        <div style={{width:"40px",height:"1px",background:"#EDE6DC"}} />
        <span style={{fontSize:"9px",letterSpacing:"4px",textTransform:"uppercase",color:"#C9BDB7",whiteSpace:"nowrap"}}>Est. 2024 · Hyderabad, India</span>
        <div style={{width:"40px",height:"1px",background:"#EDE6DC"}} />
      </div>
    </section>
  );
}
