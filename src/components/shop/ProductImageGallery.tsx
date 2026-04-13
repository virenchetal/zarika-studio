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
          <div className="w-full h-full" style={{ background: "linear-gradient(145deg, #8B1A35, #C4416A)" }} />
        )}
        <span className="absolute top-4 left-4 bg-gold text-white text-[9px] tracking-[1.5px] uppercase px-3 py-1.5 font-medium">
          New Arrival
        </span>
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
      {images.length === 0 && (
        <div className="flex gap-2.5">
          {["#8B1A35","#1A3D6B","#1E5C2E","#6B3D1A","#3D1A6B","#1A5A5A"].map((color, i) => (
            <div key={i} onClick={() => setSelected(i)}
              className={`w-16 aspect-[3/4] rounded flex-shrink-0 cursor-pointer border-2 transition-colors ${i === selected ? "border-gold" : "border-transparent"}`}
              style={{ background: color }} />
          ))}
        </div>
      )}
    </div>
  );
}
