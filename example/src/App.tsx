/// <reference types="vite/client" />

import { useState } from 'react'
import { VapiWidget } from '../../src'
import WidgetPreview from './components/WidgetPreview'
import AnimatedStatusIconPreview from './components/AnimatedStatusIconPreview'
import type { WidgetConfig } from './types'
import VapiLogomark from '../logomark-primary.svg'

// Import extracted components
import NavigationTabs from './components/builder/NavigationTabs'
import WidgetEmbedSection from './components/builder/WidgetEmbedSection'
import ModeSection from './components/builder/ModeSection'
import AppearanceSection from './components/builder/AppearanceSection'
import LayoutSection from './components/builder/LayoutSection'
import TextLabelsSection from './components/builder/TextLabelsSection'
import LegalConsentSection from './components/builder/LegalConsentSection'
import VapiConfigurationSection from './components/builder/VapiConfigurationSection'

// Main App Component
function App() {
  const [config, setConfig] = useState<WidgetConfig>({
    mode: 'voice',
    theme: 'light',
    // Default colors matching VapiWidget defaults
    baseColor: '#ffffff',  // Light mode default (automatically switches to #000000 in dark mode)
    accentColor: '#14B8A6',  // Default teal accent
    buttonBaseColor: '#000000',  // Default black for buttons
    buttonAccentColor: '#ffffff',  // Default white for button text
    radius: 'large',
    size: 'full',
    position: 'bottom-right',
    mainLabel: 'TALK WITH AI',
    startButtonText: 'Start',
    endButtonText: 'End Call',
    requireConsent: true,
    termsContent: 'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.',
    localStorageKey: 'vapi_widget_consent',
    showTranscript: true,
    // Vapi Configuration
    publicKey: import.meta.env.VITE_VAPI_API_KEY || 'your-vapi-public-key',
    vapiConfigType: 'assistantId',
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || 'demo-assistant-id',
    assistantOverrides: JSON.stringify({
      variableValues: { name: 'John' }
    }, null, 2),
    assistantObject: JSON.stringify({
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "burt"
      }
    }, null, 2)
  })

  const [copied, setCopied] = useState(false)
  const [currentView, setCurrentView] = useState<'widget' | 'icon'>('widget')

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // Generate vapiConfig based on the selected type
  const generateVapiConfig = () => {
    try {
      switch (config.vapiConfigType) {
        case 'assistantId':
          return config.assistantId
        case 'assistantWithOverrides':
          return {
            assistantId: config.assistantId,
            assistantOverrides: JSON.parse(config.assistantOverrides)
          }
        case 'assistantObject':
          return JSON.parse(config.assistantObject)
        default:
          return config.assistantId
      }
    } catch (error) {
      console.error('Invalid JSON in vapi config:', error)
      return config.assistantId // Fallback
    }
  }

  const generateEmbedCode = () => {
    const attributes = [
      `mode="${config.mode}"`,
      `theme="${config.theme}"`,
      `base-color="${config.baseColor}"`,
      `accent-color="${config.accentColor}"`,
      `button-base-color="${config.buttonBaseColor}"`,
      `button-accent-color="${config.buttonAccentColor}"`,
      `radius="${config.radius}"`,
      `size="${config.size}"`,
      `position="${config.position}"`,
      `main-label="${config.mainLabel}"`,
      `start-button-text="${config.startButtonText}"`,
      config.endButtonText ? `end-button-text="${config.endButtonText}"` : null,
      `require-consent="${config.requireConsent}"`,
      `local-storage-key="${config.localStorageKey}"`,
      `show-transcript="${config.showTranscript}"`
    ].filter(Boolean).join(' ')

    return `<vapi-widget ${attributes}></vapi-widget>`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <NavigationTabs 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />

      {/* Content */}
      {currentView === 'widget' ? (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white border-gray-200 rounded-lg border shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={VapiLogomark} 
                      alt="Vapi Logo" 
                      className="w-6 h-6"
                    />
                    <h1 className="text-xl font-semibold text-gray-900">
                      VAPI Widget Builder
                    </h1>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Widget Embed Section */}
                  <WidgetEmbedSection
                    embedCode={generateEmbedCode()}
                    onCopy={() => copyToClipboard(generateEmbedCode())}
                    copied={copied}
                  />

                  {/* Mode Section */}
                  <ModeSection
                    mode={config.mode}
                    showTranscript={config.showTranscript}
                    onModeChange={(mode) => updateConfig('mode', mode)}
                    onTranscriptToggle={(value) => updateConfig('showTranscript', value)}
                  />

                  {/* Appearance Section */}
                  <AppearanceSection config={config} updateConfig={updateConfig} />

                  {/* Layout Section */}
                  <LayoutSection config={config} updateConfig={updateConfig} />

                  {/* Text & Labels Section */}
                  <TextLabelsSection config={config} updateConfig={updateConfig} />

                  {/* Legal & Consent Section */}
                  <LegalConsentSection config={config} updateConfig={updateConfig} />

                  {/* Vapi Configuration Section */}
                  <VapiConfigurationSection config={config} updateConfig={updateConfig} />
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <WidgetPreview config={config} generateVapiConfig={generateVapiConfig} />
          </div>

          {/* Live Widget - Only show for widget view */}
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
            onCallStart={() => console.log('Call started')}
            onCallEnd={() => console.log('Call ended')}
            onMessage={(message) => console.log('Message:', message)}
            onError={(error) => console.error('Error:', error)}
          />
        </div>
      ) : (
        <AnimatedStatusIconPreview />
      )}
    </div>
  )
}

export default App 