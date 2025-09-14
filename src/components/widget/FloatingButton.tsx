import React from 'react';
import AnimatedStatusIcon from '../AnimatedStatusIcon';
import { FloatingButtonProps } from '../types';
import { sizeStyles, buttonRadiusStyles } from '../constants';

const FloatingButton: React.FC<FloatingButtonProps> = ({
  isCallActive,
  connectionStatus,
  isSpeaking,
  isTyping,
  volumeLevel,
  onClick,
  onToggleCall,
  mainLabel,
  ctaTitle,
  ctaSubtitle,
  colors,
  styles,
  mode,
}) => {
  // Special handling for tiny voice mode
  const isTinyVoice = mode === 'voice' && styles.size === 'tiny';
  const handleClick = () => {
    if (isTinyVoice && onToggleCall) {
      onToggleCall();
    } else {
      onClick();
    }
  };

  const displayTitle = ctaTitle || mainLabel;

  const buttonStyle: React.CSSProperties = {
    ...(isTinyVoice && isCallActive
      ? { width: '5rem', height: '5rem' } // w-20 h-20
      : sizeStyles[styles.size].button),
    ...buttonRadiusStyles[styles.radius],
    backgroundColor:
      isCallActive && isTinyVoice ? '#ef4444' : colors.ctaButtonColor,
    boxShadow:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // shadow-lg
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // transition-all duration-300
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    // Adjust height when subtitle is present
    ...(ctaSubtitle &&
    (styles.size === 'compact' || styles.size === 'full') &&
    !isTinyVoice
      ? { height: styles.size === 'compact' ? '4rem' : '4.5rem' }
      : {}),
  };

  return (
    <div
      className={`hover:vapi-scale-105 hover:vapi--translate-y-1 hover:vapi-shadow-xl ${
        isTinyVoice && isCallActive ? 'vapi-animate-glow' : ''
      }`}
      style={buttonStyle}
      onClick={handleClick}
    >
      <div
        className="vapi-flex vapi-items-center vapi-space-x-2"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem', // space-x-2
        }}
      >
        <AnimatedStatusIcon
          size={
            isTinyVoice && isCallActive ? 48 : styles.size === 'tiny' ? 24 : 28
          }
          connectionStatus={connectionStatus}
          isCallActive={isCallActive}
          isSpeaking={isSpeaking}
          isTyping={isTyping}
          baseColor={colors.accentColor}
          colors={colors.accentColor}
          volumeLevel={volumeLevel}
        />

        {(styles.size === 'compact' || styles.size === 'full') &&
          !isTinyVoice && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  color: colors.ctaButtonTextColor,
                  fontSize: ctaSubtitle ? '0.875rem' : '0.875rem', // text-sm
                  fontWeight: '500', // font-medium
                  lineHeight: '1.2',
                }}
              >
                {displayTitle}
              </span>
              {ctaSubtitle && (
                <span
                  style={{
                    color: colors.ctaButtonTextColor,
                    fontSize: '0.75rem', // text-xs
                    fontWeight: '400', // font-normal
                    opacity: 0.8,
                    lineHeight: '1.2',
                    marginTop: '0.125rem',
                  }}
                >
                  {ctaSubtitle}
                </span>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default FloatingButton;
