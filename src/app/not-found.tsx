import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div style={{background:"#FAF8F3",minHeight:"70vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"3rem 1.5rem"}}>
        <div style={{textAlign:"center",maxWidth:"480px"}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"120px",fontWeight:300,color:"#EDE6DC",lineHeight:1,marginBottom:"0"}}>404</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:400,color:"#2C2420",marginBottom:"12px",marginTop:"-16px"}}>Page Not Found</h1>
          <p style={{fontSize:"14px",color:"#A09890",lineHeight:1.8,marginBottom:"2rem"}}>The page you're looking for doesn't exist or may have been moved. Let's get you back to the sarees.</p>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <Link href="/shop" style={{background:"#6B1A2A",color:"white",padding:"12px 28px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none",borderRadius:"3px"}}>Browse Sarees</Link>
            <Link href="/" style={{background:"none",border:"1.5px solid #6B1A2A",color:"#6B1A2A",padding:"11px 28px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none",borderRadius:"3px"}}>Go Home</Link>
          </div>
          <p style={{fontSize:"12px",color:"#A09890",marginTop:"2rem"}}>Need help? <a href="/contact" style={{color:"#B8973C",textDecoration:"underline"}}>Contact us</a></p>
        </div>
      </div>
      <Footer />
    </>
  );
}