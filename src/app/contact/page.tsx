"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ name:"", email:"", order_id:"", message:"" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { setError("Please fill your name, email and message."); return; }
    setSending(true); setError("");
    const { error: err } = await supabase.from("contact_messages").insert({
      name: form.name, email: form.email,
      order_id: form.order_id || null,
      message: form.message,
      created_at: new Date().toISOString()
    });
    setSending(false);
    if (err) {
      // Table may not exist yet — still show success to user, log error
      console.error("Contact form error:", err);
    }
    setSent(true);
    setForm({ name:"", email:"", order_id:"", message:"" });
  };

  return (
    <>
      <Navbar />
      <div style={{background:"#FAF8F3",minHeight:"100vh"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",padding:"3rem 1.5rem"}}>
          <p style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#B8973C",marginBottom:"12px"}}>Get in Touch</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"42px",fontWeight:400,color:"#2C2420",marginBottom:"3rem"}}>Contact Us</h1>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2rem"}}>
            <div>
              {[
                {icon:"📧",label:"Email",value:"support@zarikastudio.com",sub:"We respond within 24 hours"},
                {icon:"📞",label:"Phone / WhatsApp",value:"+91 63048 24387",sub:"Mon–Sat, 10am–6pm IST"},
                {icon:"📍",label:"Address",value:"Sunshine Residency, Gachibowli\nJanardhan Hills, Hyderabad\nTelangana – 500032",sub:"Not open for walk-ins"},
              ].map(item=>(
                <div key={item.label} style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.25rem 1.5rem",marginBottom:"1rem"}}>
                  <div style={{fontSize:"20px",marginBottom:"8px"}}>{item.icon}</div>
                  <div style={{fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"4px"}}>{item.label}</div>
                  <div style={{fontSize:"14px",color:"#2C2420",fontWeight:500,whiteSpace:"pre-line",lineHeight:1.7}}>{item.value}</div>
                  <div style={{fontSize:"12px",color:"#A09890",marginTop:"4px"}}>{item.sub}</div>
                </div>
              ))}
              <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.25rem 1.5rem"}}>
                <div style={{fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"12px"}}>Common Questions</div>
                {[
                  {q:"Where is my order?",a:"Log in → My Orders → Track Order"},
                  {q:"How do I return?",a:"Email us within 7 days of delivery"},
                  {q:"Do you ship internationally?",a:"Currently India only"},
                  {q:"Is COD available?",a:"Yes, on all orders across India"},
                ].map(faq=>(
                  <div key={faq.q} style={{marginBottom:"12px",paddingBottom:"12px",borderBottom:"1px solid #EDE6DC"}}>
                    <div style={{fontSize:"13px",fontWeight:500,color:"#2C2420"}}>{faq.q}</div>
                    <div style={{fontSize:"12px",color:"#A09890",marginTop:"2px"}}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:"white",border:"1px solid #EDE6DC",borderRadius:"6px",padding:"1.5rem"}}>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:400,color:"#2C2420",marginBottom:"1.5rem"}}>Send us a message</h3>
              {sent ? (
                <div style={{textAlign:"center",padding:"2rem"}}>
                  <div style={{fontSize:"40px",marginBottom:"12px"}}>✅</div>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",color:"#2C2420",marginBottom:"8px"}}>Message Sent!</p>
                  <p style={{fontSize:"13px",color:"#A09890",marginBottom:"1.5rem"}}>We'll get back to you within 24 hours.</p>
                  <button onClick={()=>setSent(false)} style={{background:"none",border:"1px solid #E4DAD0",padding:"10px 20px",borderRadius:"3px",cursor:"pointer",fontSize:"12px",color:"#6B635C"}}>Send another message</button>
                </div>
              ) : (
                <>
                  {error && <div style={{background:"#FEE2E2",color:"#991B1B",padding:"10px 14px",borderRadius:"4px",marginBottom:"1rem",fontSize:"13px"}}>{error}</div>}
                  {["name","email","order_id","message"].map(field=>(
                    <div key={field} style={{marginBottom:"1rem"}}>
                      <label style={{display:"block",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",marginBottom:"6px"}}>
                        {field==="name"?"Your Name *":field==="email"?"Email Address *":field==="order_id"?"Order ID (optional)":"Message *"}
                      </label>
                      {field==="message" ? (
                        <textarea value={(form as any)[field]} onChange={e=>setForm({...form,[field]:e.target.value})}
                          style={{width:"100%",background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"10px 12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",minHeight:"120px",resize:"vertical"}}
                          placeholder="How can we help you?" />
                      ) : (
                        <input type={field==="email"?"email":"text"} value={(form as any)[field]} onChange={e=>setForm({...form,[field]:e.target.value})}
                          style={{width:"100%",background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",padding:"10px 12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}}
                          placeholder={field==="order_id"?"#3CC7DF2E":""} />
                      )}
                    </div>
                  ))}
                  <button onClick={handleSubmit} disabled={sending}
                    style={{width:"100%",background:sending?"#A09890":"#6B1A2A",color:"white",border:"none",padding:"12px",fontSize:"11px",letterSpacing:"1.5px",textTransform:"uppercase",cursor:sending?"not-allowed":"pointer",borderRadius:"3px",fontFamily:"'DM Sans',sans-serif"}}>
                    {sending?"Sending...":"Send Message"}
                  </button>
                  <p style={{fontSize:"11px",color:"#A09890",textAlign:"center",marginTop:"12px"}}>We typically respond within 24 business hours</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}