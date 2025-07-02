import React from 'react';

interface ColorScheme {
  baseColor: string;
  accentColor: string;
  buttonBaseColor: string;
  buttonAccentColor: string;
}

interface StyleConfig {
  size: 'tiny' | 'compact' | 'full';
  radius: 'none' | 'small' | 'medium' | 'large';
  theme: 'light' | 'dark';
}

const radiusStyles = {
  none: { borderRadius: '0' },
  small: { borderRadius: '0.5rem' },
  medium: { borderRadius: '1rem' },
  large: { borderRadius: '1.5rem' },
};

export interface ConsentFormProps {
  termsContent: string;
  onAccept: () => void;
  onCancel: () => void;
  colors: ColorScheme;
  styles: StyleConfig;
  radius: 'none' | 'small' | 'medium' | 'large';
}

const ConsentForm: React.FC<ConsentFormProps> = ({
  termsContent,
  onAccept,
  onCancel,
  colors,
  styles,
  radius,
}) => {
  // Use the configured base color and derive other colors based on theme
  const isDark = styles.theme === 'dark';
  const borderColor = isDark ? '#1F2937' : '#E5E7EB';
  const headingColor = isDark ? '#FFFFFF' : '#111827';
  const textColor = isDark ? '#D1D5DB' : '#4B5563';

  const containerStyle: React.CSSProperties = {
    ...radiusStyles[radius],
    backgroundColor: colors.baseColor, // Use configured base color
    border: `1px solid ${borderColor}`,
    boxShadow: isDark
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      : '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    padding: '1rem',
    maxWidth: '360px',
    minWidth: '300px',
  };

  const headingStyle: React.CSSProperties = {
    color: headingColor,
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    margin: '0 0 0.75rem 0',
  };

  const termsContentStyle: React.CSSProperties = {
    color: textColor,
    fontSize: '0.75rem',
    lineHeight: '1.5',
    marginBottom: '1rem',
    maxHeight: '120px',
    overflowY: 'auto',
    // Custom scrollbar styling for dark mode
    scrollbarWidth: 'thin',
    scrollbarColor: isDark ? '#4B5563 transparent' : '#CBD5E1 transparent',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...radiusStyles[radius],
    backgroundColor: 'transparent',
    border: isDark ? 'none' : `1px solid #D1D5DB`, // No border in dark mode
    color: isDark ? '#9CA3AF' : '#4B5563',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  const acceptButtonStyle: React.CSSProperties = {
    ...radiusStyles[radius],
    // Invert colors based on theme - white bg in dark mode, use configured colors in light mode
    backgroundColor: isDark
      ? colors.buttonAccentColor || '#FFFFFF'
      : colors.buttonBaseColor || '#000000',
    color: isDark
      ? colors.buttonBaseColor || '#000000'
      : colors.buttonAccentColor || '#FFFFFF',
    border: 'none',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div style={containerStyle}>
      <style>{`
        /* Custom scrollbar styles for webkit browsers */
        .consent-terms-content::-webkit-scrollbar {
          width: 6px;
        }
        .consent-terms-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .consent-terms-content::-webkit-scrollbar-thumb {
          background: ${isDark ? '#4B5563' : '#CBD5E1'};
          border-radius: 3px;
        }
        .consent-terms-content::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#6B7280' : '#94A3B8'};
        }
        .consent-cancel-button:hover {
          background-color: ${isDark ? '#1F2937' : '#F9FAFB'} !important;
          ${isDark ? '' : 'border-color: #9CA3AF !important;'}
        }
        .consent-accept-button:hover {
          opacity: 0.9;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
      `}</style>

      <h3 style={headingStyle}>Terms and conditions</h3>

      <div
        className="consent-terms-content"
        style={termsContentStyle}
        dangerouslySetInnerHTML={{ __html: termsContent }}
      />

      <div style={buttonContainerStyle}>
        <button
          className="consent-cancel-button"
          onClick={onCancel}
          style={cancelButtonStyle}
        >
          Cancel
        </button>
        <button
          className="consent-accept-button"
          onClick={onAccept}
          style={acceptButtonStyle}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default ConsentForm;
