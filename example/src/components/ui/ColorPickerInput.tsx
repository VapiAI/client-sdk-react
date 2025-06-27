import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerInputProps {
  label: string
  value: string
  onChange: (color: string) => void
  description?: string
}

const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ 
  label, 
  value, 
  onChange, 
  description 
}) => {
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

export default ColorPickerInput 