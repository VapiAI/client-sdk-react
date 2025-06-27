import React from 'react'
import { ChatCircleIcon } from '@phosphor-icons/react'

interface NavigationTabsProps {
  currentView: 'widget' | 'icon'
  onViewChange: (view: 'widget' | 'icon') => void
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ currentView, onViewChange }) => (
  <div className="bg-white border-b border-gray-200">
    <div className="container mx-auto px-4">
      <nav className="flex space-x-8">
        <button
          onClick={() => onViewChange('widget')}
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
          onClick={() => onViewChange('icon')}
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
)

export default NavigationTabs 