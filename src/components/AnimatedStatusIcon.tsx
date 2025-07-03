import React, { useState, useEffect } from 'react';

type CircularBar = {
  x: number;
  y: number;
  rotate: number;
};

type LineBar = {
  x: number;
  y: number;
  width: number;
  baseHeight: number;
  maxHeight: number;
  delay: number;
  rotate: number;
};

export interface AnimatedStatusIconProps {
  /** Size of the icon in pixels */
  size?: number;
  /** Connection status */
  connectionStatus?: 'disconnected' | 'connecting' | 'connected';
  /** Whether a call is active */
  isCallActive?: boolean;
  /** Whether the assistant is speaking */
  isSpeaking?: boolean;
  /** Whether the assistant is typing */
  isTyping?: boolean;
  /** Whether there's an error */
  isError?: boolean;
  /** Volume level (0-1) for volume-responsive animations */
  volumeLevel?: number;
  /** Base color for inactive bars */
  baseColor?: string;
  /** Override animation type */
  animationType?:
    | 'spin'
    | 'pulse'
    | 'sequential'
    | 'wave'
    | 'none'
    | 'scale'
    | 'rotate-fade';
  /** Override animation speed in milliseconds */
  animationSpeed?: number;
  /** Override colors for bars */
  colors?: string | string[];
  /** Number of bars (default: 17) */
  barCount?: number;
  /** Bar width ratio (0-1) */
  barWidthRatio?: number;
  /** Bar height ratio (0-1) */
  barHeightRatio?: number;
  /** Custom class name */
  className?: string;
}

const AnimatedStatusIcon: React.FC<AnimatedStatusIconProps> = ({
  size = 40,
  connectionStatus,
  isCallActive,
  isSpeaking,
  isTyping,
  isError,
  volumeLevel = 0,
  baseColor = '#9CA3AF',
  animationType: overrideAnimationType,
  animationSpeed: overrideAnimationSpeed,
  colors: overrideColors,
  barCount = 17,
  barWidthRatio = 0.08,
  barHeightRatio = 0.19,
  className = '',
}) => {
  const [animationTime, setAnimationTime] = useState(0);

  // Determine if we should use line layout (when call is active)
  const useLineLayout = isCallActive;

  // For line layout, we use 5 bars like in bars-scale-middle.svg
  const actualBarCount = useLineLayout ? 5 : barCount;

  // Determine animation type and color based on status
  const getStatusConfig = () => {
    if (isError) {
      return {
        animationType: 'pulse' as const,
        colors: '#EF4444', // Red for errors
        animationSpeed: 300,
      };
    } else if (connectionStatus === 'connecting') {
      return {
        animationType: 'spin' as const,
        colors: '#FCD34D', // Yellow
        animationSpeed: 1000,
      };
    } else if (isCallActive && isSpeaking) {
      return {
        animationType: 'scale' as const,
        colors: '#F87171', // Light red
        animationSpeed: 600, // Match the SVG animation duration
      };
    } else if (isCallActive) {
      return {
        animationType: 'none' as const,
        colors: '#62F6B5', // Green
        animationSpeed: 1000,
      };
    } else if (isTyping) {
      return {
        animationType: 'sequential' as const,
        colors: '#60A5FA', // Blue
        animationSpeed: 100,
      };
    } else {
      // When call is not active, show rotating circle
      // return {
      //   animationType: 'rotate-fade' as const,
      //   colors: baseColor,
      //   animationSpeed: 3000 // Much slower rotation (3 seconds per rotation)
      // }
      return {
        animationType: 'none' as const,
        colors: baseColor,
        animationSpeed: 3000,
      };
    }
  };

  const statusConfig = getStatusConfig();

  // Use override values if provided, otherwise use status-based config
  const animationType = overrideAnimationType ?? statusConfig.animationType;
  const animationSpeed = overrideAnimationSpeed ?? statusConfig.animationSpeed;
  const colors = overrideColors ?? statusConfig.colors;

  // Animation loop
  useEffect(() => {
    if (animationType !== 'none') {
      const startTime = Date.now();
      let animationFrame: number;

      const animate = () => {
        setAnimationTime((Date.now() - startTime) / animationSpeed);
        animationFrame = requestAnimationFrame(animate);
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [animationType, animationSpeed]);

  // Calculate SVG viewBox based on layout
  const viewBoxSize = useLineLayout ? 24 : 253;
  // const scale = size / viewBoxSize

  // Generate bar positions for circular layout
  const getCircularBars = (): CircularBar[] => {
    const centerX = viewBoxSize / 2;
    const centerY = viewBoxSize / 2;
    const radius = viewBoxSize * 0.38; // Reduced from ~0.45 to 0.38 for better visibility

    return Array.from({ length: actualBarCount }, (_, i) => {
      const angle = (i / actualBarCount) * 2 * Math.PI - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const rotate = (angle * 180) / Math.PI + 90; // Convert to degrees and adjust for bar orientation

      return { x, y, rotate };
    });
  };

  const circularBars: CircularBar[] = getCircularBars();

  // Generate bar positions for line layout (like bars-scale-middle.svg)
  const getLineBars = (): LineBar[] => {
    const spacing = 4.8;
    // Create height pattern: smallest at edges, tallest in middle
    const heightPattern = [0.5, 0.75, 1, 0.75, 0.5]; // Multipliers for base height

    return Array.from({ length: 5 }, (_, i) => {
      const baseBarHeight = 16; // Base height
      const maxBarHeight = 22; // Max height for animation
      const heightMultiplier = heightPattern[i];

      return {
        x: 1 + i * spacing,
        y: 6,
        width: 2.8,
        baseHeight: baseBarHeight * heightMultiplier,
        maxHeight: maxBarHeight,
        delay: i === 2 ? 0 : Math.abs(i - 2) * 0.2, // Center bar starts first
        rotate: 0,
      };
    });
  };

  // Get color for a specific bar
  const getBarColor = (index: number): string => {
    if (Array.isArray(colors)) {
      return colors[index % colors.length];
    }
    return colors;
  };

  // Calculate opacity and transforms based on animation type
  const getBarProps = (index: number, bar: CircularBar | LineBar) => {
    const time = animationTime % 1; // Normalized to 0-1

    switch (animationType) {
      case 'rotate-fade': {
        // Rotating fade effect like bars-rotate-fade.svg
        const fadeSteps = actualBarCount;
        const currentStep = (time * fadeSteps) % fadeSteps;

        // Calculate distance from the "highlight" position
        const distanceFromHighlight = Math.min(
          Math.abs(index - currentStep),
          Math.abs(index - currentStep + fadeSteps),
          Math.abs(index - currentStep - fadeSteps)
        );

        // Create a smooth fade based on distance
        const normalizedDistance = distanceFromHighlight / (fadeSteps / 2);
        const opacity = Math.max(0.14, 1 - normalizedDistance * 0.86);

        return { opacity, transform: '' };
      }

      case 'scale': {
        // Speech pattern animation - each bar reacts differently to volume
        if (useLineLayout && 'delay' in bar) {
          const lineBar = bar as LineBar;

          // Use volume level to determine overall activity
          const volumeIntensity = Math.max(0, Math.min(1, volumeLevel));

          // Each bar has different sensitivity and frequency response
          const barCharacteristics = [
            { sensitivity: 0.8, frequency: 1.2, baseActivity: 0.3 }, // Bar 0 - Low freq, less sensitive
            { sensitivity: 1.0, frequency: 1.8, baseActivity: 0.4 }, // Bar 1 - Mid-low freq
            { sensitivity: 1.2, frequency: 2.5, baseActivity: 0.5 }, // Bar 2 - Center, most responsive
            { sensitivity: 1.0, frequency: 2.0, baseActivity: 0.4 }, // Bar 3 - Mid-high freq
            { sensitivity: 0.9, frequency: 1.5, baseActivity: 0.35 }, // Bar 4 - High freq
          ];

          const barChar = barCharacteristics[index] || barCharacteristics[2];

          // Create dynamic time-based variation for each bar
          const time = animationTime % 1;
          const barTime = (time * barChar.frequency) % 1;

          // Generate pseudo-random speech-like pattern
          const speechPattern =
            Math.sin(barTime * 2 * Math.PI) * 0.3 +
            Math.sin(barTime * 6 * Math.PI) * 0.2 +
            Math.sin(barTime * 12 * Math.PI) * 0.1;

          // Each bar responds differently based on volume and its characteristics
          const barResponse = volumeIntensity * barChar.sensitivity;

          // Combine base activity, volume response, and speech pattern
          const activity = Math.max(
            0,
            Math.min(
              1,
              barChar.baseActivity +
                barResponse * 0.6 +
                speechPattern * volumeIntensity * 0.4
            )
          );

          // Scale the bar height based on activity
          const heightScale = 0.7 + activity * 1.1; // Range from 0.7x to 1.8x
          const height = lineBar.baseHeight * heightScale;
          const y = 12 - height / 2;

          // Opacity varies with activity
          const opacity = 0.4 + activity * 0.6;

          return {
            opacity,
            height,
            y,
            transform: '',
          };
        }

        // For circular layout, create a wave-like speech pattern
        if (!useLineLayout) {
          const volumeIntensity = Math.max(0, Math.min(1, volumeLevel));
          const time = animationTime % 1;

          // Create different wave patterns for each bar
          const barAngle = (index / actualBarCount) * 2 * Math.PI;
          const wavePattern =
            Math.sin(time * 4 * Math.PI + barAngle) * 0.3 +
            Math.sin(time * 8 * Math.PI + barAngle * 2) * 0.2 +
            Math.sin(time * 16 * Math.PI + barAngle * 3) * 0.1;

          // Each bar has different sensitivity based on position
          const positionSensitivity =
            0.7 + 0.3 * Math.sin(barAngle + Math.PI / 4);

          const activity = Math.max(
            0,
            Math.min(
              1,
              0.3 +
                volumeIntensity * positionSensitivity * 0.5 +
                wavePattern * volumeIntensity * 0.2
            )
          );

          return {
            opacity: 0.4 + activity * 0.6,
            transform:
              activity > 0.5 ? `scale(${1 + (activity - 0.5) * 0.4})` : '',
          };
        }

        return { opacity: 1, transform: '' };
      }

      case 'spin': {
        // Rotating highlight effect
        const spinPhase = (time * 2 * Math.PI) % (2 * Math.PI);
        const barAngle = (index / actualBarCount) * 2 * Math.PI;
        const diff = Math.abs(
          ((spinPhase - barAngle + Math.PI) % (2 * Math.PI)) - Math.PI
        );
        return { opacity: 0.3 + 0.7 * (1 - diff / Math.PI), transform: '' };
      }

      case 'pulse':
        // All bars pulse together
        return {
          opacity: 0.5 + 0.5 * Math.sin(time * 2 * Math.PI),
          transform: '',
        };

      case 'sequential': {
        // Sequential highlighting
        const activeIndex = Math.floor(time * actualBarCount) % actualBarCount;
        return {
          opacity:
            index === activeIndex ||
            index === (activeIndex + 1) % actualBarCount
              ? 1
              : 0.3,
          transform: '',
        };
      }

      case 'wave': {
        // Wave effect
        const wavePhase = time * 2 * Math.PI;
        const barPhase = (index / actualBarCount) * 2 * Math.PI;
        return {
          opacity: 0.5 + 0.5 * Math.sin(wavePhase + barPhase),
          transform: '',
        };
      }

      default:
        return { opacity: 1, transform: '' };
    }
  };

  // Bar dimensions
  const barWidth = useLineLayout ? 2.8 : viewBoxSize * barWidthRatio;
  const barHeight = useLineLayout ? 12 : viewBoxSize * barHeightRatio;
  const barRadius = barWidth / 2;

  // Get bars based on layout
  const bars = useLineLayout ? getLineBars() : circularBars;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${useLineLayout ? 24 : viewBoxSize + 1}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Add a subtle background circle for better visibility in circle mode */}
        {!useLineLayout && (
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={viewBoxSize * 0.38} // Match the radius of the bars
            fill="none"
            stroke={baseColor}
            strokeWidth="1"
            opacity="0.05"
          />
        )}

        {bars.map((bar, index) => {
          const isActive = animationType !== 'none';
          const props = isActive
            ? getBarProps(index, bar)
            : { opacity: 1, transform: '' };
          const color = isActive
            ? getBarColor(index)
            : colors === baseColor
              ? baseColor
              : getBarColor(index);

          if (useLineLayout && 'width' in bar) {
            // Line layout bars
            const lineBar = bar as LineBar;
            // Center the bars vertically based on their height
            const yPosition =
              props.y !== undefined ? props.y : 12 - lineBar.baseHeight / 2;

            return (
              <rect
                key={index}
                x={lineBar.x}
                y={yPosition}
                width={lineBar.width}
                height={
                  props.height !== undefined ? props.height : lineBar.baseHeight
                }
                fill={color}
                opacity={props.opacity}
                rx={lineBar.width / 2}
              />
            );
          } else {
            // Circular layout bars
            const circularBar = bar as CircularBar;

            // For rotate-fade animation, make height follow the fade effect
            let finalBarHeight = barHeight;

            if (animationType === 'rotate-fade') {
              // Get the current highlight position from animation time
              const fadeSteps = actualBarCount;
              const currentStep = (animationTime % 1) * fadeSteps;

              // Calculate distance from the current highlight position
              const distanceFromHighlight = Math.min(
                Math.abs(index - currentStep),
                Math.abs(index - currentStep + fadeSteps),
                Math.abs(index - currentStep - fadeSteps)
              );

              // Create height variation based on distance from highlight
              // Bars near the highlight are taller
              const normalizedDistance =
                distanceFromHighlight / (fadeSteps / 2);
              const heightMultiplier = 0.4 + 0.6 * (1 - normalizedDistance);

              // Add a slight wave pattern for more organic feel
              const waveOffset = Math.sin(normalizedDistance * Math.PI) * 0.2;
              finalBarHeight = barHeight * (heightMultiplier + waveOffset);
            } else {
              // For other animations, use static height variation
              const distanceFromFirst = Math.min(index, actualBarCount - index);
              const heightMultiplier =
                0.7 + 0.3 * (1 - distanceFromFirst / (actualBarCount / 2));
              finalBarHeight = barHeight * heightMultiplier;
            }

            // Calculate the position adjustments to center the bar on its circular position
            const barCenterX = circularBar.x - barWidth / 2;
            const barCenterY = circularBar.y - finalBarHeight / 2;

            return (
              <rect
                key={index}
                x={barCenterX}
                y={barCenterY}
                width={barWidth}
                height={finalBarHeight}
                rx={barRadius}
                fill={color}
                opacity={props.opacity}
                transform={
                  circularBar.rotate !== 0
                    ? `rotate(${circularBar.rotate} ${circularBar.x} ${circularBar.y})`
                    : undefined
                }
                style={{
                  transition:
                    animationType === 'sequential'
                      ? 'opacity 0.1s ease-in-out'
                      : undefined,
                }}
              />
            );
          }
        })}
      </svg>
    </div>
  );
};

export default AnimatedStatusIcon;
