import { LLMService } from '@omniforge/llm';

export class CodeReviewAgent {
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  /**
   * Review generated code for quality, security, and best practices
   */
  async reviewCode(code: string, language: string = 'typescript'): Promise<{
    score: number;
    issues: Array<{ severity: 'error' | 'warning' | 'info'; message: string; line?: number }>;
    suggestions: string[];
    improvements: string[];
  }> {
    const prompt = `Review the following ${language} code for:
1. Code quality and best practices
2. Security vulnerabilities
3. Performance issues
4. Maintainability concerns

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a review with:
- Overall score (0-100)
- List of issues with severity (error/warning/info)
- Suggestions for improvement
- Specific improvements to implement

Format as JSON:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.3,
        maxTokens: 2048,
      });

      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to basic review
      return this.basicReview(code);
    } catch (error) {
      console.error('Error reviewing code:', error);
      return this.basicReview(code);
    }
  }

  /**
   * Optimize code based on review
   */
  async optimizeCode(code: string, review: any, language: string = 'typescript'): Promise<string> {
    const prompt = `Optimize the following ${language} code based on this review:

Review:
${JSON.stringify(review, null, 2)}

Original Code:
\`\`\`${language}
${code}
\`\`\`

Provide optimized code that addresses all issues:`;

    try {
      const response = await this.llmService.generate(prompt, {
        temperature: 0.2,
        maxTokens: 4096,
      });

      // Extract code from response
      const codeMatch = response.match(/```(?:typescript|ts|javascript|js)?\n([\s\S]*?)\n```/);
      return codeMatch ? codeMatch[1] : response;
    } catch (error) {
      console.error('Error optimizing code:', error);
      return code;
    }
  }

  private basicReview(code: string): any {
    // Basic heuristic review
    const issues: any[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('TODO')) {
        issues.push({
          severity: 'info',
          message: 'TODO comment found',
          line: index + 1,
        });
      }
      if (line.includes('console.log') && !line.includes('//')) {
        issues.push({
          severity: 'warning',
          message: 'console.log in production code',
          line: index + 1,
        });
      }
    });

    return {
      score: issues.length === 0 ? 90 : Math.max(50, 90 - issues.length * 5),
      issues,
      suggestions: ['Add error handling', 'Add type annotations', 'Add comments'],
      improvements: [],
    };
  }
}

