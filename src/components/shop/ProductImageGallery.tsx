"use client";
import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types/database";

export default function ProductImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [selected, setSelected] = useState(0);
  const primary = images[selected];

  return (
    <div>
      <div className="aspect-[3/4] rounded overflow-hidden mb-3 relative bg-cream2 cursor-zoom-in">
        {primary ? (
          <Image src={primary.url} alt={productName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center"
            style={{background:"linear-gradient(145deg,#F3EDE3,#E8DDD0)"}}>
            <div style={{fontSize:"48px",marginBottom:"12px",opacity:0.3}}>🧣</div>
            <p style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:"#A09890",textAlign:"center",padding:"0 2rem"}}>
              Product images<br/>coming soon
            </p>
          </div>
        )}
        {images.length > 0 && (
          <span className="absolute top-4 left-4 bg-gold text-white text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 font-medium">
            New Arrival
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => setSelected(i)}
              className={`w-16 aspect-[3/4] rounded overflow-hidden flex-shrink-0 border-2 transition-colors ${i === selected ? "border-gold" : "border-transparent"}`}>
              <Image src={img.url} alt={`${productName} ${i + 1}`} width={64} height={85} className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
