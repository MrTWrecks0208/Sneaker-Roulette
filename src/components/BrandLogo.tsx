import React from 'react';
import { BrandLogoContext } from './brandLogos/brandLogoTypes';
import { getBrandLogoGroup1 } from './brandLogos/logosGroup1';
import { getBrandLogoGroup2 } from './brandLogos/logosGroup2';
import { getBrandLogoGroup3 } from './brandLogos/logosGroup3';
import { getBrandLogoGroup4 } from './brandLogos/logosGroup4';
import { getBrandLogoGroup5 } from './brandLogos/logosGroup5';
import { getBrandLogoGroup6 } from './brandLogos/logosGroup6';
import { getBrandLogoGroup7 } from './brandLogos/logosGroup7';

export function BrandLogo({
  brand,
  sneakerName,
  name,
  className,
  isFrontFace,
}: {
  brand: string;
  sneakerName?: string;
  name?: string;
  className?: string;
  isFrontFace?: boolean;
}) {
  const hasTextColor = className && /\btext-/.test(className);
  const colorClass = hasTextColor ? '' : 'text-black';
  const hasHeight = className && /\b(h-|size-)/.test(className);
  const sizeClass = hasHeight ? '' : 'h-5 w-auto';
  const logoClass = `${colorClass} ${sizeClass} ${className || ''}`.trim();
  const combinedName = sneakerName || name || '';
  const bLower = (brand || '').toLowerCase().trim();
  const nLower = combinedName.toLowerCase().trim();
  const isJordan = bLower.includes('jordan') || nLower.includes('jordan');
  const isYeezy =
    bLower.includes('adidas yeezy') ||
    nLower.includes('adidas yeezy') ||
    (nLower.includes('yeezy') && !nLower.includes('nike'));
  const isNike = !isJordan && (bLower.includes('nike') || nLower.includes('nike'));
  const isAdidas = !isYeezy && (bLower.includes('adidas') || nLower.includes('adidas'));

  const isFront = isFrontFace ?? (Boolean(className && (className.includes('h-12') || className.includes('h-14') || className.includes('opacity-80'))));

  const ctx: BrandLogoContext = {
    brand,
    sneakerName,
    name,
    className,
    isFrontFace: isFront,
    logoClass,
    combinedName,
    bLower,
    nLower,
    isJordan,
    isYeezy,
    isNike,
    isAdidas,
  };

  return (
    getBrandLogoGroup1(ctx) ||
    getBrandLogoGroup2(ctx) ||
    getBrandLogoGroup3(ctx) ||
    getBrandLogoGroup4(ctx) ||
    getBrandLogoGroup5(ctx) ||
    getBrandLogoGroup6(ctx) ||
    getBrandLogoGroup7(ctx) || (
      <div title={brand || 'Sneaker'} className={`inline-flex items-center justify-center shrink-0 ${logoClass}`}>
        <span className="font-bold text-xs uppercase tracking-wider text-current truncate max-w-[120px]">
          {brand || ''}
        </span>
      </div>
    )
  );
}

export default BrandLogo;
