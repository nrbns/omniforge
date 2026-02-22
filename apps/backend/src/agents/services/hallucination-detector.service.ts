import { Injectable, Logger } from '@nestjs/common';

export interface HallucinationCheck {
  isHallucination: boolean;
  confidence: number; // 0-1
  issues: string[];
  suggestions: string[];
}

/**
 * Detects AI hallucinations in generated code
 *
 * Checks for:
 * - Missing imports
 * - Undefined variables
 * - Syntax errors
 * - Spec mismatches
 * - Unused code
 */
@Injectable()
export class HallucinationDetectorService {
  private readonly logger = new Logger(HallucinationDetectorService.name);

  /**
   * Detect hallucinations in generated code
   */
  async detect(
    code: string,
    spec: any,
    language: 'typescript' | 'python' | 'javascript' = 'typescript'
  ): Promise<HallucinationCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = 1.0;

    // Check 1: Missing imports
    const missingImports = this.checkMissingImports(code, language);
    if (missingImports.length > 0) {
      issues.push(`Missing imports: ${missingImports.join(', ')}`);
      suggestions.push(`Add imports: ${missingImports.map((i) => `import ${i}`).join('; ')}`);
      confidence -= 0.2;
    }

    // Check 2: Undefined variables/functions
    const undefinedVars = this.checkUndefinedVariables(code, language);
    if (undefinedVars.length > 0) {
      issues.push(`Undefined variables: ${undefinedVars.join(', ')}`);
      suggestions.push(`Define or import: ${undefinedVars.join(', ')}`);
      confidence -= 0.3;
    }

    // Check 3: Syntax errors (basic check)
    const syntaxErrors = this.checkSyntaxErrors(code, language);
    if (syntaxErrors.length > 0) {
      issues.push(`Syntax errors: ${syntaxErrors.join('; ')}`);
      suggestions.push(`Fix syntax: ${syntaxErrors.map((e) => `Fix ${e}`).join('; ')}`);
      confidence -= 0.4;
    }

    // Check 4: Spec mismatches
    if (spec) {
      const specMismatches = this.checkSpecMismatches(code, spec);
      if (specMismatches.length > 0) {
        issues.push(`Spec mismatches: ${specMismatches.join('; ')}`);
        suggestions.push(`Align with spec: ${specMismatches.join('; ')}`);
        confidence -= 0.2;
      }
    }

    // Check 5: Unused code
    const unusedCode = this.checkUnusedCode(code, language);
    if (unusedCode.length > 0) {
      issues.push(`Unused code detected: ${unusedCode.join(', ')}`);
      suggestions.push(`Remove or use: ${unusedCode.join(', ')}`);
      confidence -= 0.1;
    }

    // Check 6: Type mismatches (TypeScript)
    if (language === 'typescript') {
      const typeErrors = this.checkTypeErrors(code);
      if (typeErrors.length > 0) {
        issues.push(`Type errors: ${typeErrors.join('; ')}`);
        suggestions.push(`Fix types: ${typeErrors.map((e) => `Fix ${e}`).join('; ')}`);
        confidence -= 0.2;
      }
    }

    const isHallucination = confidence < 0.7 || issues.length > 3;

    return {
      isHallucination,
      confidence: Math.max(0, confidence),
      issues,
      suggestions,
    };
  }

  /**
   * Check for missing imports
   */
  private checkMissingImports(code: string, language: string): string[] {
    const missing: string[] = [];

    // Common patterns that suggest missing imports
    const patterns = {
      typescript: [
        /useState|useEffect|useRef/,
        /fetch\(/,
        /axios\./,
        /prisma\./,
        /express\(/,
        /Router\(/,
      ],
      javascript: [/useState|useEffect|useRef/, /fetch\(/, /axios\./],
      python: [/import\s+\w+/, /from\s+\w+\s+import/],
    };

    const langPatterns = patterns[language as keyof typeof patterns] || [];

    for (const pattern of langPatterns) {
      const matches = code.match(pattern);
      if (matches && !code.includes('import') && !code.includes('from')) {
        missing.push(matches[0]);
      }
    }

    return [...new Set(missing)];
  }

  /**
   * Check for undefined variables
   */
  private checkUndefinedVariables(code: string, language: string): string[] {
    const undefined: string[] = [];

    // Extract variable/function calls
    const callPattern = /(\w+)\(/g;
    const varPattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;

    const calls = [...code.matchAll(callPattern)].map((m) => m[1]);
    const vars = [...code.matchAll(varPattern)].map((m) => m[1]);

    // Filter out common built-ins
    const builtins = {
      typescript: [
        'console',
        'document',
        'window',
        'Array',
        'Object',
        'String',
        'Number',
        'Boolean',
        'Date',
        'Math',
        'JSON',
        'Promise',
        'setTimeout',
        'setInterval',
      ],
      javascript: [
        'console',
        'document',
        'window',
        'Array',
        'Object',
        'String',
        'Number',
        'Boolean',
        'Date',
        'Math',
        'JSON',
        'Promise',
        'setTimeout',
        'setInterval',
      ],
      python: [
        'print',
        'len',
        'str',
        'int',
        'float',
        'list',
        'dict',
        'tuple',
        'range',
        'enumerate',
      ],
    };

    const langBuiltins = builtins[language as keyof typeof builtins] || [];

    // Check if variables are defined
    for (const call of calls) {
      if (
        !langBuiltins.includes(call) &&
        !code.includes(`function ${call}`) &&
        !code.includes(`const ${call}`) &&
        !code.includes(`let ${call}`) &&
        !code.includes(`var ${call}`)
      ) {
        undefined.push(call);
      }
    }

    return [...new Set(undefined)].slice(0, 10); // Limit to 10
  }

  /**
   * Check for basic syntax errors
   */
  private checkSyntaxErrors(code: string, language: string): string[] {
    const errors: string[] = [];

    // Check for unmatched brackets
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];

    for (const char of code) {
      if (char in brackets) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        if (stack.length === 0) {
          errors.push('Unmatched closing bracket');
          break;
        }
        const last = stack.pop();
        if (last && brackets[last as keyof typeof brackets] !== char) {
          errors.push('Mismatched brackets');
          break;
        }
      }
    }

    if (stack.length > 0) {
      errors.push('Unclosed brackets');
    }

    // Check for common syntax issues
    if (language === 'typescript' || language === 'javascript') {
      // Missing semicolons (optional but check for issues)
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (
          line &&
          !line.endsWith(';') &&
          !line.endsWith('{') &&
          !line.endsWith('}') &&
          !line.startsWith('//') &&
          !line.startsWith('/*')
        ) {
          // Not necessarily an error, but could be
        }
      }
    }

    return errors;
  }

  /**
   * Check if code matches spec requirements
   */
  private checkSpecMismatches(code: string, spec: any): string[] {
    const mismatches: string[] = [];

    // Check for required pages/components
    if (spec.pages) {
      for (const page of spec.pages) {
        const pageName = page.name || page.path;
        if (!code.includes(pageName) && !code.includes(pageName.toLowerCase())) {
          mismatches.push(`Missing page: ${pageName}`);
        }
      }
    }

    // Check for required APIs
    if (spec.apis) {
      for (const api of spec.apis) {
        const apiPath = api.path || api.endpoint;
        if (!code.includes(apiPath)) {
          mismatches.push(`Missing API: ${apiPath}`);
        }
      }
    }

    // Check for required data models
    if (spec.dataModels) {
      for (const model of spec.dataModels) {
        const modelName = model.name;
        if (!code.includes(modelName) && !code.includes(`model ${modelName}`)) {
          mismatches.push(`Missing model: ${modelName}`);
        }
      }
    }

    return mismatches;
  }

  /**
   * Check for unused code
   */
  private checkUnusedCode(code: string, language: string): string[] {
    const unused: string[] = [];

    // Extract function definitions
    const funcPattern =
      language === 'python'
        ? /def\s+(\w+)\s*\(/g
        : /(?:function|const|let|var)\s+(\w+)\s*[=:]\s*(?:async\s*)?\(/g;

    const functions = [...code.matchAll(funcPattern)].map((m) => m[1]);

    // Check if functions are called
    for (const func of functions) {
      const callPattern = new RegExp(`\\b${func}\\s*\\(`, 'g');
      const calls = code.match(callPattern);
      if (!calls || calls.length <= 1) {
        // Only definition, no calls
        unused.push(func);
      }
    }

    return unused.slice(0, 5); // Limit to 5
  }

  /**
   * Check for TypeScript type errors
   */
  private checkTypeErrors(code: string): string[] {
    const errors: string[] = [];

    // Check for any types (bad practice)
    const anyPattern = /:\s*any\b/g;
    const anyMatches = code.match(anyPattern);
    if (anyMatches && anyMatches.length > 5) {
      errors.push(`Too many 'any' types (${anyMatches.length})`);
    }

    // Check for missing return types
    const funcPattern =
      /(?:function|const|let)\s+\w+\s*[=:]\s*(?:async\s*)?\([^)]*\)\s*(?::\s*\w+)?\s*=>/g;
    const functions = code.match(funcPattern);
    if (functions) {
      for (const func of functions) {
        if (!func.includes(':') && !func.includes('=>')) {
          errors.push('Missing return type');
        }
      }
    }

    return errors;
  }

  /**
   * Validate generated code against requirements
   */
  async validate(
    code: string,
    requirements: string[]
  ): Promise<{ valid: boolean; missing: string[] }> {
    const missing: string[] = [];

    for (const req of requirements) {
      const reqLower = req.toLowerCase();
      const codeLower = code.toLowerCase();

      // Check if requirement is mentioned in code
      if (!codeLower.includes(reqLower)) {
        missing.push(req);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
