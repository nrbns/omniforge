import { Document, RAGContext } from './types';

export class ContextManagerService {
  private maxContextLength: number = 8000; // tokens
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  /**
   * Manage context window for multi-step reasoning
   */
  manageContext(
    currentQuery: string,
    retrievedDocs: Document[],
    maxTokens: number = 2048
  ): RAGContext {
    // Prioritize documents by relevance
    const prioritizedDocs = this.prioritizeDocuments(retrievedDocs);

    // Truncate to fit context window
    const selectedDocs = this.truncateToFit(prioritizedDocs, maxTokens);

    // Manage conversation history
    this.addToHistory('user', currentQuery);
    
    // Limit history to last N messages
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }

    return {
      query: currentQuery,
      retrievedDocs: selectedDocs,
      conversationHistory: [...this.conversationHistory],
      maxTokens,
    };
  }

  /**
   * Prioritize documents by type and relevance
   */
  private prioritizeDocuments(documents: Document[]): Document[] {
    const typePriority: Record<string, number> = {
      template: 10,
      knowledge: 8,
      code: 6,
      idea: 5,
      user_input: 3,
    };

    return documents.sort((a, b) => {
      const priorityA = typePriority[a.metadata.type] || 0;
      const priorityB = typePriority[b.metadata.type] || 0;
      return priorityB - priorityA;
    });
  }

  /**
   * Truncate documents to fit context window
   */
  private truncateToFit(documents: Document[], maxTokens: number): Document[] {
    let currentTokens = 0;
    const selected: Document[] = [];

    for (const doc of documents) {
      const docTokens = Math.ceil(doc.content.length / 4); // Rough estimate: 4 chars per token
      if (currentTokens + docTokens <= maxTokens) {
        selected.push(doc);
        currentTokens += docTokens;
      } else {
        // Truncate document content to fit
        const remainingTokens = maxTokens - currentTokens;
        if (remainingTokens > 100) {
          selected.push({
            ...doc,
            content: doc.content.slice(0, remainingTokens * 4),
          });
        }
        break;
      }
    }

    return selected;
  }

  /**
   * Add message to conversation history
   */
  addToHistory(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({ role, content });
  }

  /**
   * Get conversation summary for long contexts
   */
  async summarizeHistory(): Promise<string> {
    if (this.conversationHistory.length <= 5) {
      return this.conversationHistory.map((m) => `${m.role}: ${m.content}`).join('\n');
    }

    // Summarize old messages, keep recent ones
    const recent = this.conversationHistory.slice(-3);
    const old = this.conversationHistory.slice(0, -3);
    
    return `[Previous conversation summarized]\n${old.map((m) => `${m.role}: ...`).join('\n')}\n${recent.map((m) => `${m.role}: ${m.content}`).join('\n')}`;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Extract key entities from context
   */
  extractEntities(documents: Document[]): string[] {
    const entities = new Set<string>();
    
    documents.forEach((doc) => {
      // Extract from metadata tags
      if (doc.metadata.tags) {
        doc.metadata.tags.forEach((tag) => entities.add(tag));
      }

      // Extract from content (simple keyword extraction)
      const words = doc.content.match(/\b[A-Z][a-z]+\b/g) || [];
      words.slice(0, 5).forEach((word) => entities.add(word));
    });

    return Array.from(entities);
  }
}

