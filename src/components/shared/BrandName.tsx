import clsx from 'clsx';

interface BrandNameProps {
  className?: string;
  inline?: boolean;
}

// Renders the brand name with required casing and blue Olx segment.
export default function BrandName({ className, inline = true }: BrandNameProps) {
  const Wrapper: any = inline ? 'span' : 'div';
  return (
    <Wrapper className={clsx('select-none whitespace-nowrap', className)}>
      <span className="font-semibold text-slate-900">Campus</span>
      <span className="font-bold text-brand" style={{ color: 'var(--brand-color)' }}>Olx</span>
    </Wrapper>
  );
}
