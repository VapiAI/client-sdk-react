// Import global styles
import './styles/globals.css';

// Main library exports
export { default as VapiWidget } from './components/VapiWidget';

// Export types
export type { VapiWidgetProps, ConversationMessageRole } from './components';

// Export OpenAI spec types
export * from './types';

// Export hooks
export * from './hooks';

// Export utilities
export * from './utils';
