import React from 'react'
import type { WidgetConfig } from '../../types'

interface LayoutSectionProps {
  config: WidgetConfig
  updateConfig: (key: keyof WidgetConfig, value: any) => void
}

const LayoutSection: React.FC<LayoutSectionProps> = ({ config, updateConfig }) => (
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
      <select
        value={config.position}
        onChange={(e) => updateConfig('position', e.target.value as any)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white text-gray-900"
      >
        {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((position) => (
          <option key={position} value={position}>
            {position.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </option>
        ))}
      </select>
    </div>

    {/* Radius */}
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3 text-gray-700">
        Radius
      </label>
      <div className="flex gap-3">
        {(['none', 'small', 'medium', 'large'] as const).map((radius) => (
          <div
            key={radius}
            className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${
              config.radius === radius
                ? 'border-gray-700 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            onClick={() => updateConfig('radius', radius)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                config.radius === radius
                  ? 'border-teal-500'
                  : 'border-gray-400'
              }`}>
                {config.radius === radius && (
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                )}
              </div>
              <span className="text-sm capitalize text-gray-900">
                {radius}
              </span>
            </div>
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
      <div className="flex gap-3">
        {(['tiny', 'compact', 'full'] as const).map((size) => (
          <div
            key={size}
            className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${
              config.size === size
                ? 'border-gray-700 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            onClick={() => updateConfig('size', size)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                config.size === size
                  ? 'border-teal-500'
                  : 'border-gray-400'
              }`}>
                {config.size === size && (
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                )}
              </div>
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
)

export default LayoutSection 