import { Injectable } from '@nestjs/common';
import { CodeReviewAgent, OptimizationAgent, PerformanceAgent } from '@omniforge/agents';
import { LLMService } from '@omniforge/llm';

@Injectable()
export class CodeReviewService {
  private codeReviewAgent: CodeReviewAgent;
  private optimizationAgent: OptimizationAgent;
  private performanceAgent: PerformanceAgent;

  constructor(private llmService: LLMService) {
    this.codeReviewAgent = new CodeReviewAgent(llmService);
    this.optimizationAgent = new OptimizationAgent(llmService);
    this.performanceAgent = new PerformanceAgent(llmService);
  }

  async reviewCode(code: string, language: string = 'typescript') {
    return this.codeReviewAgent.reviewCode(code, language);
  }

  async optimizeCode(code: string, review: any, language: string = 'typescript') {
    return this.codeReviewAgent.optimizeCode(code, review, language);
  }

  async optimizePerformance(code: string, language: string = 'typescript') {
    return this.optimizationAgent.optimizePerformance(code, language);
  }

  async optimizeBundleSize(code: string, framework: string = 'nextjs') {
    return this.optimizationAgent.optimizeBundleSize(code, framework);
  }

  async analyzePerformance(code: string, language: string = 'typescript') {
    return this.performanceAgent.analyzePerformance(code, language);
  }

  async generateMonitoring(framework: string = 'nextjs') {
    return this.performanceAgent.generateMonitoring(framework);
  }

  async fullCodeAnalysis(code: string, language: string = 'typescript') {
    const [review, performance] = await Promise.all([
      this.codeReviewAgent.reviewCode(code, language),
      this.performanceAgent.analyzePerformance(code, language),
    ]);

    let optimized = code;
    if (review.score < 80) {
      optimized = await this.codeReviewAgent.optimizeCode(code, review, language);
    }

    return {
      review,
      performance,
      optimized,
      recommendations: [...review.suggestions, ...performance.recommendations],
    };
  }
}
