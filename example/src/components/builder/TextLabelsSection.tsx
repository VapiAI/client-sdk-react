import React from 'react';
import type { WidgetConfig } from '../../types';

interface TextLabelsSectionProps {
  config: WidgetConfig;
  updateConfig: (key: keyof WidgetConfig, value: any) => void;
}

const TextLabelsSection: React.FC<TextLabelsSectionProps> = ({
  config,
  updateConfig,
}) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-gray-900">Text & Labels</h2>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
      </svg>
    </div>
    <p className="text-sm mb-6 text-gray-600">Customize widget text.</p>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Main Label
          <svg
            className="w-3 h-3 inline ml-1 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
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
          <svg
            className="w-3 h-3 inline ml-1 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
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
          <svg
            className="w-3 h-3 inline ml-1 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
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
);

export default TextLabelsSection;
