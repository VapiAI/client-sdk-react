import React, { useState } from 'react'
import { VapiWidget } from '../../../src'
import type { WidgetConfig } from '../types'

interface WidgetPreviewProps {
  config: WidgetConfig
  generateVapiConfig: () => any
}

const WidgetPreview: React.FC<WidgetPreviewProps> = ({ config, generateVapiConfig }) => {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="lg:col-span-1">
      <div className="bg-white border-gray-200 rounded-lg border shadow-sm lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            Live Preview
          </h2>
        </div>
        <div className="p-3">
          <div 
            className={`relative border-2 border-dashed rounded-lg overflow-hidden border-gray-300 ${
              config.size === 'tiny' 
                ? 'h-[24rem]' 
                : config.size === 'compact' 
                  ? 'h-[36rem]' 
                  : 'h-[44rem]'
            }`}
            style={{
              backgroundColor: '#f9fafb',
              backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          >
            <div className={`absolute inset-0 flex items-center justify-center text-gray-500 ${showPreview ? 'hidden' : ''}`}>
              <div className="text-center">
                <p className="text-sm mb-2">Interactive Widget Preview</p>
                <p className="text-xs mb-4">
                  Toggle the preview to see your configuration
                </p>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
            </div>
            
            {/* Preview Widget */}
            {showPreview && (
              <div className="absolute inset-0 p-2" id="vapi-widget-preview">
                <style>{`
                  #vapi-widget-preview > div {
                    position: absolute !important;
                    ${config.position === 'bottom-right' 
                      ? 'bottom: 0.5rem !important; right: 0.5rem !important; top: auto !important; left: auto !important;' 
                      : config.position === 'bottom-left'
                        ? 'bottom: 0.5rem !important; left: 0.5rem !important; top: auto !important; right: auto !important;'
                        : config.position === 'top-right'
                          ? 'top: 0.5rem !important; right: 0.5rem !important; bottom: auto !important; left: auto !important;'
                          : 'top: 0.5rem !important; left: 0.5rem !important; bottom: auto !important; right: auto !important;'
                    }
                    max-width: calc(100% - 1rem) !important;
                    max-height: calc(100% - 1rem) !important;
                  }
                `}</style>
                <VapiWidget
                  publicKey={config.publicKey}
                  vapiConfig={generateVapiConfig()}
                  position={config.position}
                  mode={config.mode}
                  theme={config.theme}
                  baseColor={config.baseColor}
                  accentColor={config.accentColor}
                  buttonBaseColor={config.buttonBaseColor}
                  buttonAccentColor={config.buttonAccentColor}
                  radius={config.radius}
                  size={config.size}
                  mainLabel={config.mainLabel}
                  startButtonText={config.startButtonText}
                  endButtonText={config.endButtonText}
                  requireConsent={config.requireConsent}
                  termsContent={config.termsContent}
                  localStorageKey={config.localStorageKey}
                  showTranscript={config.showTranscript}
                />
              </div>
            )}
          </div>
          
          {/* Configuration Summary */}
          <div className="mt-6 space-y-3">
            <div className="text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium capitalize">{config.mode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Theme:</span>
                <span className="font-medium capitalize">{config.theme}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium capitalize">{config.size}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium capitalize">{config.position.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Radius:</span>
                <span className="font-medium capitalize">{config.radius}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Consent:</span>
                <span className="font-medium">{config.requireConsent ? 'Required' : 'Not Required'}</span>
              </div>
              {(config.mode === 'voice' || config.mode === 'hybrid') && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Transcript:</span>
                  <span className="font-medium">{config.showTranscript ? 'Shown' : 'Hidden'}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Public Key:</span>
                <span className="font-medium font-mono text-xs">{config.publicKey.length > 20 ? `${config.publicKey.substring(0, 20)}...` : config.publicKey}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Vapi Config:</span>
                <span className="font-medium capitalize">{config.vapiConfigType.replace(/([A-Z])/g, ' $1')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WidgetPreview 