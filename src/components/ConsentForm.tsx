import React from 'react'

interface ColorScheme {
  baseColor: string
  accentColor: string
  buttonBaseColor: string
  buttonAccentColor: string
}

interface StyleConfig {
  size: 'tiny' | 'compact' | 'full'
  radius: 'none' | 'small' | 'medium' | 'large'
  theme: 'light' | 'dark'
}

const radiusClasses = {
  none: 'rounded-none',
  small: 'rounded-lg',
  medium: 'rounded-2xl',
  large: 'rounded-3xl'
}

export interface ConsentFormProps {
  termsContent: string
  onAccept: () => void
  onCancel: () => void
  colors: ColorScheme
  styles: StyleConfig
  radius: 'none' | 'small' | 'medium' | 'large'
}

const ConsentForm: React.FC<ConsentFormProps> = ({
  termsContent,
  onAccept,
  onCancel,
  colors,
  styles,
  radius
}) => {
  return (
    <div 
      className={`${radiusClasses[radius]} shadow-2xl p-4 ${
        styles.theme === 'dark' 
          ? 'shadow-black/50' 
          : 'shadow-xl'
      }`}
      style={{ 
        backgroundColor: colors.baseColor,
        borderColor: styles.theme === 'dark' ? '#1F2937' : '#E5E7EB',
        border: '1px solid',
        maxWidth: '360px',
        minWidth: '300px'
      }}
    >
      <h3 className={`text-base font-semibold mb-3 ${styles.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Terms and conditions
      </h3>
      <div 
        className={`text-xs mb-4 leading-relaxed ${styles.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
        style={{ lineHeight: '1.5', maxHeight: '120px', overflowY: 'auto' }}
        dangerouslySetInnerHTML={{ __html: termsContent }}
      />
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={onCancel}
          className={`px-4 py-2 ${radiusClasses[radius]} border transition-all font-medium text-xs ${
            styles.theme === 'dark' 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={onAccept}
          className={`px-4 py-2 ${radiusClasses[radius]} transition-all font-medium text-xs hover:opacity-90 hover:shadow-md`}
          style={{ 
            backgroundColor: colors.buttonBaseColor || colors.accentColor,
            color: colors.buttonAccentColor || '#FFFFFF'
          }}
        >
          Accept
        </button>
      </div>
    </div>
  )
}

export default ConsentForm 