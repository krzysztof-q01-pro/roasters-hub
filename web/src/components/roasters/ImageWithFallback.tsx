"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
}

export function ImageWithFallback({ src, alt, fill, sizes, className }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30 bg-surface-container-low">
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 20h20V4H2v16zm2-2V6h16v12H4z" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setError(true)}
    />
  );
}
