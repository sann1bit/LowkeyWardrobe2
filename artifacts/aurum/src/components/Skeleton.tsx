interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'light' | 'dark';
  shape?: 'rect' | 'circle' | 'text-line';
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'light',
  shape = 'rect',
  className = '',
}: SkeletonProps) {
  const base = variant === 'dark' ? 'skeleton skeleton--dark' : 'skeleton';
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-[2px]';

  return (
    <div
      className={`${base} ${shapeClass} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
