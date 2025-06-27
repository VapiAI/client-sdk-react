import React from 'react';
import ColorPickerInput from '../ui/ColorPickerInput';
import type { WidgetConfig } from '../../types';

interface AppearanceSectionProps {
  config: WidgetConfig;
  updateConfig: (key: keyof WidgetConfig, value: any) => void;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  config,
  updateConfig,
}) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-medium text-gray-900">Appearance</h2>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
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
          const newTheme = e.target.value as 'light' | 'dark';
          updateConfig('theme', newTheme);
          // Automatically adjust base color based on theme
          if (newTheme === 'dark') {
            updateConfig('baseColor', '#000000');
          } else {
            updateConfig('baseColor', '#ffffff');
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
);

export default AppearanceSection;
