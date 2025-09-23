import Link from 'next/link';
import clsx from 'clsx';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

const sizeMap: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

export default function Logo({ className, size = 'md', href = '/home' }: LogoProps) {
  return (
    <Link href={href} className={clsx('font-nunito select-none whitespace-nowrap', sizeMap[size], className)}>
      <span className="font-semibold text-slate-900">Campus</span>
      <span className="font-bold text-brand" style={{ color: 'var(--brand-color)' }}>Olx</span>
    </Link>
  );
}