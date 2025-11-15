import { RAGContext, RAGResponse, Document } from './types';
import { RetrievalService } from './retrieval.service';
import { LLMService } from '@omniforge/llm';

export class RAGService {
  private retrievalService: RetrievalService;
  private llmService: LLMService;

  constructor(retrievalService: RetrievalService, llmService: LLMService) {
    this.retrievalService = retrievalService;
    this.llmService = llmService;
  }

  /**
   * Generate response using RAG (Retrieval-Augmented Generation)
   */
  async generate(context: RAGContext): Promise<RAGResponse> {
    // Step 1: Retrieve relevant documents
    const queryResult = await this.retrievalService.retrieve(
      context.query,
      'omniforge',
      context.maxTokens ? Math.floor(context.maxTokens / 100) : 10,
      true // Use hybrid search
    );

    // Step 2: Combine retrieved docs with existing context
    const retrievedDocs = queryResult.results.map((r) => r.document);
    const allDocs = [...(context.retrievedDocs || []), ...retrievedDocs];

    // Step 3: Build context prompt with retrieved documents
    const contextPrompt = this.buildContextPrompt(context.query, allDocs, context.conversationHistory);

    // Step 4: Generate response using LLM with context
    const answer = await this.llmService.generate(contextPrompt, {
      maxTokens: context.maxTokens || 2048,
      temperature: 0.7,
    });

    // Step 5: Extract sources and calculate confidence
    const sources = this.extractSources(answer, allDocs);
    const confidence = this.calculateConfidence(queryResult.results);

    return {
      answer,
      sources,
      confidence,
      reasoning: `Retrieved ${retrievedDocs.length} relevant documents for context augmentation.`,
    };
  }

  /**
   * Build context prompt from retrieved documents
   */
  private buildContextPrompt(
    query: string,
    documents: Document[],
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string {
    let prompt = `You are an expert assistant helping with app development. Answer the question using the provided context.

Context from knowledge base:
${documents
  .map((doc, i) => `${i + 1}. [${doc.metadata.type}] ${doc.content.slice(0, 500)}...`)
  .join('\n\n')}

`;

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `\nConversation history:\n${conversationHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n')}\n\n`;
    }

    prompt += `Question: ${query}\n\nAnswer:`;
    return prompt;
  }

  /**
   * Extract source documents referenced in answer
   */
  private extractSources(answer: string, documents: Document[]): Document[] {
    // Simple heuristic: return top documents
    // In production, use citation extraction
    return documents.slice(0, Math.min(3, documents.length));
  }

  /**
   * Calculate confidence based on retrieval scores
   */
  private calculateConfidence(results: any[]): number {
    if (results.length === 0) return 0;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return Math.min(1, avgScore * 1.2); // Scale to 0-1
  }

  /**
   * Generate idea spec using RAG
   */
  async generateIdeaSpec(idea: string, existingIdeas?: Document[]): Promise<any> {
    const context: RAGContext = {
      query: `Parse this app idea into a structured specification with pages, data models, APIs, and integrations: ${idea}`,
      retrievedDocs: existingIdeas || [],
    };

    const response = await this.generate(context);
    
    // Parse JSON from response
    try {
      const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing spec from RAG response:', error);
    }

    return null;
  }

  /**
   * Generate code using RAG with template retrieval
   */
  async generateCodeWithRAG(
    requirements: string,
    language: string = 'typescript',
    framework?: string
  ): Promise<string> {
    const context: RAGContext = {
      query: `Generate ${language} code for: ${requirements}${framework ? ` using ${framework}` : ''}`,
    };

    const response = await this.generate(context);
    return response.answer;
  }
}

