import { BRANDING } from '@/lib/branding';

interface LogoProps {
  variant?: 'main' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
}

const sizeMap = {
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '40px',
};

export function Logo({ variant = 'main', size = 'md', className = '', showIcon = false }: LogoProps) {
  const fontSize = sizeMap[size];

  if (BRANDING.logo.type === 'image') {
    const imagePath = showIcon
      ? BRANDING.logo.images.icon
      : variant === 'light'
      ? BRANDING.logo.images.light
      : variant === 'dark'
      ? BRANDING.logo.images.dark
      : BRANDING.logo.images.main;

    return (
      <img
        src={imagePath}
        alt={BRANDING.productName}
        className={className}
        style={{
          height: fontSize,
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    );
  }

  return (
    <span
      className={`logo-text ${className}`}
      style={{
        fontFamily: BRANDING.logo.font.family,
        fontWeight: BRANDING.logo.font.weight,
        fontSize: fontSize,
        letterSpacing: BRANDING.logo.font.letterSpacing,
        textTransform: BRANDING.logo.font.textTransform as any,
        display: 'inline-block',
      }}
    >
      {BRANDING.productName}
    </span>
  );
}
