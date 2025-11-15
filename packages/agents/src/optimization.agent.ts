import { LLMService } from '../llm/llm.service';

export class OptimizationAgent {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  /**
   * Optimize generated code for performance
   */
  async optimizePerformance(code: string, language: string = 'typescript'): Promise<string> {
    const prompt = `Optimize the following ${language} code for performance:
- Reduce complexity
- Minimize memory usage
- Optimize algorithms
- Remove unnecessary operations

Code:
\`\`\`${language}
${code}
\`\`\`

Provide optimized version:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.2,
        maxTokens: 4096,
      });

      const codeMatch = response.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)\n```/);
      return codeMatch ? codeMatch[1] : response;
    } catch (error) {
      console.error('Error optimizing performance:', error);
      return code;
    }
  }

  /**
   * Optimize for bundle size
   */
  async optimizeBundleSize(code: string, framework: string = 'nextjs'): Promise<string> {
    const prompt = `Optimize the following code for minimal bundle size in ${framework}:
- Remove unused imports
- Use tree-shaking friendly patterns
- Minimize dependencies
- Optimize imports

Code:
\`\`\`typescript
${code}
\`\`\`

Provide optimized version:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.2,
        maxTokens: 4096,
      });

      const codeMatch = response.match(/```(?:typescript|ts)?\n([\s\S]*?)\n```/);
      return codeMatch ? codeMatch[1] : response;
    } catch (error) {
      console.error('Error optimizing bundle size:', error);
      return code;
    }
  }

  /**
   * Optimize database queries
   */
  async optimizeQueries(schema: string, queries: string[]): Promise<string[]> {
    const prompt = `Optimize these database queries based on this schema:

Schema:
\`\`\`
${schema}
\`\`\`

Queries:
${queries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Provide optimized queries with indexes and explainations:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.2,
        maxTokens: 2048,
      });

      // Extract queries from response
      const queryMatches = response.match(/\d+\.\s*([\s\S]*?)(?=\d+\.|$)/g) || [];
      return queryMatches.map((match) => match.replace(/^\d+\.\s*/, '').trim());
    } catch (error) {
      console.error('Error optimizing queries:', error);
      return queries;
    }
  }
}

