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
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-1 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-1 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="mb-0.5">{children}</li>,
        code: ({ children, ...props }) => {
          const inline = !('inline' in props) || props.inline;
          return inline ? (
            <code className="px-1 py-0.5 rounded bg-black bg-opacity-10 text-sm">
              {children}
            </code>
          ) : (
            <pre className="p-2 rounded bg-black bg-opacity-10 overflow-x-auto text-sm">
              <code>{children}</code>
            </pre>
          );
        },
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mb-1">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold mb-1">{children}</h3>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 pl-2 my-1 opacity-80">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    {isLoading && role === 'assistant' && (
      <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-blink" />
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
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs px-3 py-2 ${messageRadiusClasses[styles.radius]} text-sm`}
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
