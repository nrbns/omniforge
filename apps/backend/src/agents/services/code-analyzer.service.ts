import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface CodebaseStructure {
  files: Array<{
    path: string;
    type: 'component' | 'page' | 'api' | 'service' | 'model' | 'config' | 'other';
    dependencies: string[];
    exports: string[];
  }>;
  components: string[];
  pages: string[];
  apis: string[];
  services: string[];
  models: string[];
}

export interface CodeDiff {
  added: string[];
  removed: string[];
  modified: string[];
  conflicts: Array<{
    file: string;
    line: number;
    description: string;
  }>;
}

export interface UpdateSuggestion {
  file: string;
  change: string;
  reason: string;
  confidence: number;
}

/**
 * Code analyzer service for understanding generated codebases
 * 
 * Features:
 * - AST parsing (basic)
 * - Codebase structure analysis
 * - Dependency tracking
 * - Diff generation
 * - Update suggestions
 */
@Injectable()
export class CodeAnalyzerService {
  private readonly logger = new Logger(CodeAnalyzerService.name);

  /**
   * Analyze codebase structure
   */
  async analyzeCodebase(codebasePath: string): Promise<CodebaseStructure> {
    const structure: CodebaseStructure = {
      files: [],
      components: [],
      pages: [],
      apis: [],
      services: [],
      models: [],
    };

    try {
      await this.walkDirectory(codebasePath, structure);
    } catch (error) {
      this.logger.error('Error analyzing codebase:', error);
    }

    return structure;
  }

  /**
   * Walk directory and analyze files
   */
  private async walkDirectory(dir: string, structure: CodebaseStructure, basePath: string = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this.walkDirectory(fullPath, structure, relativePath);
        }
      } else if (entry.isFile()) {
        const fileType = this.detectFileType(entry.name, relativePath);
        if (fileType !== 'other') {
          const content = await fs.readFile(fullPath, 'utf-8').catch(() => '');
          const dependencies = this.extractDependencies(content);
          const exports = this.extractExports(content);

          structure.files.push({
            path: relativePath,
            type: fileType,
            dependencies,
            exports,
          });

          // Categorize
          if (fileType === 'component') {
            structure.components.push(relativePath);
          } else if (fileType === 'page') {
            structure.pages.push(relativePath);
          } else if (fileType === 'api') {
            structure.apis.push(relativePath);
          } else if (fileType === 'service') {
            structure.services.push(relativePath);
          } else if (fileType === 'model') {
            structure.models.push(relativePath);
          }
        }
      }
    }
  }

  /**
   * Detect file type based on name and path
   */
  private detectFileType(filename: string, filepath: string): CodebaseStructure['files'][0]['type'] {
    const lowerPath = filepath.toLowerCase();
    const lowerName = filename.toLowerCase();

    if (lowerPath.includes('component') || lowerName.startsWith('component')) {
      return 'component';
    }
    if (lowerPath.includes('page') || lowerPath.includes('pages') || lowerName.includes('page')) {
      return 'page';
    }
    if (lowerPath.includes('api') || lowerPath.includes('route') || lowerName.includes('api')) {
      return 'api';
    }
    if (lowerPath.includes('service') || lowerName.includes('service')) {
      return 'service';
    }
    if (lowerPath.includes('model') || lowerPath.includes('schema') || lowerName.includes('model')) {
      return 'model';
    }
    if (lowerName.includes('config') || lowerName.includes('settings')) {
      return 'config';
    }

    return 'other';
  }

  /**
   * Extract dependencies from code
   */
  private extractDependencies(code: string): string[] {
    const dependencies: string[] = [];

    // Import statements
    const importPattern = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    const imports = [...code.matchAll(importPattern)];
    dependencies.push(...imports.map(m => m[1]));

    // Require statements
    const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
    const requires = [...code.matchAll(requirePattern)];
    dependencies.push(...requires.map(m => m[1]));

    return [...new Set(dependencies)];
  }

  /**
   * Extract exports from code
   */
  private extractExports(code: string): string[] {
    const exports: string[] = [];

    // Named exports
    const exportPattern = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    const namedExports = [...code.matchAll(exportPattern)];
    exports.push(...namedExports.map(m => m[1]));

    // Default exports
    const defaultPattern = /export\s+default\s+(?:class|function|const)?\s*(\w+)?/;
    const defaultExport = code.match(defaultPattern);
    if (defaultExport && defaultExport[1]) {
      exports.push(defaultExport[1]);
    }

    return [...new Set(exports)];
  }

  /**
   * Generate diff between two code versions
   */
  async diff(oldCode: string, newCode: string): Promise<CodeDiff> {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');

    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];
    const conflicts: CodeDiff['conflicts'] = [];

    // Simple line-by-line diff
    const maxLen = Math.max(oldLines.length, newLines.length);
    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined) {
        added.push(newLine);
      } else if (newLine === undefined) {
        removed.push(oldLine);
      } else if (oldLine !== newLine) {
        modified.push(`Line ${i + 1}: ${oldLine} → ${newLine}`);
      }
    }

    return {
      added,
      removed,
      modified,
      conflicts,
    };
  }

  /**
   * Suggest updates based on change request
   */
  async suggestUpdate(change: string, codebase: CodebaseStructure, context: any): Promise<UpdateSuggestion[]> {
    const suggestions: UpdateSuggestion[] = [];

    // Analyze change request
    const changeLower = change.toLowerCase();

    // Add feature
    if (changeLower.includes('add') || changeLower.includes('create')) {
      const feature = this.extractFeature(change);
      if (feature) {
        // Suggest where to add
        const targetFile = this.findBestFile(feature, codebase);
        if (targetFile) {
          suggestions.push({
            file: targetFile,
            change: `Add ${feature} functionality`,
            reason: `Change request mentions: ${feature}`,
            confidence: 0.7,
          });
        }
      }
    }

    // Modify feature
    if (changeLower.includes('modify') || changeLower.includes('update') || changeLower.includes('change')) {
      const feature = this.extractFeature(change);
      if (feature) {
        const targetFile = this.findFileByFeature(feature, codebase);
        if (targetFile) {
          suggestions.push({
            file: targetFile,
            change: `Update ${feature}`,
            reason: `Change request mentions updating: ${feature}`,
            confidence: 0.8,
          });
        }
      }
    }

    // Remove feature
    if (changeLower.includes('remove') || changeLower.includes('delete')) {
      const feature = this.extractFeature(change);
      if (feature) {
        const targetFile = this.findFileByFeature(feature, codebase);
        if (targetFile) {
          suggestions.push({
            file: targetFile,
            change: `Remove ${feature}`,
            reason: `Change request mentions removing: ${feature}`,
            confidence: 0.9,
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Extract feature name from change request
   */
  private extractFeature(change: string): string | null {
    // Simple extraction - look for quoted strings or common patterns
    const quoted = change.match(/['"]([^'"]+)['"]/);
    if (quoted) {
      return quoted[1];
    }

    // Look for common feature keywords
    const keywords = ['button', 'form', 'api', 'page', 'component', 'feature', 'function'];
    for (const keyword of keywords) {
      if (change.toLowerCase().includes(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  /**
   * Find best file to add feature
   */
  private findBestFile(feature: string, codebase: CodebaseStructure): string | null {
    const featureLower = feature.toLowerCase();

    // Match by feature type
    if (featureLower.includes('page') || featureLower.includes('route')) {
      return codebase.pages[0] || null;
    }
    if (featureLower.includes('component')) {
      return codebase.components[0] || null;
    }
    if (featureLower.includes('api') || featureLower.includes('endpoint')) {
      return codebase.apis[0] || null;
    }

    // Default to first component or page
    return codebase.components[0] || codebase.pages[0] || null;
  }

  /**
   * Find file containing feature
   */
  private findFileByFeature(feature: string, codebase: CodebaseStructure): string | null {
    const featureLower = feature.toLowerCase();

    // Search through files
    for (const file of codebase.files) {
      if (file.path.toLowerCase().includes(featureLower)) {
        return file.path;
      }
      if (file.exports.some(exp => exp.toLowerCase().includes(featureLower))) {
        return file.path;
      }
    }

    return null;
  }

  /**
   * Check if codebase has specific feature
   */
  async hasFeature(codebase: CodebaseStructure, feature: string): Promise<boolean> {
    const featureLower = feature.toLowerCase();

    for (const file of codebase.files) {
      if (file.path.toLowerCase().includes(featureLower)) {
        return true;
      }
      if (file.exports.some(exp => exp.toLowerCase().includes(featureLower))) {
        return true;
      }
    }

    return false;
  }
}

