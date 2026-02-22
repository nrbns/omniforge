import { Injectable, Logger } from '@nestjs/common';

export interface Task {
  id: string;
  name: string;
  execute: () => Promise<any>;
  dependencies?: string[];
}

export interface ExecutionResult {
  taskId: string;
  success: boolean;
  result?: any;
  error?: Error;
  duration: number;
}

/**
 * Parallel executor service for running agent tasks in parallel
 *
 * Features:
 * - Dependency resolution
 * - Parallel execution where possible
 * - Sequential execution for dependencies
 * - Error handling and recovery
 */
@Injectable()
export class ParallelExecutorService {
  private readonly logger = new Logger(ParallelExecutorService.name);

  /**
   * Execute tasks in parallel, respecting dependencies
   */
  async executeParallel(tasks: Task[]): Promise<Map<string, ExecutionResult>> {
    const results = new Map<string, ExecutionResult>();
    const executing = new Set<string>();
    const completed = new Set<string>();

    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(tasks);

    // Execute tasks
    while (completed.size < tasks.length) {
      // Find tasks ready to execute (dependencies met)
      const ready = tasks.filter((task) => {
        if (completed.has(task.id) || executing.has(task.id)) {
          return false;
        }
        const deps = task.dependencies || [];
        return deps.every((dep) => completed.has(dep));
      });

      if (ready.length === 0) {
        // Deadlock detection
        const remaining = tasks.filter((t) => !completed.has(t.id));
        if (remaining.length > 0) {
          this.logger.error('Circular dependency or missing dependency detected');
          for (const task of remaining) {
            results.set(task.id, {
              taskId: task.id,
              success: false,
              error: new Error('Circular dependency or missing dependency'),
              duration: 0,
            });
          }
          break;
        }
        break;
      }

      // Execute ready tasks in parallel
      const promises = ready.map((task) => this.executeTask(task, results));
      await Promise.allSettled(promises);

      // Mark as executing, then completed
      for (const task of ready) {
        executing.add(task.id);
      }

      // Wait for all to complete
      for (const task of ready) {
        const result = results.get(task.id);
        if (result) {
          executing.delete(task.id);
          completed.add(task.id);
        }
      }
    }

    return results;
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(tasks: Task[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const task of tasks) {
      graph.set(task.id, new Set(task.dependencies || []));
    }

    return graph;
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: Task, results: Map<string, ExecutionResult>): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Executing task: ${task.name} (${task.id})`);

    try {
      const result = await task.execute();
      const duration = Date.now() - startTime;

      results.set(task.id, {
        taskId: task.id,
        success: true,
        result,
        duration,
      });

      this.logger.log(`Task ${task.name} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;

      results.set(task.id, {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        duration,
      });

      this.logger.error(`Task ${task.name} failed:`, error);
    }
  }

  /**
   * Execute tasks sequentially (fallback)
   */
  async executeSequential(tasks: Task[]): Promise<Map<string, ExecutionResult>> {
    const results = new Map<string, ExecutionResult>();

    for (const task of tasks) {
      const startTime = Date.now();
      this.logger.log(`Executing task sequentially: ${task.name}`);

      try {
        const result = await task.execute();
        const duration = Date.now() - startTime;

        results.set(task.id, {
          taskId: task.id,
          success: true,
          result,
          duration,
        });
      } catch (error) {
        const duration = Date.now() - startTime;

        results.set(task.id, {
          taskId: task.id,
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          duration,
        });

        // Optionally stop on error
        // break;
      }
    }

    return results;
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout(task: Task, timeoutMs: number): Promise<any> {
    return Promise.race([
      task.execute(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Task ${task.name} timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }
}
