import React, { useState } from 'react'
import { AnimatedStatusIcon } from '../../../src/components'
import { HexColorPicker } from 'react-colorful'

interface AnimatedStatusIconConfig {
  // Icon properties
  size: number
  connectionStatus: 'disconnected' | 'connecting' | 'connected'
  isCallActive: boolean
  isSpeaking: boolean
  isTyping: boolean
  isError: boolean
  
  // Animation properties
  animationType: 'spin' | 'pulse' | 'sequential' | 'wave' | 'none' | 'auto'
  animationSpeed: number
  
  // Visual properties
  baseColor: string
  useMultipleColors: boolean
  colors: string[]
  barCount: number
  barWidthRatio: number
  barHeightRatio: number
}

const AnimatedStatusIconPreview: React.FC = () => {
  const [config, setConfig] = useState<AnimatedStatusIconConfig>({
    size: 120,
    connectionStatus: 'connected',
    isCallActive: false,
    isSpeaking: false,
    isTyping: false,
    isError: false,
    animationType: 'auto',
    animationSpeed: 1000,
    baseColor: '#9CA3AF',
    useMultipleColors: false,
    colors: ['#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'],
    barCount: 17,
    barWidthRatio: 0.08,
    barHeightRatio: 0.19
  })

  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)

  const updateConfig = (key: keyof AnimatedStatusIconConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateColor = (index: number, color: string) => {
    const newColors = [...config.colors]
    newColors[index] = color
    updateConfig('colors', newColors)
  }

  const addColor = () => {
    updateConfig('colors', [...config.colors, '#000000'])
  }

  const removeColor = (index: number) => {
    if (config.colors.length > 1) {
      updateConfig('colors', config.colors.filter((_, i) => i !== index))
    }
  }

  // Preset states for quick testing
  const presetStates = [
    { name: 'Idle', state: { connectionStatus: 'connected', isCallActive: false, isSpeaking: false, isTyping: false, isError: false } },
    { name: 'Connecting', state: { connectionStatus: 'connecting', isCallActive: false, isSpeaking: false, isTyping: false, isError: false } },
    { name: 'Active Call', state: { connectionStatus: 'connected', isCallActive: true, isSpeaking: false, isTyping: false, isError: false } },
    { name: 'Speaking', state: { connectionStatus: 'connected', isCallActive: true, isSpeaking: true, isTyping: false, isError: false } },
    { name: 'Typing', state: { connectionStatus: 'connected', isCallActive: false, isSpeaking: false, isTyping: true, isError: false } },
    { name: 'Error', state: { connectionStatus: 'disconnected', isCallActive: false, isSpeaking: false, isTyping: false, isError: true } }
  ]

  const applyPreset = (state: any) => {
    setConfig(prev => ({ ...prev, ...state }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Icon Preview</h1>
          <p className="text-gray-600">Test and tweak the animated status icon with all available options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Area */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Preview</h2>
              
              {/* Icon Display */}
              <div className="flex items-center justify-center mb-8 p-8 bg-gray-50 rounded-lg">
                <AnimatedStatusIcon
                  size={config.size}
                  connectionStatus={config.connectionStatus}
                  isCallActive={config.isCallActive}
                  isSpeaking={config.isSpeaking}
                  isTyping={config.isTyping}
                  isError={config.isError}
                  baseColor={config.baseColor}
                  animationType={config.animationType === 'auto' ? undefined : config.animationType}
                  animationSpeed={config.animationSpeed}
                  colors={config.useMultipleColors ? config.colors : config.colors[0]}
                  barCount={config.barCount}
                  barWidthRatio={config.barWidthRatio}
                  barHeightRatio={config.barHeightRatio}
                />
              </div>

              {/* Preset States */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                  {presetStates.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset.state)}
                      className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Controls</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Connection Status
                  </label>
                  <select
                    value={config.connectionStatus}
                    onChange={(e) => updateConfig('connectionStatus', e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300"
                  >
                    <option value="disconnected">Disconnected</option>
                    <option value="connecting">Connecting</option>
                    <option value="connected">Connected</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.isCallActive}
                      onChange={(e) => updateConfig('isCallActive', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Call Active</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.isSpeaking}
                      onChange={(e) => updateConfig('isSpeaking', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Speaking</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.isTyping}
                      onChange={(e) => updateConfig('isTyping', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Typing</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.isError}
                      onChange={(e) => updateConfig('isError', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Error</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Animation Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Animation</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Type
                  </label>
                  <select
                    value={config.animationType}
                    onChange={(e) => updateConfig('animationType', e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300"
                  >
                    <option value="auto">Auto (based on status)</option>
                    <option value="none">None</option>
                    <option value="spin">Spin</option>
                    <option value="pulse">Pulse</option>
                    <option value="sequential">Sequential</option>
                    <option value="wave">Wave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Speed (ms): {config.animationSpeed}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="100"
                    value={config.animationSpeed}
                    onChange={(e) => updateConfig('animationSpeed', Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Visual Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Visual Properties</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size: {config.size}px
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={config.size}
                      onChange={(e) => updateConfig('size', Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bar Count: {config.barCount}
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="17"
                      value={config.barCount}
                      onChange={(e) => updateConfig('barCount', Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowColorPicker(showColorPicker === 'base' ? null : 'base')}
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: config.baseColor }}
                      />
                      <input
                        type="text"
                        value={config.baseColor}
                        onChange={(e) => updateConfig('baseColor', e.target.value)}
                        className="flex-1 p-1 text-sm rounded border border-gray-300 font-mono"
                      />
                    </div>
                    {showColorPicker === 'base' && (
                      <div className="absolute mt-2 z-10">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                        <div className="relative bg-white p-3 rounded-lg shadow-xl border border-gray-200">
                          <HexColorPicker 
                            color={config.baseColor} 
                            onChange={(color) => updateConfig('baseColor', color)} 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bar Width Ratio: {(config.barWidthRatio * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.02"
                      max="0.2"
                      step="0.01"
                      value={config.barWidthRatio}
                      onChange={(e) => updateConfig('barWidthRatio', Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bar Height Ratio: {(config.barHeightRatio * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.01"
                      value={config.barHeightRatio}
                      onChange={(e) => updateConfig('barHeightRatio', Number(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>
                </div>

                {/* Color Management */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Animation Colors</label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.useMultipleColors}
                        onChange={(e) => updateConfig('useMultipleColors', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Use multiple colors</span>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    {config.colors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowColorPicker(showColorPicker === `color-${index}` ? null : `color-${index}`)}
                          className="w-8 h-8 rounded border border-gray-300 relative"
                          style={{ backgroundColor: color }}
                        />
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="flex-1 p-1 text-sm rounded border border-gray-300 font-mono"
                        />
                        {config.colors.length > 1 && (
                          <button
                            onClick={() => removeColor(index)}
                            className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        )}
                        {showColorPicker === `color-${index}` && (
                          <div className="absolute mt-2 z-10">
                            <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                            <div className="relative bg-white p-3 rounded-lg shadow-xl border border-gray-200">
                              <HexColorPicker 
                                color={color} 
                                onChange={(newColor) => updateColor(index, newColor)} 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {config.useMultipleColors && (
                      <button
                        onClick={addColor}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Add Color
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Export */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Code Export</h2>
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                <code>{`<AnimatedStatusIcon
  size={${config.size}}
  connectionStatus="${config.connectionStatus}"
  isCallActive={${config.isCallActive}}
  isSpeaking={${config.isSpeaking}}
  isTyping={${config.isTyping}}
  isError={${config.isError}}
  baseColor="${config.baseColor}"${config.animationType !== 'auto' ? `
  animationType="${config.animationType}"` : ''}
  animationSpeed={${config.animationSpeed}}
  colors={${config.useMultipleColors ? `[${config.colors.map(c => `"${c}"`).join(', ')}]` : `"${config.colors[0]}"`}}
  barCount={${config.barCount}}
  barWidthRatio={${config.barWidthRatio}}
  barHeightRatio={${config.barHeightRatio}}
/>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimatedStatusIconPreview 