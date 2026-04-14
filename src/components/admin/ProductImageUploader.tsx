"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  productId: string;
  onUpdate?: () => void;
}

export default function ProductImageUploader({ productId, onUpdate }: Props) {
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const loadImages = async () => {
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });
    setImages(data || []);
  };

  useEffect(() => { if (productId) loadImages(); }, [productId]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setError("");
    const uploaded: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { setError(`${file.name} is too large (max 5MB)`); continue; }

      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${i}.${ext}`;
      const path = `products/${productId}/${filename}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false });

      if (uploadErr) { setError("Upload failed: " + uploadErr.message); continue; }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      uploaded.push({ url: publicUrl, storage_path: path });
    }

    if (uploaded.length > 0) {
      const currentCount = images.length;
      const inserts = uploaded.map((img, i) => ({
        product_id: productId,
        url: img.url,
        storage_path: img.storage_path,
        sort_order: currentCount + i,
        is_primary: currentCount === 0 && i === 0,
      }));
      await supabase.from("product_images").insert(inserts);
      await loadImages();
      onUpdate?.();
    }
    setUploading(false);
  };

  const setPrimary = async (imageId: string) => {
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
    await loadImages();
  };

  const deleteImage = async (image: any) => {
    if (!confirm("Delete this image?")) return;
    await supabase.storage.from("product-images").remove([image.storage_path]);
    await supabase.from("product_images").delete().eq("id", image.id);
    const remaining = images.filter(i => i.id !== image.id);
    if (image.is_primary && remaining.length > 0) {
      await supabase.from("product_images").update({ is_primary: true }).eq("id", remaining[0].id);
    }
    await loadImages();
    onUpdate?.();
  };

  const moveImage = async (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newImages.length) return;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    for (let i = 0; i < newImages.length; i++) {
      await supabase.from("product_images").update({ sort_order: i }).eq("id", newImages[i].id);
    }
    await loadImages();
  };

  return (
    <div>
      {error && <div style={{background:"#FEE2E2",color:"#991B1B",padding:"10px 14px",borderRadius:"4px",marginBottom:"1rem",fontSize:"13px"}}>{error}</div>}

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        style={{border:"2px dashed #E4DAD0",borderRadius:"6px",padding:"2rem",textAlign:"center",cursor:"pointer",background:"#FAF8F3",marginBottom:"1rem"}}
      >
        <div style={{fontSize:"32px",marginBottom:"8px"}}>📸</div>
        <div style={{fontSize:"13px",color:"#6B635C",marginBottom:"4px"}}>{uploading ? "Uploading..." : "Click or drag to upload images"}</div>
        <div style={{fontSize:"11px",color:"#A09890"}}>JPG, PNG, WebP · Max 5MB per image · Multiple allowed</div>
        <input ref={fileRef} type="file" multiple accept="image/*" style={{display:"none"}} onChange={e => e.target.files && handleUpload(e.target.files)} />
      </div>

      {images.length > 0 && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"12px"}}>
          {images.map((img, i) => (
            <div key={img.id} style={{position:"relative",borderRadius:"6px",overflow:"hidden",border:img.is_primary?"2px solid #6B1A2A":"2px solid #EDE6DC",background:"#F3EDE3"}}>
              <img src={img.url} alt="" style={{width:"100%",aspectRatio:"3/4",objectFit:"cover",display:"block"}} />
              {img.is_primary && (
                <div style={{position:"absolute",top:"6px",left:"6px",background:"#6B1A2A",color:"white",fontSize:"9px",padding:"2px 8px",borderRadius:"10px"}}>PRIMARY</div>
              )}
              <div style={{position:"absolute",top:"6px",right:"6px",display:"flex",gap:"4px"}}>
                {i > 0 && <button onClick={() => moveImage(i,"up")} style={{background:"rgba(0,0,0,0.5)",color:"white",border:"none",borderRadius:"3px",width:"22px",height:"22px",cursor:"pointer",fontSize:"10px"}}>↑</button>}
                {i < images.length-1 && <button onClick={() => moveImage(i,"down")} style={{background:"rgba(0,0,0,0.5)",color:"white",border:"none",borderRadius:"3px",width:"22px",height:"22px",cursor:"pointer",fontSize:"10px"}}>↓</button>}
              </div>
              <div style={{padding:"8px",display:"flex",gap:"4px"}}>
                {!img.is_primary && (
                  <button onClick={() => setPrimary(img.id)} style={{flex:1,background:"#FAF8F3",border:"1px solid #E4DAD0",borderRadius:"3px",fontSize:"10px",padding:"4px",cursor:"pointer",color:"#6B635C"}}>Set Primary</button>
                )}
                <button onClick={() => deleteImage(img)} style={{background:"#FEE2E2",border:"1px solid #FCA5A5",borderRadius:"3px",fontSize:"10px",padding:"4px 8px",cursor:"pointer",color:"#DC2626"}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p style={{fontSize:"12px",color:"#A09890",textAlign:"center",padding:"8px"}}>No images yet. Upload above to add product photos.</p>
      )}
    </div>
  );
}
