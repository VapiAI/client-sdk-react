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

  const buttonStyle: React.CSSProperties = {
    ...(isTinyVoice && isCallActive
      ? { width: '5rem', height: '5rem' } // w-20 h-20
      : sizeStyles[styles.size].button),
    ...buttonRadiusStyles[styles.radius],
    backgroundColor:
      isCallActive && isTinyVoice ? '#ef4444' : colors.buttonBaseColor,
    boxShadow:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // shadow-lg
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // transition-all duration-300
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  };

  return (
    <div
      className={`hover:scale-105 hover:-translate-y-1 hover:shadow-xl ${
        isTinyVoice && isCallActive ? 'animate-glow' : ''
      }`}
      style={buttonStyle}
      onClick={handleClick}
    >
      <div
        className="flex items-center space-x-2"
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
            <span
              style={{
                color: colors.buttonAccentColor,
                fontSize: '0.875rem', // text-sm
                fontWeight: '500', // font-medium
              }}
            >
              {mainLabel}
            </span>
          )}
      </div>
    </div>
  );
};

export default FloatingButton;
