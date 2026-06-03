import React from 'react';
import { CopyIcon, CheckIcon } from '@phosphor-icons/react';

interface WidgetEmbedSectionProps {
  embedCode: string;
  onCopy: () => void;
  copied: boolean;
}

const WidgetEmbedSection: React.FC<WidgetEmbedSectionProps> = ({
  embedCode,
  onCopy,
  copied,
}) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-gray-900">Widget Embed</h2>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
      </svg>
    </div>
    <p className="text-sm mb-4 text-gray-600">
      Add the following snippet to the pages where you want the conversation
      widget to be.
    </p>

    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Embed Code</span>
        <button
          onClick={onCopy}
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
        {embedCode}
      </div>
    </div>
  </div>
);

export default WidgetEmbedSection;
