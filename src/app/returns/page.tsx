import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <div style={{background:"#FAF8F3",minHeight:"100vh"}}>
        <div style={{maxWidth:"800px",margin:"0 auto",padding:"3rem 1.5rem"}}>
          <p style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#B8973C",marginBottom:"8px"}}>Policies</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"42px",fontWeight:400,color:"#2C2420",marginBottom:"0.5rem"}}>Returns & Exchanges</h1>
          <p style={{fontSize:"14px",color:"#A09890",marginBottom:"3rem"}}>We want you to love every saree. Here's how we handle returns.</p>

          {[
            {
              title:"Return Window",
              content:"You may initiate a return within 7 days of delivery. Items must be unused, unworn, with all original tags intact and in original packaging."
            },
            {
              title:"Non-Returnable Items",
              content:"Items marked Final Sale, custom or made-to-order pieces, worn or washed items, and items without original tags cannot be returned."
            },
            {
              title:"How to Initiate a Return",
              content:null,
              custom: (
                <div>
                  <p style={{fontSize:"14px",color:"#6B635C",lineHeight:1.9,marginBottom:"1rem"}}>
                    All return and exchange requests must be submitted through your account on our website. Here's how:
                  </p>
                  <ol style={{paddingLeft:"1.25rem",margin:0}}>
                    {[
                      "Sign in to your account at zarikastudio.com",
                      'Go to My Profile → My Orders',
                      "Find the delivered order and click \"Return / Exchange\"",
                      "Select your reason and submit the request",
                      "Our team will review and respond within 24–48 hours",
                    ].map((step, i) => (
                      <li key={i} style={{fontSize:"14px",color:"#6B635C",lineHeight:1.9,marginBottom:"6px"}}>{step}</li>
                    ))}
                  </ol>
                  <a href="/profile#orders" style={{display:"inline-block",marginTop:"1.25rem",background:"#6B1A2A",color:"white",padding:"10px 24px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",textDecoration:"none",borderRadius:"3px"}}>
                    Go to My Orders →
                  </a>
                </div>
              )
            },
            {
              title:"Refunds",
              content:"Approved refunds are processed within 5–7 business days to the original payment method. COD refunds are issued via bank transfer within 7–10 business days — our team will contact you for bank details after approval."
            },
            {
              title:"Exchanges",
              content:"We currently offer exchanges for a different size or colour of the same product, subject to availability. Select \"Exchange\" when submitting your request and mention what you'd like instead."
            },
            {
              title:"Damaged or Wrong Items",
              content:"If you received a damaged or incorrect item, contact us within 24 hours of delivery via the return portal or WhatsApp (+91 63048 24387) with photos. We will arrange a free replacement or full refund immediately."
            },
          ].map((section: any) => (
            <div key={section.title} style={{marginBottom:"2rem",paddingBottom:"2rem",borderBottom:"1px solid #EDE6DC"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:400,color:"#2C2420",marginBottom:"10px",paddingBottom:"8px",borderBottom:"1px solid #EDE6DC"}}>{section.title}</h2>
              {section.content && <p style={{fontSize:"14px",color:"#6B635C",lineHeight:1.9}}>{section.content}</p>}
              {section.custom && section.custom}
            </div>
          ))}

          <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem",display:"flex",gap:"2rem",flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",color:"#A09890",marginBottom:"4px"}}>WhatsApp</div>
              <div style={{fontSize:"14px",color:"#2C2420",fontWeight:500}}>+91 63048 24387</div>
            </div>
            <div>
              <div style={{fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",color:"#A09890",marginBottom:"4px"}}>Email</div>
              <div style={{fontSize:"14px",color:"#2C2420",fontWeight:500}}>support@zarikastudio.com</div>
            </div>
            <div>
              <div style={{fontSize:"11px",letterSpacing:"1px",textTransform:"uppercase",color:"#A09890",marginBottom:"4px"}}>Response Time</div>
              <div style={{fontSize:"14px",color:"#2C2420",fontWeight:500}}>Within 24–48 hours</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
