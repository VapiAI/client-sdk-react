/**
 * OpenAI Specification Types for Vapi React SDK
 *
 * This module provides TypeScript types and utilities for OpenAI API compliance,
 * including support for the `developer` role required by GPT-5.x and o-series models.
 *
 * @see https://platform.openai.com/docs/guides/text-generation
 */

/**
 * Valid message roles according to the OpenAI API specification.
 *
 * - `system`: Sets the behavior of the assistant (deprecated in favor of `developer` for newer models)
 * - `user`: Represents messages from the end user
 * - `assistant`: Represents messages from the AI assistant
 * - `developer`: Instructions from the application developer (required for GPT-5.x and o-series models)
 * - `tool`: Represents tool/function call results
 * - `function`: Legacy role for function call results (deprecated, use `tool` instead)
 */
export const MessageRole = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant',
  DEVELOPER: 'developer',
  TOOL: 'tool',
  /** @deprecated Use 'tool' instead. The 'function' role is deprecated in favor of 'tool'. */
  FUNCTION: 'function',
} as const;

export type MessageRoleType = (typeof MessageRole)[keyof typeof MessageRole];

/**
 * Message roles that are commonly used in conversations.
 * Includes the new `developer` role for GPT-5.x and o-series models.
 */
export type ConversationRole =
  | 'system'
  | 'user'
  | 'assistant'
  | 'developer'
  | 'tool';

/**
 * Extended role type that includes the deprecated 'function' role for backward compatibility.
 */
export type ExtendedMessageRole = ConversationRole | 'function';

/**
 * Available OpenAI models supported by Vapi.
 * Includes GPT-5.x series and o-series models that require the `developer` role.
 */
export const OpenAIModel = {
  // GPT-5 series (require developer role)
  GPT_5_2: 'gpt-5.2',
  GPT_5_2_CHAT: 'gpt-5.2-chat',
  GPT_5_2_TURBO: 'gpt-5.2-turbo',
  GPT_5_1: 'gpt-5.1',
  GPT_5_1_CHAT: 'gpt-5.1-chat',
  GPT_5_1_TURBO: 'gpt-5.1-turbo',
  GPT_5: 'gpt-5',
  GPT_5_CHAT: 'gpt-5-chat',
  GPT_5_TURBO: 'gpt-5-turbo',

  // O-series models (require developer role)
  O1: 'o1',
  O1_PREVIEW: 'o1-preview',
  O1_MINI: 'o1-mini',
  O3: 'o3',
  O3_MINI: 'o3-mini',

  // GPT-4 series (support both system and developer roles)
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4: 'gpt-4',
  GPT_4_VISION: 'gpt-4-vision-preview',

  // GPT-3.5 series
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_3_5_TURBO_16K: 'gpt-3.5-turbo-16k',
} as const;

export type OpenAIModelType = (typeof OpenAIModel)[keyof typeof OpenAIModel];

/**
 * Models that require or support the `developer` role.
 * GPT-5.x and o-series models require the developer role for system-level instructions.
 */
export const DEVELOPER_ROLE_MODELS: readonly string[] = [
  // GPT-5 series
  'gpt-5.2',
  'gpt-5.2-chat',
  'gpt-5.2-turbo',
  'gpt-5.1',
  'gpt-5.1-chat',
  'gpt-5.1-turbo',
  'gpt-5',
  'gpt-5-chat',
  'gpt-5-turbo',
  // O-series
  'o1',
  'o1-preview',
  'o1-mini',
  'o3',
  'o3-mini',
] as const;

/**
 * All valid message roles.
 */
export const VALID_MESSAGE_ROLES: readonly string[] = [
  'system',
  'user',
  'assistant',
  'developer',
  'tool',
  'function',
] as const;

/**
 * Checks if a model supports/requires the `developer` role.
 *
 * @param model - The model identifier to check
 * @returns true if the model requires the developer role for system-level instructions
 *
 * @example
 * ```typescript
 * supportsDevloperRole('gpt-5.2'); // true
 * supportsDevloperRole('o1'); // true
 * supportsDevloperRole('gpt-4'); // false
 * ```
 */
export function supportsDeveloperRole(model: string): boolean {
  return DEVELOPER_ROLE_MODELS.includes(model);
}

/**
 * Validates a message role and returns whether it's valid.
 *
 * @param role - The role to validate
 * @returns true if the role is a valid message role
 *
 * @example
 * ```typescript
 * isValidRole('user'); // true
 * isValidRole('developer'); // true
 * isValidRole('invalid'); // false
 * ```
 */
export function isValidRole(role: string): role is ExtendedMessageRole {
  return VALID_MESSAGE_ROLES.includes(role);
}

/**
 * Checks if a role is deprecated.
 *
 * @param role - The role to check
 * @returns true if the role is deprecated
 *
 * @example
 * ```typescript
 * isDeprecatedRole('function'); // true
 * isDeprecatedRole('tool'); // false
 * ```
 */
export function isDeprecatedRole(role: string): boolean {
  return role === 'function';
}

/**
 * Gets the recommended replacement for a deprecated role.
 *
 * @param role - The deprecated role
 * @returns The recommended replacement role, or null if not deprecated
 *
 * @example
 * ```typescript
 * getReplacementRole('function'); // 'tool'
 * getReplacementRole('user'); // null
 * ```
 */
export function getReplacementRole(role: string): string | null {
  if (role === 'function') {
    return 'tool';
  }
  return null;
}

/**
 * Validates a role and logs a deprecation warning if necessary.
 * This is useful for gradual migration from deprecated roles.
 *
 * @param role - The role to validate
 * @returns The validated role (unchanged)
 * @throws Error if the role is not valid
 *
 * @example
 * ```typescript
 * validateRole('user'); // 'user' (no warning)
 * validateRole('function'); // 'function' (logs deprecation warning)
 * validateRole('invalid'); // throws Error
 * ```
 */
export function validateRole(role: string): ExtendedMessageRole {
  if (!isValidRole(role)) {
    throw new Error(
      `Invalid message role: '${role}'. Valid roles are: ${VALID_MESSAGE_ROLES.join(', ')}`
    );
  }

  if (isDeprecatedRole(role)) {
    const replacement = getReplacementRole(role);
    console.warn(
      `[Vapi SDK] The '${role}' role is deprecated.${replacement ? ` Use '${replacement}' instead.` : ''}`
    );
  }

  return role as ExtendedMessageRole;
}

/**
 * Message interface for chat conversations.
 */
export interface Message {
  /**
   * The role of the message author.
   */
  role: ExtendedMessageRole;

  /**
   * The content of the message.
   */
  content: string;

  /**
   * Optional name for the message author (for multi-participant conversations).
   */
  name?: string;

  /**
   * Optional tool call ID (for tool role messages).
   */
  tool_call_id?: string;

  /**
   * Optional timestamp for when the message was created.
   */
  timestamp?: Date;
}

/**
 * Creates a message object with validation.
 *
 * @param role - The message role
 * @param content - The message content
 * @param options - Optional additional properties
 * @returns A validated Message object
 *
 * @example
 * ```typescript
 * const msg = createMessage('user', 'Hello!');
 * const devMsg = createMessage('developer', 'You are a helpful assistant.');
 * ```
 */
export function createMessage(
  role: ExtendedMessageRole,
  content: string,
  options?: Partial<Omit<Message, 'role' | 'content'>>
): Message {
  validateRole(role);

  return {
    role,
    content,
    timestamp: new Date(),
    ...options,
  };
}
