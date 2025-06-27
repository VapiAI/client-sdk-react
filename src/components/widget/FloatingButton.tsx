import React from 'react';
import AnimatedStatusIcon from '../AnimatedStatusIcon';
import { FloatingButtonProps } from '../types';
import { sizeClasses, buttonRadiusClasses } from '../constants';

const FloatingButton: React.FC<FloatingButtonProps> = ({
  isCallActive,
  connectionStatus,
  isSpeaking,
  isTyping,
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

  // Larger size and glow effect for tiny voice mode when active
  const buttonClass =
    isTinyVoice && isCallActive
      ? 'w-20 h-20' // Larger size for active tiny voice
      : sizeClasses[styles.size].button;

  return (
    <div
      className={`${buttonClass} ${buttonRadiusClasses[styles.radius]} shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center relative ${
        isTinyVoice && isCallActive ? 'animate-glow' : ''
      }`}
      style={{
        backgroundColor:
          isCallActive && isTinyVoice ? '#ef4444' : colors.buttonBaseColor,
      }}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2">
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
        />

        {(styles.size === 'compact' || styles.size === 'full') &&
          !isTinyVoice && (
            <span
              className={`${styles.size === 'full' ? 'text-sm' : 'text-sm'} font-medium`}
              style={{ color: colors.buttonAccentColor }}
            >
              {mainLabel}
            </span>
          )}
      </div>
    </div>
  );
};

export default FloatingButton;
