import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  quality?: number;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  fallback = "/placeholder-image.svg",
  loading = "lazy",
  quality = 85,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate responsive image URLs (if using a CDN)
  const generateResponsiveUrl = (url: string, width?: number) => {
    // For future CDN integration
    if (width && url.includes('cdn.')) {
      return `${url}?w=${width}&q=${quality}&format=webp`;
    }
    return url;
  };

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  const handleImageIntersection = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && imgRef.current) {
      const img = imgRef.current;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    }
  };

  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(handleImageIntersection, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    }
  }, [loading]);

  return (
    <div className={`relative inline-block ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      
      <img
        ref={imgRef}
        src={loading === 'lazy' ? undefined : imageSrc}
        data-src={loading === 'lazy' ? imageSrc : undefined}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={loading}
        decoding="async"
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      
      {hasError && imageSrc === fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded text-gray-400 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
}

// WebP support detection
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = function () {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Preload critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Lazy loading hook for images
export function useLazyImage(src: string, threshold = 0.1) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [imageRef, setImageRef] = useState<Element | null>(null);

  useEffect(() => {
    if (!imageRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imageRef);

    return () => observer.disconnect();
  }, [imageRef, src, threshold]);

  return [setImageRef, imageSrc] as const;
}