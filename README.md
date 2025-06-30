# VAPI React Client SDK

> ⚠️ **Beta Version**: This library is currently in beta. APIs may change and some features might be unstable. Use with caution in production environments.

A modern React component library with embeddable voice and chat widgets built with Vite, TypeScript, and Tailwind CSS. Featuring seamless VAPI AI integration for voice conversations.

## Features

- 🎙️ **Voice Conversations**: Real-time voice calls with VAPI AI assistants
- 💬 **Chat Interface**: Text-based conversations with markdown support
- 🔀 **Hybrid Mode**: Seamlessly switch between voice and chat
- 🎨 **Highly Customizable**: Themes, colors, sizes, and positions
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔒 **Consent Management**: Built-in consent form for compliance
- ⚡ **Easy Integration**: Use as React component or embed in any HTML page
- 📘 **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install @vapi-ai/client-sdk-react
```

## Quick Start

The simplest way to add the widget to your website:

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"></script>
  </head>
  <body>
    <vapi-widget
      public-key="your-vapi-public-key"
      assistant-id="your-assistant-id"
      mode="chat"
      theme="light"
      size="full"
    ></vapi-widget>
  </body>
</html>
```

## VapiWidget Props

### Required Props

| Prop         | Type               | Description                               |
| ------------ | ------------------ | ----------------------------------------- |
| `publicKey`  | `string`           | Your VAPI public API key                  |
| `vapiConfig` | `string \| object` | VAPI assistant ID or configuration object |

### Optional Props

| Prop                      | Type                                                           | Default                 | Description                        |
| ------------------------- | -------------------------------------------------------------- | ----------------------- | ---------------------------------- |
| `mode`                    | `'voice' \| 'chat' \| 'hybrid'`                                | `'voice'`               | Widget interaction mode            |
| `theme`                   | `'light' \| 'dark'`                                            | `'light'`               | Color theme                        |
| `position`                | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'`        | Screen position                    |
| `size`                    | `'tiny' \| 'compact' \| 'full'`                                | `'full'`                | Widget size                        |
| `radius`                  | `'none' \| 'small' \| 'medium' \| 'large'`                     | `'medium'`              | Border radius                      |
| `apiUrl`                  | `string`                                                       | -                       | Custom API endpoint for chat mode  |
| `baseColor`               | `string`                                                       | -                       | Main background color              |
| `accentColor`             | `string`                                                       | `'#14B8A6'`             | Primary accent color               |
| `buttonBaseColor`         | `string`                                                       | `'#000000'`             | Floating button background         |
| `buttonAccentColor`       | `string`                                                       | `'#FFFFFF'`             | Floating button text/icon color    |
| `mainLabel`               | `string`                                                       | `'Talk with AI'`        | Widget header text                 |
| `startButtonText`         | `string`                                                       | `'Start'`               | Voice call start button text       |
| `endButtonText`           | `string`                                                       | `'End Call'`            | Voice call end button text         |
| `emptyVoiceMessage`       | `string`                                                       | -                       | Message when voice mode is empty   |
| `emptyVoiceActiveMessage` | `string`                                                       | -                       | Message during active voice call   |
| `emptyChatMessage`        | `string`                                                       | -                       | Message when chat is empty         |
| `emptyHybridMessage`      | `string`                                                       | -                       | Message for hybrid mode            |
| `requireConsent`          | `boolean`                                                      | `false`                 | Show consent form before first use |
| `termsContent`            | `string`                                                       | -                       | Custom consent form text           |
| `localStorageKey`         | `string`                                                       | `'vapi_widget_consent'` | Key for storing consent            |
| `showTranscript`          | `boolean`                                                      | `true`                  | Show/hide voice transcript         |

### Event Callbacks

| Prop          | Type                     | Description                      |
| ------------- | ------------------------ | -------------------------------- |
| `onCallStart` | `() => void`             | Triggered when voice call starts |
| `onCallEnd`   | `() => void`             | Triggered when voice call ends   |
| `onMessage`   | `(message: any) => void` | Triggered for all messages       |
| `onError`     | `(error: Error) => void` | Triggered on errors              |

## React Component Usage

If you're using React, you can import and use the widget as a component:

```tsx
import { VapiWidget } from '@vapi-ai/client-sdk-react';

function App() {
  return (
    <VapiWidget
      publicKey="your-vapi-public-key"
      vapiConfig="your-assistant-id"
      mode="hybrid"
      position="bottom-right"
      theme="light"
      accentColor="#3B82F6"
    />
  );
}
```

## Embedding Methods

### 1. Custom Element (Recommended)

Use the widget as a custom HTML element with kebab-case attributes - the cleanest and most modern approach:

```html
<vapi-widget
  public-key="pk_123"
  assistant-id="asst_456"
  mode="chat"
  theme="dark"
  accent-color="#8B5CF6"
  require-consent="true"
></vapi-widget>
```

### 2. Data Attributes

Use this approach if your environment doesn't support custom elements or for better compatibility with older systems:

```html
<div
  data-client-widget="VapiWidget"
  data-public-key="pk_123"
  data-assistant-id="asst_456"
  data-mode="voice"
  data-theme="dark"
  data-size="compact"
></div>
```

## Usage Examples

### Voice-Only Mode

```tsx
<VapiWidget
  publicKey="pk_123"
  vapiConfig="asst_456"
  mode="voice"
  size="tiny"
  showTranscript={false}
/>
```

### Chat-Only Mode

```tsx
<VapiWidget
  publicKey="pk_123"
  vapiConfig="asst_456"
  mode="chat"
  theme="dark"
  accentColor="#8B5CF6"
/>
```

### Hybrid Mode with Consent

```tsx
<VapiWidget
  publicKey="pk_123"
  vapiConfig={{
    assistantId: 'asst_456',
    model: 'gpt-4',
  }}
  mode="hybrid"
  requireConsent={true}
  termsContent="By using this service, you agree to our terms..."
  onMessage={(msg) => console.log('Message:', msg)}
/>
```

### Custom Styling

```tsx
<VapiWidget
  publicKey="pk_123"
  vapiConfig="asst_456"
  baseColor="#1a1a1a"
  accentColor="#ff6b6b"
  buttonBaseColor="#2a2a2a"
  buttonAccentColor="#ffffff"
  radius="large"
  size="full"
/>
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/VapiAI/client-sdk-react.git
cd client-sdk-react

# Install dependencies
npm install

# Build everything
npm run build:all
```

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build React library
- `npm run build:widget` - Build embeddable widget
- `npm run build:all` - Build both library and widget
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

### Running the Example

```bash
cd example
npm install
npm run dev
```

Visit <http://localhost:5173> to see the example app.

## Browser Support

- Chrome/Edge 79+
- Firefox 86+
- Safari 14.1+
- Mobile browsers with WebRTC support

## Requirements

- Microphone access for voice mode
- HTTPS required in production
- VAPI account and API key

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- [Documentation](https://docs.vapi.ai)
- [VAPI Dashboard](https://dashboard.vapi.ai)
- [Issues](https://github.com/VapiAI/client-sdk-react/issues)
