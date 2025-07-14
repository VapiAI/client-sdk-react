/// <reference types="vite/client" />

import { useState } from 'react';
import { VapiWidget } from '../../src';
import WidgetPreview from './components/WidgetPreview';
import AnimatedStatusIconPreview from './components/AnimatedStatusIconPreview';
import type { WidgetConfig } from './types';
import VapiLogomark from '../logomark-primary.svg';

import NavigationTabs from './components/builder/NavigationTabs';
import WidgetEmbedSection from './components/builder/WidgetEmbedSection';
import ModeSection from './components/builder/ModeSection';
import AppearanceSection from './components/builder/AppearanceSection';
import LayoutSection from './components/builder/LayoutSection';
import TextLabelsSection from './components/builder/TextLabelsSection';
import LegalConsentSection from './components/builder/LegalConsentSection';
import VapiConfigurationSection from './components/builder/VapiConfigurationSection';

function App() {
  const [config, setConfig] = useState<WidgetConfig>({
    mode: 'chat',
    theme: 'light',
    // Default colors matching VapiWidget defaults
    baseBgColor: '#ffffff', // Light mode default (automatically switches to #000000 in dark mode)
    accentColor: '#14B8A6', // Default teal accent
    ctaButtonColor: '#000000', // Default black for buttons
    ctaButtonTextColor: '#ffffff', // Default white for button text
    borderRadius: 'large',
    size: 'full',
    position: 'bottom-right',
    title: 'TALK WITH AI',
    ctaTitle: 'Chat with Support',
    ctaSubtitle: "We're here to help",
    startButtonText: 'Start',
    endButtonText: 'End Call',
    consentRequired: true,
    consentTitle: 'Terms and conditions',
    consentContent:
      'By clicking "Agree," and each time I interact with this AI agent, I consent to the recording, storage, and sharing of my communications with third-party service providers, and as otherwise described in our Terms of Service.',
    consentStorageKey: 'vapi_widget_consent',
    voiceShowTranscript: false,
    chatFirstMessage: 'Hey, How can I help you today?',
    // Vapi Configuration
    publicKey: import.meta.env.VITE_VAPI_API_KEY || 'your-vapi-public-key',
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || 'demo-assistant-id',
    assistantOverrides: {
      variableValues: { name: 'John' },
    },
    assistant: {
      model: {
        provider: 'openai',
        model: 'gpt-4.1-nano',
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
      },
    },
  });

  const [copied, setCopied] = useState(false);
  const [currentView, setCurrentView] = useState<'widget' | 'icon'>('widget');

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const generateEmbedCode = () => {
    const attributes = [
      `mode="${config.mode}"`,
      `theme="${config.theme}"`,
      `base-bg-color="${config.baseBgColor}"`,
      `accent-color="${config.accentColor}"`,
      `cta-button-color="${config.ctaButtonColor}"`,
      `cta-button-text-color="${config.ctaButtonTextColor}"`,
      `border-radius="${config.borderRadius}"`,
      `size="${config.size}"`,
      `position="${config.position}"`,
      `title="${config.title}"`,
      config.ctaTitle ? `cta-title="${config.ctaTitle}"` : null,
      config.ctaSubtitle ? `cta-subtitle="${config.ctaSubtitle}"` : null,
      `start-button-text="${config.startButtonText}"`,
      config.endButtonText ? `end-button-text="${config.endButtonText}"` : null,
      `consent-required="${config.consentRequired}"`,
      config.consentTitle ? `consent-title="${config.consentTitle}"` : null,
      `consent-content="${config.consentContent}"`,
      `consent-storage-key="${config.consentStorageKey}"`,
      `voice-show-transcript="${config.voiceShowTranscript}"`,
      config.chatFirstMessage
        ? `chat-first-message="${config.chatFirstMessage}"`
        : null,
    ]
      .filter(Boolean)
      .join(' ');

    return `<vapi-widget ${attributes}></vapi-widget>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <NavigationTabs currentView={currentView} onViewChange={setCurrentView} />

      {/* Content */}
      {currentView === 'widget' ? (
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white border-gray-200 rounded-lg border shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <img
                      src={VapiLogomark}
                      alt="Vapi Logo"
                      className="w-6 h-6"
                    />
                    <h1 className="text-xl font-semibold text-gray-900">
                      VAPI Widget Builder
                    </h1>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Widget Embed Section */}
                  <WidgetEmbedSection
                    embedCode={generateEmbedCode()}
                    onCopy={() => copyToClipboard(generateEmbedCode())}
                    copied={copied}
                  />

                  {/* Mode Section */}
                  <ModeSection
                    mode={config.mode}
                    showTranscript={config.voiceShowTranscript}
                    onModeChange={(mode) => updateConfig('mode', mode)}
                    onTranscriptToggle={(value) =>
                      updateConfig('voiceShowTranscript', value)
                    }
                  />

                  {/* Appearance Section */}
                  <AppearanceSection
                    config={config}
                    updateConfig={updateConfig}
                  />

                  {/* Layout Section */}
                  <LayoutSection config={config} updateConfig={updateConfig} />

                  {/* Text & Labels Section */}
                  <TextLabelsSection
                    config={config}
                    updateConfig={updateConfig}
                  />

                  {/* Legal & Consent Section */}
                  <LegalConsentSection
                    config={config}
                    updateConfig={updateConfig}
                  />

                  {/* Vapi Configuration Section */}
                  <VapiConfigurationSection
                    config={config}
                    updateConfig={updateConfig}
                  />
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <WidgetPreview config={config} />
          </div>

          {/* Live Widget - Only show for widget view */}
          <VapiWidget
            publicKey={config.publicKey}
            assistantId={config.assistantId}
            assistantOverrides={config.assistantOverrides}
            assistant={config.assistant}
            position={config.position}
            mode={config.mode}
            theme={config.theme}
            baseBgColor={config.baseBgColor}
            accentColor={config.accentColor}
            ctaButtonColor={config.ctaButtonColor}
            ctaButtonTextColor={config.ctaButtonTextColor}
            borderRadius={config.borderRadius}
            size={config.size}
            title={config.title}
            startButtonText={config.startButtonText}
            endButtonText={config.endButtonText}
            consentRequired={config.consentRequired}
            consentTitle={config.consentTitle}
            consentContent={config.consentContent}
            consentStorageKey={config.consentStorageKey}
            voiceShowTranscript={config.voiceShowTranscript}
            chatFirstMessage={config.chatFirstMessage}
            ctaTitle={config.ctaTitle}
            ctaSubtitle={config.ctaSubtitle}
            onVoiceStart={() => console.log('Call started')}
            onVoiceEnd={() => console.log('Call ended')}
            onMessage={(message) => console.log('Message:', message)}
            onError={(error) => console.error('Error:', error)}
          />
        </div>
      ) : (
        <AnimatedStatusIconPreview />
      )}
    </div>
  );
}

export default App;
