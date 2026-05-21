"use client";

import { useState } from "react";
import { ImageUploader } from "./image-uploader";

export function ProductFormFields({ initialImages = [] }: { initialImages?: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  return (
    <>
      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} />
      <ImageUploader value={images} onChange={setImages} multiple max={10} />
    </>
  );
}
