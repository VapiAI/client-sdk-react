/// <reference types="vite/client" />

import React, { useState } from 'react'
import { VapiWidget } from '../../src'
import { MicrophoneIcon, ChatCircleIcon, CopyIcon, CheckIcon, WaveformIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react'
import { HexColorPicker } from 'react-colorful'
import WidgetPreview from './components/WidgetPreview'
import AnimatedStatusIconPreview from './components/AnimatedStatusIconPreview'
import type { WidgetConfig } from './types'
import VapiLogomark from '../logomark-primary.svg'

// Custom Color Picker Input Component
const ColorPickerInput: React.FC<{
  label: string
  value: string
  onChange: (color: string) => void
  description?: string
}> = ({ label, value, onChange, description }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
        {description && (
          <svg className="w-3 h-3 inline ml-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        )}
      </label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded border border-gray-300 hover:border-gray-400 transition-colors flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 rounded-md border font-mono text-sm bg-white border-gray-300 text-gray-900"
          placeholder="#000000"
        />
      </div>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          {/* Color Picker Popover */}
          <div className="absolute top-full left-0 z-50 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
            <div className="mb-3">
              <HexColorPicker color={value} onChange={onChange} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">{value}</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

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
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('widget')}
              className={`py-4 px-1 border-b-2 transition-colors font-medium text-sm ${
                currentView === 'widget' 
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ChatCircleIcon size={20} weight={currentView === 'widget' ? 'fill' : 'regular'} />
                <span>Widget Builder</span>
              </div>
            </button>
            <button
              onClick={() => setCurrentView('icon')}
              className={`py-4 px-1 border-b-2 transition-colors font-medium text-sm ${
                currentView === 'icon' 
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full ml-0.5"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-full ml-0.5"></div>
                  </div>
                </div>
                <span>Icon Preview</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

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
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Widget Embed
                    </h2>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">
                    Add the following snippet to the pages where you want the conversation widget to be.
                  </p>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Embed Code
                      </span>
                      <button
                        onClick={() => copyToClipboard(generateEmbedCode())}
                        className="text-sm text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                      >
                        {copied ? (
                          <>
                            <CheckIcon size={16} />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <CopyIcon size={16} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3 rounded-md font-mono text-sm overflow-x-auto bg-gray-100 text-gray-800">
                      {generateEmbedCode()}
                    </div>
                  </div>
                </div>

                {/* Mode Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Mode
                    </h2>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">
                    Configure what mode will the widget support
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        config.mode === 'voice'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => updateConfig('mode', 'voice')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          config.mode === 'voice' ? 'bg-teal-500' : 'bg-gray-200'
                        }`}>
                          <MicrophoneIcon size={20} weight="fill" className={config.mode === 'voice' ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Voice</h3>
                          <p className="text-sm text-gray-600">
                            Users will speak with the widget
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        config.mode === 'chat'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => updateConfig('mode', 'chat')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          config.mode === 'chat' ? 'bg-teal-500' : 'bg-gray-200'
                        }`}>
                          <ChatCircleIcon size={20} weight="fill" className={config.mode === 'chat' ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Chat</h3>
                          <p className="text-sm text-gray-600">
                            Users will text with the widget
                          </p>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        config.mode === 'hybrid'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => updateConfig('mode', 'hybrid')}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          config.mode === 'hybrid' ? 'bg-teal-500' : 'bg-gray-200'
                        }`}>
                          <WaveformIcon size={20} weight="fill" className={config.mode === 'hybrid' ? 'text-white' : 'text-gray-500'} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Hybrid</h3>
                          <p className="text-sm text-gray-600">
                            Users can switch between voice and chat
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show Transcript Toggle */}
                  {(config.mode === 'voice' || config.mode === 'hybrid') && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Show Transcript</h3>
                          <p className="text-xs text-gray-600 mt-1">
                            Display conversation transcript during voice calls
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.showTranscript}
                            onChange={(e) => updateConfig('showTranscript', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Appearance Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Appearance
                    </h2>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                  </div>
                  <p className="text-sm mb-6 text-gray-600">
                    Customize how the widget looks.
                  </p>

                  {/* Theme */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Theme
                    </label>
                    <select
                      value={config.theme}
                      onChange={(e) => {
                        const newTheme = e.target.value as 'light' | 'dark'
                        updateConfig('theme', newTheme)
                        // Automatically adjust base color based on theme
                        if (newTheme === 'dark') {
                          updateConfig('baseColor', '#000000')
                        } else {
                          updateConfig('baseColor', '#ffffff')
                        }
                      }}
                      className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                    <p className="text-xs mt-1 text-gray-500">
                      Switching themes will automatically adjust base and button colors
                    </p>
                  </div>

                  {/* Color Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <ColorPickerInput
                        label="Base Color"
                        value={config.baseColor}
                        onChange={(color) => updateConfig('baseColor', color)}
                      />
                    </div>

                    <div>
                      <ColorPickerInput
                        label="Accent Color"
                        value={config.accentColor}
                        onChange={(color) => updateConfig('accentColor', color)}
                      />
                    </div>

                    <div>
                      <ColorPickerInput
                        label="Button Base Color"
                        value={config.buttonBaseColor}
                        onChange={(color) => updateConfig('buttonBaseColor', color)}
                      />
                    </div>

                    <div>
                      <ColorPickerInput
                        label="Button Accent Color"
                        value={config.buttonAccentColor}
                        onChange={(color) => updateConfig('buttonAccentColor', color)}
                      />
                    </div>
                  </div>
                </div>

                {/* Layout Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Layout
                    </h2>
                  </div>

                  {/* Position */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((position) => (
                        <div
                          key={position}
                          className={`p-3 text-center rounded-lg border-2 cursor-pointer transition-all ${
                            config.position === position
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => updateConfig('position', position)}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                              {config.position === position && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm capitalize text-gray-900">
                            {position.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radius */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Radius
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {(['none', 'small', 'medium', 'large'] as const).map((radius) => (
                        <div
                          key={radius}
                          className={`p-3 text-center rounded-lg border-2 cursor-pointer transition-all ${
                            config.radius === radius
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => updateConfig('radius', radius)}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                              {config.radius === radius && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm capitalize text-gray-900">
                            {radius}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Size
                    </label>
                    {config.mode !== 'voice' && (
                      <p className="text-xs text-gray-500 mb-2">
                        Note: "Tiny" size only works in Voice mode. Chat and Hybrid modes will use Compact size instead.
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      {(['tiny', 'compact', 'full'] as const).map((size) => (
                        <div
                          key={size}
                          className={`p-3 text-center rounded-lg border-2 cursor-pointer transition-all ${
                            config.size === size
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => updateConfig('size', size)}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                              {config.size === size && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-sm capitalize text-gray-900">
                              {size}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {config.size === 'tiny' && config.mode === 'voice' && (
                      <p className="text-xs text-teal-600 mt-2">
                        In tiny voice mode, clicking the button directly starts/stops the call. The widget shows a glowing indicator during calls.
                      </p>
                    )}
                  </div>
                </div>

                {/* Text & Labels Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Text & Labels
                    </h2>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                  </div>
                  <p className="text-sm mb-6 text-gray-600">
                    Customize widget text.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Main Label
                        <svg className="w-3 h-3 inline ml-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={config.mainLabel}
                        onChange={(e) => updateConfig('mainLabel', e.target.value)}
                        className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Start Button Text
                        <svg className="w-3 h-3 inline ml-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={config.startButtonText}
                        onChange={(e) => updateConfig('startButtonText', e.target.value)}
                        className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        End Button Text (Optional)
                        <svg className="w-3 h-3 inline ml-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={config.endButtonText}
                        onChange={(e) => updateConfig('endButtonText', e.target.value)}
                        className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Legal & Consent Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Legal & Consent
                    </h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.requireConsent}
                        onChange={(e) => updateConfig('requireConsent', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                  <p className="text-sm mb-6 text-gray-600">
                    Require terms and Conditions
                  </p>

                  {config.requireConsent && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Terms Content
                        </label>
                        <div className="border rounded-md p-3 border-gray-300 bg-white">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-sm font-medium text-gray-700">
                              #### Terms and conditions
                            </span>
                          </div>
                          <textarea
                            value={config.termsContent}
                            onChange={(e) => updateConfig('termsContent', e.target.value)}
                            rows={4}
                            className="w-full p-2 rounded-md border resize-none bg-gray-50 border-gray-200 text-gray-900"
                          />
                          <p className="text-xs mt-2 text-gray-500">
                            Rich text supported
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Local Storage Key
                          <svg className="w-3 h-3 inline ml-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                          </svg>
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={config.localStorageKey}
                            onChange={(e) => updateConfig('localStorageKey', e.target.value)}
                            className="flex-1 p-2 rounded-md border font-mono text-sm bg-white border-gray-300 text-gray-900"
                          />
                          <button
                            onClick={() => {
                              localStorage.removeItem(config.localStorageKey)
                              // Force a page refresh to reset the widget's consent state
                              window.location.reload()
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            title="Clear stored consent"
                          >
                            <ArrowsClockwiseIcon size={16} weight="bold" />
                          </button>
                        </div>
                        <p className="text-xs mt-1 text-gray-500">
                          Key used to store consent in browser. Click reset icon to clear.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vapi Configuration Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      Vapi Configuration
                    </h2>
                  </div>
                  <p className="text-sm mb-6 text-gray-600">
                    Configure how the widget connects to Vapi AI
                  </p>

                  {/* Public Key - Always shown first */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Vapi Public Key
                      <svg className="w-3 h-3 inline ml-1 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                    </label>
                    <input
                      type="text"
                      value={config.publicKey}
                      onChange={(e) => updateConfig('publicKey', e.target.value)}
                      className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900 font-mono text-sm"
                      placeholder="your-vapi-public-key"
                    />
                    <p className="text-xs mt-1 text-gray-500">
                      Get your public key from your Vapi dashboard
                    </p>
                  </div>

                  {/* Configuration Type Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Configuration Type
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {(['assistantId', 'assistantWithOverrides', 'assistantObject'] as const).map((type) => (
                        <div
                          key={type}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            config.vapiConfigType === type
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => updateConfig('vapiConfigType', type)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {type === 'assistantId' && 'Assistant ID'}
                                {type === 'assistantWithOverrides' && 'Assistant ID + Overrides'}
                                {type === 'assistantObject' && 'Assistant Object'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {type === 'assistantId' && 'Simple assistant ID string'}
                                {type === 'assistantWithOverrides' && 'Assistant ID with custom overrides'}
                                {type === 'assistantObject' && 'Complete assistant configuration'}
                              </p>
                            </div>
                            {config.vapiConfigType === type && (
                              <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Configuration Fields */}
                  <div className="space-y-4">
                    {(config.vapiConfigType === 'assistantId' || config.vapiConfigType === 'assistantWithOverrides') && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Assistant ID
                        </label>
                        <input
                          type="text"
                          value={config.assistantId}
                          onChange={(e) => updateConfig('assistantId', e.target.value)}
                          className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900 font-mono text-sm"
                          placeholder="your-assistant-id"
                        />
                      </div>
                    )}

                    {config.vapiConfigType === 'assistantWithOverrides' && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Assistant Overrides (JSON)
                        </label>
                        <textarea
                          value={config.assistantOverrides}
                          onChange={(e) => updateConfig('assistantOverrides', e.target.value)}
                          rows={8}
                          className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900 font-mono text-sm"
                          placeholder='{"variableValues": {"name": "John"}}'
                        />
                      </div>
                    )}

                    {config.vapiConfigType === 'assistantObject' && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Full Assistant Configuration (JSON)
                        </label>
                        <textarea
                          value={config.assistantObject}
                          onChange={(e) => updateConfig('assistantObject', e.target.value)}
                          rows={12}
                          className="w-full p-2 rounded-md border bg-white border-gray-300 text-gray-900 font-mono text-sm"
                          placeholder='{"model": {"provider": "openai", "model": "gpt-3.5-turbo"}, "voice": {"provider": "11labs", "voiceId": "burt"}}'
                        />
                      </div>
                    )}
                  </div>
                </div>
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