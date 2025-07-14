import React from 'react';
import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import type { WidgetConfig } from '../../types';

interface LegalConsentSectionProps {
  config: WidgetConfig;
  updateConfig: (key: keyof WidgetConfig, value: any) => void;
}

const LegalConsentSection: React.FC<LegalConsentSectionProps> = ({
  config,
  updateConfig,
}) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-gray-900">Legal & Consent</h2>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id="require-consent"
          checked={config.consentRequired}
          onChange={(e) => updateConfig('consentRequired', e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
      </label>
    </div>
    <p className="text-sm mb-6 text-gray-600">Require terms and Conditions</p>

    {config.consentRequired && (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Terms Title
          </label>
          <input
            type="text"
            id="consent-title"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={config.consentTitle || ''}
            onChange={(e) => updateConfig('consentTitle', e.target.value)}
            placeholder="Terms and conditions"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Terms Content
          </label>
          <div className="border rounded-md p-3 border-gray-300 bg-white">
            <textarea
              id="terms-content"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={config.consentContent}
              onChange={(e) => updateConfig('consentContent', e.target.value)}
            />
            <p className="text-xs mt-2 text-gray-500">Rich text supported</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Local Storage Key
            <svg
              className="w-3 h-3 inline ml-1 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="storage-key"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={config.consentStorageKey}
              onChange={(e) =>
                updateConfig('consentStorageKey', e.target.value)
              }
              placeholder="vapi_widget_consent"
            />
            <button
              onClick={() => {
                localStorage.removeItem(config.consentStorageKey);
                alert('Consent removed from local storage!');
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
);

export default LegalConsentSection;
