import React from 'react'
import type { WidgetConfig } from '../../types'

interface VapiConfigurationSectionProps {
  config: WidgetConfig
  updateConfig: (key: keyof WidgetConfig, value: any) => void
}

const VapiConfigurationSection: React.FC<VapiConfigurationSectionProps> = ({ config, updateConfig }) => (
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
)

export default VapiConfigurationSection 