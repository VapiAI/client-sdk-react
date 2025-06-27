import React from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import VapiWidget from '../components/VapiWidget'

// Widget configuration interface
export interface WidgetConfig {
  container: string | HTMLElement
  component: keyof typeof COMPONENTS
  props?: any
}

// Available components for embedding
const COMPONENTS = {
  VapiWidget,
}

// Widget loader class for managing embedded components
export class WidgetLoader {
  private root: any
  private container: HTMLElement

  constructor(config: WidgetConfig) {
    // Get container element
    this.container = typeof config.container === 'string' 
      ? document.querySelector(config.container) as HTMLElement
      : config.container

    if (!this.container) {
      throw new Error('Container element not found')
    }

    const Component = COMPONENTS[config.component] as any
    if (!Component) {
      throw new Error(`Component "${config.component}" not found`)
    }

    // Create root and render component
    this.root = createRoot(this.container)
    this.root.render(React.createElement(Component, config.props || {}))
  }

  destroy() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }
}

// Helper function to convert kebab-case to camelCase
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

// Helper function to parse attribute values
function parseAttributeValue(value: string): any {
  // Try to parse as boolean
  if (value === 'true') return true
  if (value === 'false') return false
  
  // Try to parse as number
  if (!isNaN(Number(value)) && value !== '') {
    return Number(value)
  }
  
  // Return as string
  return value
}

// Auto-initialize widgets on page load
function initializeWidgets() {
  // Initialize VAPI widgets with data attributes
  const vapiElements = document.querySelectorAll('[data-client-widget="VapiWidget"]')
  vapiElements.forEach((element) => {
    const htmlElement = element as HTMLElement
    
    // Extract props from data-props attribute (legacy support)
    let props: any = {}
    const propsAttr = htmlElement.getAttribute('data-props')
    if (propsAttr) {
      try {
        props = JSON.parse(propsAttr)
      } catch (e) {
        console.error('Failed to parse data-props:', e)
      }
    }

    // Extract props from individual data attributes (new approach)
    Array.from(htmlElement.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-client-widget' && attr.name !== 'data-props') {
        const propName = kebabToCamel(attr.name.replace('data-', ''))
        props[propName] = parseAttributeValue(attr.value)
      }
    })

    // Map HTML attributes to component props
    const attributeMap: Record<string, string> = {
      'mode': 'mode',
      'theme': 'theme',
      'base-color': 'baseColor',
      'accent-color': 'accentColor',
      'button-base-color': 'buttonBaseColor',
      'button-accent-color': 'buttonAccentColor',
      'radius': 'radius',
      'size': 'size',
      'main-label': 'mainLabel',
      'start-button-text': 'startButtonText',
      'end-button-text': 'endButtonText',
      'require-consent': 'requireConsent',
      'terms-content': 'termsContent',
      'local-storage-key': 'localStorageKey',
      'public-key': 'publicKey',
      'assistant-id': 'assistantId',
      'position': 'position',
      'primary-color': 'primaryColor' // legacy support
    }

    // Extract attributes directly from the element
    Object.entries(attributeMap).forEach(([htmlAttr, propName]) => {
      const value = htmlElement.getAttribute(htmlAttr)
      if (value !== null) {
        props[propName] = parseAttributeValue(value)
      }
    })

    // Default values if not provided
    if (!props.publicKey) {
      console.warn('VapiWidget: publicKey is required but not provided')
      props.publicKey = 'demo-key'
    }
    if (!props.assistantId) {
      console.warn('VapiWidget: assistantId is required but not provided')
      props.assistantId = 'demo-assistant'
    }

    try {
      new WidgetLoader({
        container: htmlElement,
        component: 'VapiWidget',
        props
      })
    } catch (error) {
      console.error('Failed to initialize VapiWidget:', error)
    }
  })

  // Initialize other widgets (legacy support)
  const elements = document.querySelectorAll('[data-client-widget]')
  elements.forEach((element) => {
    const htmlElement = element as HTMLElement
    const componentName = htmlElement.getAttribute('data-client-widget')
    
    // Skip if already processed as VapiWidget
    if (componentName === 'VapiWidget') return
    
    if (componentName && componentName in COMPONENTS) {
      const propsAttr = htmlElement.getAttribute('data-props')
      let props = {}
      
      if (propsAttr) {
        try {
          props = JSON.parse(propsAttr)
        } catch (e) {
          console.error('Failed to parse data-props:', e)
        }
      }

      try {
        new WidgetLoader({
          container: htmlElement,
          component: componentName as keyof typeof COMPONENTS,
          props
        })
      } catch (error) {
        console.error(`Failed to initialize ${componentName}:`, error)
      }
    }
  })
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWidgets)
} else {
  initializeWidgets()
}

// Make WidgetLoader available globally
declare global {
  interface Window {
    WidgetLoader: typeof WidgetLoader
  }
}

window.WidgetLoader = WidgetLoader

export default WidgetLoader 