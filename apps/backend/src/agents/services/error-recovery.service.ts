import { Injectable, Logger } from '@nestjs/common';
import { HallucinationDetectorService } from './hallucination-detector.service';

export interface RecoveryAction {
  type: 'retry' | 'fix' | 'fallback' | 'abort';
  fix?: string;
  message: string;
  confidence: number;
}

export interface ErrorContext {
  error: Error;
  code?: string;
  spec?: any;
  agent?: string;
  attempt?: number;
  maxAttempts?: number;
}

/**
 * Error recovery service for AI agent failures
 * 
 * Handles:
 * - AI hallucinations
 * - Code generation errors
 * - Deployment failures
 * - Network errors
 * - Timeout errors
 */
@Injectable()
export class ErrorRecoveryService {
  private readonly logger = new Logger(ErrorRecoveryService.name);
  private readonly maxRetries = 3;
  private readonly retryDelays = [1000, 2000, 5000]; // Exponential backoff

  constructor(
    private hallucinationDetector: HallucinationDetectorService,
  ) {}

  /**
   * Analyze error and suggest recovery action
   */
  async analyzeError(context: ErrorContext): Promise<RecoveryAction> {
    const { error, code, spec, agent, attempt = 0, maxAttempts = this.maxRetries } = context;

    this.logger.warn(`Error in ${agent}: ${error.message}`, error.stack);

    // Check if we should retry
    if (attempt < maxAttempts) {
      // Network/timeout errors - retry
      if (this.isRetryableError(error)) {
        return {
          type: 'retry',
          message: `Retrying after ${this.retryDelays[attempt]}ms...`,
          confidence: 0.8,
        };
      }

      // AI hallucination - fix and retry
      if (code && this.isHallucinationError(error)) {
        const check = await this.hallucinationDetector.detect(code, spec);
        if (check.isHallucination && check.suggestions.length > 0) {
          return {
            type: 'fix',
            fix: check.suggestions[0],
            message: `Detected hallucination: ${check.issues[0]}. Applying fix...`,
            confidence: check.confidence,
          };
        }
      }

      // Code generation errors - fix and retry
      if (this.isCodeGenerationError(error)) {
        const fix = this.suggestFix(error, code);
        if (fix) {
          return {
            type: 'fix',
            fix,
            message: `Code generation error detected. Applying fix...`,
            confidence: 0.7,
          };
        }
      }
    }

    // Fallback to alternative approach
    if (agent) {
      const fallback = this.getFallbackAgent(agent);
      if (fallback) {
        return {
          type: 'fallback',
          message: `Switching to fallback agent: ${fallback}`,
          confidence: 0.6,
        };
      }
    }

    // Abort if no recovery possible
    return {
      type: 'abort',
      message: `Unable to recover from error: ${error.message}`,
      confidence: 0.0,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /ECONNREFUSED/i,
      /ETIMEDOUT/i,
      /ENOTFOUND/i,
      /rate limit/i,
      /429/i,
      /503/i,
      /502/i,
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Check if error is hallucination-related
   */
  private isHallucinationError(error: Error): boolean {
    const hallucinationPatterns = [
      /undefined/i,
      /is not defined/i,
      /cannot find/i,
      /missing import/i,
      /syntax error/i,
      /type error/i,
    ];

    return hallucinationPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Check if error is code generation-related
   */
  private isCodeGenerationError(error: Error): boolean {
    const codeGenPatterns = [
      /syntax/i,
      /parse/i,
      /compilation/i,
      /build failed/i,
      /generation failed/i,
    ];

    return codeGenPatterns.some(pattern => pattern.test(error.message));
  }

  /**
   * Suggest fix for error
   */
  private suggestFix(error: Error, code?: string): string | null {
    const message = error.message.toLowerCase();

    // Missing import
    if (message.includes('cannot find') || message.includes('is not defined')) {
      const match = error.message.match(/(?:Cannot find|is not defined).*?['"]([^'"]+)['"]/);
      if (match && code) {
        return `Add import: import { ${match[1]} } from '...';`;
      }
    }

    // Syntax error
    if (message.includes('syntax error') || message.includes('unexpected')) {
      return 'Fix syntax error - check brackets, quotes, and semicolons';
    }

    // Type error
    if (message.includes('type') && message.includes('error')) {
      return 'Fix type error - ensure types match expected values';
    }

    // Missing dependency
    if (message.includes('module') || message.includes('package')) {
      const match = error.message.match(/(?:Cannot find module|package) ['"]([^'"]+)['"]/);
      if (match) {
        return `Install dependency: npm install ${match[1]}`;
      }
    }

    return null;
  }

  /**
   * Get fallback agent for given agent
   */
  private getFallbackAgent(agent: string): string | null {
    const fallbacks: Record<string, string> = {
      'FrontendAgent': 'UIDesignerAgent',
      'BackendAgent': 'PlannerAgent',
      'RealtimeAgent': 'BackendAgent',
      'TestAgent': 'CodeReviewAgent',
    };

    return fallbacks[agent] || null;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  getRetryDelay(attempt: number): number {
    return this.retryDelays[Math.min(attempt, this.retryDelays.length - 1)] || 5000;
  }

  /**
   * Should retry based on error and attempt count
   */
  shouldRetry(error: Error, attempt: number, maxAttempts: number = this.maxRetries): boolean {
    if (attempt >= maxAttempts) {
      return false;
    }

    // Don't retry on certain errors
    const nonRetryablePatterns = [
      /authentication/i,
      /authorization/i,
      /invalid.*key/i,
      /permission denied/i,
    ];

    if (nonRetryablePatterns.some(pattern => pattern.test(error.message))) {
      return false;
    }

    return true;
  }

  /**
   * Create user-friendly error message
   */
  createUserFriendlyMessage(error: Error, context?: any): string {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('connection')) {
      return 'Connection issue detected. Please check your internet connection and try again.';
    }

    // Timeout errors
    if (message.includes('timeout')) {
      return 'The operation took too long. Please try again with a simpler request.';
    }

    // AI errors
    if (message.includes('ai') || message.includes('model') || message.includes('llm')) {
      return 'AI service temporarily unavailable. Please try again in a moment.';
    }

    // Code generation errors
    if (message.includes('generation') || message.includes('code')) {
      return 'Code generation encountered an issue. The system will attempt to fix it automatically.';
    }

    // Generic error
    return 'An unexpected error occurred. Our team has been notified and will investigate.';
  }
}

