/**
 * Rolling Context Compaction & Memory Manager
 * Maintains rolling MEMORY.md summary of historical turns to keep context windows compact.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function compactConversationHistory(messages: ChatMessage[], maxRawMessages = 4): {
  memorySummary: string;
  activeMessages: ChatMessage[];
} {
  if (messages.length <= maxRawMessages) {
    return {
      memorySummary: '',
      activeMessages: messages,
    };
  }

  const olderMessages = messages.slice(0, messages.length - maxRawMessages);
  const activeMessages = messages.slice(messages.length - maxRawMessages);

  const summaryBullets = olderMessages
    .filter(m => m.role !== 'system')
    .map(m => `- [${m.role.toUpperCase()}]: ${m.content.slice(0, 120)}...`);

  const memorySummary = `# MEMORY.md (Rolling Context Summary)\n\nPrevious Turns Summary:\n${summaryBullets.join('\n')}\n`;

  return {
    memorySummary,
    activeMessages,
  };
}
