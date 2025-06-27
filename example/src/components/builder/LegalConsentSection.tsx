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
          checked={config.requireConsent}
          onChange={(e) => updateConfig('requireConsent', e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
      </label>
    </div>
    <p className="text-sm mb-6 text-gray-600">Require terms and Conditions</p>

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
              value={config.localStorageKey}
              onChange={(e) => updateConfig('localStorageKey', e.target.value)}
              className="flex-1 p-2 rounded-md border font-mono text-sm bg-white border-gray-300 text-gray-900"
            />
            <button
              onClick={() => {
                localStorage.removeItem(config.localStorageKey);
                // Force a page refresh to reset the widget's consent state
                window.location.reload();
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
