import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ConversationMessageProps, MarkdownMessageProps } from '../../types';
import { messageRadiusClasses } from '../../constants';

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({
  content,
  isLoading,
  role,
}) => (
  <div className="markdown-content">
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="vapi-mb-3 last:vapi-mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="vapi-list-disc vapi-list-inside vapi-mb-3 last:vapi-mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="vapi-list-decimal vapi-list-inside vapi-mb-3 last:vapi-mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="vapi-mb-0.5">{children}</li>,
        code: ({ children, ...props }) => {
          const inline = !('inline' in props) || props.inline;
          return inline ? (
            <code className="vapi-px-1 vapi-py-0.5 vapi-rounded vapi-bg-black vapi-bg-opacity-10 vapi-text-sm">
              {children}
            </code>
          ) : (
            <pre className="vapi-p-2 vapi-rounded vapi-bg-black vapi-bg-opacity-10 vapi-overflow-x-auto vapi-text-sm">
              <code>{children}</code>
            </pre>
          );
        },
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="vapi-underline hover:vapi-opacity-80"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="vapi-font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="vapi-italic">{children}</em>,
        h1: ({ children }) => (
          <h1 className="vapi-text-lg vapi-font-bold vapi-mb-1">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="vapi-text-base vapi-font-bold vapi-mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="vapi-text-sm vapi-font-bold vapi-mb-1">{children}</h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="vapi-border-l-2 vapi-pl-2 vapi-my-3 vapi-opacity-80">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    {isLoading && role === 'assistant' && (
      <span className="vapi-inline-block vapi-w-0.5 vapi-h-4 vapi-ml-0.5 vapi-bg-current vapi-animate-blink" />
    )}
  </div>
);

const ConversationMessage: React.FC<ConversationMessageProps> = ({
  role,
  content,
  colors,
  styles,
  isLoading = false,
}) => (
  <div className={`vapi-flex ${role === 'user' ? 'vapi-justify-end' : 'vapi-justify-start'}`}>
    <div
      className={`vapi-max-w-xs vapi-px-3 vapi-py-2 ${messageRadiusClasses[styles.radius]} vapi-text-sm`}
      style={{
        backgroundColor:
          role === 'user'
            ? colors.accentColor
            : styles.theme === 'dark'
              ? colors.baseColor // Will use filter for differentiation
              : colors.baseColor,
        color:
          role === 'user'
            ? '#FFFFFF'
            : styles.theme === 'dark'
              ? '#FFFFFF'
              : '#1F2937',
        ...(role === 'assistant' && {
          filter:
            styles.theme === 'dark'
              ? 'brightness(1.5) contrast(0.9)'
              : 'brightness(0.95) contrast(1.05)',
        }),
      }}
    >
      <MarkdownMessage content={content} isLoading={isLoading} role={role} />
    </div>
  </div>
);

export default ConversationMessage;
