import { LLMService } from '@omniforge/llm';

export class PerformanceAgent {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  /**
   * Analyze code performance characteristics
   */
  async analyzePerformance(code: string, language: string = 'typescript'): Promise<{
    complexity: 'low' | 'medium' | 'high';
    estimatedTimeComplexity: string;
    estimatedSpaceComplexity: string;
    bottlenecks: string[];
    recommendations: string[];
  }> {
    const prompt = `Analyze the performance characteristics of this ${language} code:

Code:
\`\`\`${language}
${code}
\`\`\`

Provide analysis with:
- Time complexity (Big O notation)
- Space complexity (Big O notation)
- Identified bottlenecks
- Performance recommendations

Format as JSON:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.2,
        maxTokens: 1024,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error analyzing performance:', error);
    }

    // Fallback analysis
    return {
      complexity: 'medium',
      estimatedTimeComplexity: 'O(n)',
      estimatedSpaceComplexity: 'O(n)',
      bottlenecks: [],
      recommendations: ['Add caching', 'Optimize loops', 'Consider lazy loading'],
    };
  }

  /**
   * Generate performance monitoring code
   */
  async generateMonitoring(framework: string = 'nextjs'): Promise<string> {
    const prompt = `Generate performance monitoring code for ${framework}:
- Performance metrics collection
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Error tracking

Provide complete implementation:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.3,
        maxTokens: 2048,
      });

      const codeMatch = response.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)\n```/);
      return codeMatch ? codeMatch[1] : response;
    } catch (error) {
      console.error('Error generating monitoring:', error);
      return '';
    }
  }

  /**
   * Suggest performance improvements
   */
  async suggestImprovements(code: string, metrics?: any): Promise<string[]> {
    const prompt = `Based on this code and performance metrics, suggest improvements:

Code:
\`\`\`typescript
${code}
\`\`\`

Metrics:
${metrics ? JSON.stringify(metrics, null, 2) : 'Not available'}

Provide specific, actionable recommendations:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.3,
        maxTokens: 1024,
      });

      // Extract recommendations (numbered list)
      const recommendations = response.match(/\d+\.\s*([^\n]+)/g) || [];
      return recommendations.map((rec: string) => rec.replace(/^\d+\.\s*/, '').trim());
    } catch (error) {
      console.error('Error generating improvements:', error);
      return [];
    }
  }
}

