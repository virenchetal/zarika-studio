export default function EditorialStrip() {
  return (
    <section style={{background:"#FAF8F3",padding:"80px 24px",textAlign:"center",borderTop:"1px solid #EDE6DC",borderBottom:"1px solid #EDE6DC"}}>
      <div style={{maxWidth:"640px",margin:"0 auto"}}>
        <div style={{width:"40px",height:"1px",background:"#B8973C",margin:"0 auto 24px"}} />
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(22px,3vw,32px)",fontWeight:300,color:"#2C2420",lineHeight:1.7,fontStyle:"italic",marginBottom:"20px"}}>
          "Every saree we carry is handpicked directly from the weaver's loom — a promise of authenticity that no factory can replicate."
        </p>
        <div style={{fontSize:"10px",letterSpacing:"2.5px",textTransform:"uppercase",color:"#B8973C"}}>— The Zarika Studio Promise</div>
      </div>
    </section>
  );
}
