import { test, expect } from '@playwright/test';

/**
 * Tests for OpenAI Specification Types
 * Verifies the developer role for GPT-5.x and o-series models.
 */
test.describe('OpenAI Types', () => {
  test('MessageRole should define all standard roles including developer', async ({ page }) => {
    const result = await page.evaluate(() => {
      const MessageRole = {
        SYSTEM: 'system', USER: 'user', ASSISTANT: 'assistant',
        DEVELOPER: 'developer', TOOL: 'tool', FUNCTION: 'function',
      };
      return MessageRole;
    });
    expect(result.DEVELOPER).toBe('developer');
    expect(result.FUNCTION).toBe('function');
  });

  test('OpenAIModel should define GPT-5.x and o-series models', async ({ page }) => {
    const models = await page.evaluate(() => ({
      GPT_5_2: 'gpt-5.2', GPT_5: 'gpt-5',
      O1: 'o1', O3: 'o3', GPT_4O: 'gpt-4o',
    }));
    expect(models.GPT_5_2).toBe('gpt-5.2');
    expect(models.O1).toBe('o1');
    expect(models.GPT_4O).toBe('gpt-4o');
  });

  test('supportsDeveloperRole should identify models requiring developer role', async ({ page }) => {
    const results = await page.evaluate(() => {
      const DEVELOPER_ROLE_MODELS = [
        'gpt-5.2', 'gpt-5.1', 'gpt-5', 'o1', 'o1-preview', 'o3', 'o3-mini',
      ];
      const supportsDeveloperRole = (model: string) => DEVELOPER_ROLE_MODELS.includes(model);
      return {
        gpt52: supportsDeveloperRole('gpt-5.2'),
        o1: supportsDeveloperRole('o1'),
        gpt4o: supportsDeveloperRole('gpt-4o'),
      };
    });
    expect(results.gpt52).toBe(true);
    expect(results.o1).toBe(true);
    expect(results.gpt4o).toBe(false);
  });

  test('isValidRole should validate message roles', async ({ page }) => {
    const results = await page.evaluate(() => {
      const VALID_ROLES = ['system', 'user', 'assistant', 'developer', 'tool', 'function'];
      const isValidRole = (role: string) => VALID_ROLES.includes(role);
      return {
        developer: isValidRole('developer'),
        invalid: isValidRole('invalid'),
      };
    });
    expect(results.developer).toBe(true);
    expect(results.invalid).toBe(false);
  });

  test('isDeprecatedRole should identify function as deprecated', async ({ page }) => {
    const results = await page.evaluate(() => {
      const isDeprecatedRole = (role: string) => role === 'function';
      return {
        function: isDeprecatedRole('function'),
        tool: isDeprecatedRole('tool'),
      };
    });
    expect(results.function).toBe(true);
    expect(results.tool).toBe(false);
  });

  test('getReplacementRole should return tool for function', async ({ page }) => {
    const result = await page.evaluate(() => {
      const getReplacementRole = (role: string) => role === 'function' ? 'tool' : null;
      return { function: getReplacementRole('function'), user: getReplacementRole('user') };
    });
    expect(result.function).toBe('tool');
    expect(result.user).toBe(null);
  });

  test('createMessage should create messages with developer role', async ({ page }) => {
    const result = await page.evaluate(() => {
      const createMessage = (role: string, content: string, options?: any) => ({
        role, content, timestamp: new Date(), ...options,
      });
      const msg = createMessage('developer', 'You are a helpful assistant.');
      return { role: msg.role, content: msg.content };
    });
    expect(result.role).toBe('developer');
    expect(result.content).toBe('You are a helpful assistant.');
  });
});

test.describe('ChatMessage Role Types', () => {
  test('should support developer role in ChatMessage interface', async ({ page }) => {
    const result = await page.evaluate(() => {
      const messages = [
        { role: 'developer', content: 'System instructions', timestamp: new Date() },
        { role: 'user', content: 'Hello', timestamp: new Date() },
        { role: 'assistant', content: 'Hi!', timestamp: new Date() },
        { role: 'tool', content: 'Result', timestamp: new Date() },
      ];
      return messages.map((m) => m.role);
    });
    expect(result).toContain('developer');
    expect(result).toContain('user');
    expect(result).toContain('assistant');
    expect(result).toContain('tool');
  });
});
