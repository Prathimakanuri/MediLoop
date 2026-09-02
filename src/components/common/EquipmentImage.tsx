'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Activity, Wind, Zap, Radio, Syringe, Bed, Scan, Droplets, Layers, HeartPulse } from 'lucide-react';
import { getCategoryFallback } from '@/lib/utils';

interface EquipmentImageProps {
  src: string;
  alt: string;
  categorySlug?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function EquipmentImage({
  src,
  alt,
  categorySlug = 'ventilator',
  className = '',
  fill = false,
  width = 600,
  height = 400,
  priority = false,
}: EquipmentImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || getCategoryFallback(categorySlug));
  const [hasError, setHasError] = useState<boolean>(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getCategoryFallback(categorySlug));
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        onError={handleError}
        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105`}
        unoptimized
      />
    </div>
  );
}

export function CategoryIcon({ slug, className = 'w-5 h-5' }: { slug: string; className?: string }) {
  switch (slug) {
    case 'ventilator':
      return <Wind className={className} />;
    case 'patient-monitor':
      return <Activity className={className} />;
    case 'ecg':
      return <HeartPulse className={className} />;
    case 'ultrasound':
      return <Radio className={className} />;
    case 'infusion-pump':
      return <Syringe className={className} />;
    case 'defibrillator':
      return <Zap className={className} />;
    case 'hospital-bed':
      return <Bed className={className} />;
    case 'xray':
      return <Scan className={className} />;
    case 'dialysis':
      return <Droplets className={className} />;
    case 'anesthesia':
      return <Layers className={className} />;
    default:
      return <Activity className={className} />;
  }
}
