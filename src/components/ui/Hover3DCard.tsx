import React from 'react';
import { cn } from '@/lib/utils';

interface Hover3DCardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'a';
  href?: string;
}

/**
 * Hover3DCard - Interactive 3D tilt effect card component
 *
 * Uses DaisyUI's hover-3d component to create an interactive 3D tilt effect
 * by detecting mouse movement across 8 hover zones.
 *
 * @example
 * // As a div container
 * <Hover3DCard>
 *   <div className="card bg-base-100 shadow-xl">
 *     <div className="card-body">Content</div>
 *   </div>
 * </Hover3DCard>
 *
 * @example
 * // As a clickable link
 * <Hover3DCard as="a" href="/dashboard">
 *   <div className="card bg-base-100 shadow-xl">
 *     <div className="card-body">Click me</div>
 *   </div>
 * </Hover3DCard>
 */
export function Hover3DCard({
  children,
  className,
  as: Component = 'div',
  href
}: Hover3DCardProps) {
  const props = href ? { href } : {};

  return (
    <Component
      {...props}
      className={cn('hover-3d', className)}
    >
      {children}
      {/* 8 empty divs required for the 3D hover effect */}
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </Component>
  );
}

interface Hover3DImageCardProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}

/**
 * Hover3DImageCard - Pre-configured 3D hover card for images
 *
 * @example
 * <Hover3DImageCard
 *   src="/image.jpg"
 *   alt="Description"
 *   className="w-64"
 * />
 */
export function Hover3DImageCard({
  src,
  alt,
  className,
  imageClassName
}: Hover3DImageCardProps) {
  return (
    <Hover3DCard className={className}>
      <figure className="rounded-xl overflow-hidden">
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-full object-cover', imageClassName)}
        />
      </figure>
    </Hover3DCard>
  );
}
