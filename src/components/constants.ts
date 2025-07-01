export const sizeClasses = {
  tiny: {
    button: 'w-12 h-12',
    expanded: 'w-72 h-80',
    icon: 'w-5 h-5',
  },
  compact: {
    button: 'px-4 py-3 h-12',
    expanded: 'w-96 h-[32rem]',
    icon: 'w-5 h-5',
  },
  full: {
    button: 'px-6 py-4 h-14',
    expanded: 'w-[28rem] h-[40rem]',
    icon: 'w-6 h-6',
  },
};

export const sizeStyles = {
  tiny: {
    button: { width: '3rem', height: '3rem' }, // w-12 h-12
    expanded: { width: '18rem', height: '20rem' }, // w-72 h-80
    icon: { width: '1.25rem', height: '1.25rem' }, // w-5 h-5
  },
  compact: {
    button: {
      paddingLeft: '1rem',
      paddingRight: '1rem',
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      height: '3rem',
    }, // px-4 py-3 h-12
    expanded: { width: '24rem', height: '32rem' }, // w-96 h-[32rem]
    icon: { width: '1.25rem', height: '1.25rem' }, // w-5 h-5
  },
  full: {
    button: {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      height: '3.5rem',
    }, // px-6 py-4 h-14
    expanded: { width: '28rem', height: '40rem' }, // w-[28rem] h-[40rem]
    icon: { width: '1.5rem', height: '1.5rem' }, // w-6 h-6
  },
};

export const radiusClasses = {
  none: 'rounded-none',
  small: 'rounded-lg',
  medium: 'rounded-2xl',
  large: 'rounded-3xl',
};

export const radiusStyles = {
  none: { borderRadius: '0' },
  small: { borderRadius: '0.5rem' }, // rounded-lg
  medium: { borderRadius: '1rem' }, // rounded-2xl
  large: { borderRadius: '1.5rem' }, // rounded-3xl
};

export const buttonRadiusClasses = {
  none: 'rounded-none',
  small: 'rounded-lg',
  medium: 'rounded-2xl',
  large: 'rounded-3xl',
};

// Native CSS styles for button radius classes
export const buttonRadiusStyles = {
  none: { borderRadius: '0' },
  small: { borderRadius: '0.5rem' }, // rounded-lg
  medium: { borderRadius: '1rem' }, // rounded-2xl
  large: { borderRadius: '1.5rem' }, // rounded-3xl
};

export const messageRadiusClasses = {
  none: 'rounded-none',
  small: 'rounded-md', // 6px - subtle rounding
  medium: 'rounded-lg', // 8px - moderate rounding
  large: 'rounded-xl', // 12px - more rounded but not excessive
};

export const messageRadiusStyles = {
  none: { borderRadius: '0' },
  small: { borderRadius: '0.375rem' }, // rounded-md
  medium: { borderRadius: '0.5rem' }, // rounded-lg
  large: { borderRadius: '0.75rem' }, // rounded-xl
};

export const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

export const positionStyles = {
  'bottom-right': { bottom: '1.5rem', right: '1.5rem' },
  'bottom-left': { bottom: '1.5rem', left: '1.5rem' },
  'top-right': { top: '1.5rem', right: '1.5rem' },
  'top-left': { top: '1.5rem', left: '1.5rem' },
};
