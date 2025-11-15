import { AppSpec, PageSpec, DataModelSpec, ApiSpec } from '@omniforge/shared';

export interface PlannedSpec extends AppSpec {
  tasks: Task[];
  estimatedDuration: number;
  dependencies: Dependency[];
}

export interface Task {
  id: string;
  name: string;
  agent: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // in minutes
  dependencies: string[]; // task IDs
  status: 'pending' | 'running' | 'completed' | 'failed';
  logs?: LogEntry[];
}

export interface Dependency {
  from: string; // task ID
  to: string; // task ID
  type: 'blocks' | 'requires' | 'optional';
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  agent?: string;
  data?: any;
}

export class PlannerAgent {
  /**
   * Plan the application build process from a specification
   */
  plan(spec: AppSpec): PlannedSpec {
    const tasks: Task[] = [];
    const dependencies: Dependency[] = [];
    let taskId = 1;

    // Task 1: Generate design tokens (UIDesignerAgent)
    const designTask: Task = {
      id: `task-${taskId++}`,
      name: 'Generate design tokens',
      agent: 'UIDesignerAgent',
      priority: 'high',
      estimatedTime: 2,
      dependencies: [],
      status: 'pending',
      logs: [],
    };
    tasks.push(designTask);

    // Task 2: Generate frontend code (FrontendAgent)
    const frontendTask: Task = {
      id: `task-${taskId++}`,
      name: 'Generate frontend code',
      agent: 'FrontendAgent',
      priority: 'high',
      estimatedTime: 10,
      dependencies: [designTask.id],
      status: 'pending',
      logs: [],
    };
    tasks.push(frontendTask);
    dependencies.push({
      from: designTask.id,
      to: frontendTask.id,
      type: 'requires',
    });

    // Task 3: Generate backend code (BackendAgent)
    const backendTask: Task = {
      id: `task-${taskId++}`,
      name: 'Generate backend code',
      agent: 'BackendAgent',
      priority: 'high',
      estimatedTime: 10,
      dependencies: [],
      status: 'pending',
      logs: [],
    };
    tasks.push(backendTask);

    // Task 4: Generate API endpoints (BackendAgent)
    const apiTask: Task = {
      id: `task-${taskId++}`,
      name: 'Generate API endpoints',
      agent: 'BackendAgent',
      priority: 'high',
      estimatedTime: 5,
      dependencies: [backendTask.id],
      status: 'pending',
      logs: [],
    };
    tasks.push(apiTask);
    dependencies.push({
      from: backendTask.id,
      to: apiTask.id,
      type: 'requires',
    });

    // Task 5: Generate database schema (BackendAgent)
    const schemaTask: Task = {
      id: `task-${taskId++}`,
      name: 'Generate database schema',
      agent: 'BackendAgent',
      priority: 'high',
      estimatedTime: 3,
      dependencies: [backendTask.id],
      status: 'pending',
      logs: [],
    };
    tasks.push(schemaTask);
    dependencies.push({
      from: backendTask.id,
      to: schemaTask.id,
      type: 'requires',
    });

    // Task 6: Generate realtime features (RealtimeAgent)
    if (spec.realtime && spec.realtime.length > 0) {
      const realtimeTask: Task = {
        id: `task-${taskId++}`,
        name: 'Generate realtime features',
        agent: 'RealtimeAgent',
        priority: 'medium',
        estimatedTime: 5,
        dependencies: [backendTask.id],
        status: 'pending',
        logs: [],
      };
      tasks.push(realtimeTask);
      dependencies.push({
        from: backendTask.id,
        to: realtimeTask.id,
        type: 'requires',
      });
    }

    // Task 7: Generate tests (TestAgent)
    const testTask: Task = {
      id: `task-${taskId++}`,
      name: 'Generate tests',
      agent: 'TestAgent',
      priority: 'medium',
      estimatedTime: 8,
      dependencies: [frontendTask.id, backendTask.id],
      status: 'pending',
      logs: [],
    };
    tasks.push(testTask);
    dependencies.push({
      from: frontendTask.id,
      to: testTask.id,
      type: 'requires',
    });
    dependencies.push({
      from: backendTask.id,
      to: testTask.id,
      type: 'requires',
    });

    // Calculate total estimated duration (assuming parallel execution where possible)
    const estimatedDuration = Math.max(
      designTask.estimatedTime + frontendTask.estimatedTime + testTask.estimatedTime,
      backendTask.estimatedTime + apiTask.estimatedTime + schemaTask.estimatedTime
    );

    return {
      ...spec,
      tasks,
      estimatedDuration,
      dependencies,
    };
  }

  /**
   * Execute a task and return updated task with logs
   */
  async executeTask(task: Task, spec: AppSpec): Promise<Task> {
    const updatedTask: Task = {
      ...task,
      status: 'running',
      logs: [
        ...(task.logs || []),
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Starting ${task.name}...`,
          agent: task.agent,
        },
      ],
    };

    // Simulate task execution
    await new Promise((resolve) => setTimeout(resolve, 1000));

    updatedTask.status = 'completed';
    updatedTask.logs = [
      ...(updatedTask.logs || []),
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `${task.name} completed successfully`,
        agent: task.agent,
      },
    ];

    return updatedTask;
  }

  /**
   * Get execution plan as human-readable string
   */
  getExecutionPlan(planned: PlannedSpec): string {
    let plan = `\n📋 Execution Plan for ${planned.name}\n`;
    plan += `${'='.repeat(50)}\n\n`;
    plan += `Estimated Duration: ${planned.estimatedDuration} minutes\n\n`;
    plan += `Tasks:\n`;

    planned.tasks.forEach((task, index) => {
      plan += `${index + 1}. ${task.name} (${task.agent})\n`;
      plan += `   Priority: ${task.priority}\n`;
      plan += `   Estimated: ${task.estimatedTime} min\n`;
      if (task.dependencies.length > 0) {
        plan += `   Depends on: ${task.dependencies.join(', ')}\n`;
      }
      plan += `\n`;
    });

    return plan;
  }
}
