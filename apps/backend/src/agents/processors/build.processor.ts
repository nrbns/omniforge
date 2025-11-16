import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeService } from '../../realtime/realtime.service';
import { HuggingFaceService } from '../../huggingface/huggingface.service';
import { ScaffoldService } from '../../scaffold/scaffold.service';
import {
  PlannerAgent,
  UIDesignerAgent,
  FrontendAgent,
  BackendAgent,
  RealtimeAgent,
  TestAgent,
} from '@omniforge/agents';
import { Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface BuildJob {
  projectId: string;
  buildId: string;
  ideaId: string;
  spec: any;
  config?: Record<string, any>;
}

@Processor('build')
export class BuildProcessor extends WorkerHost {
  private readonly logger = new Logger(BuildProcessor.name);
  private readonly plannerAgent = new PlannerAgent();
  private readonly uiDesignerAgent = new UIDesignerAgent();
  private readonly frontendAgent = new FrontendAgent();
  private readonly backendAgent = new BackendAgent();
  private readonly realtimeAgent = new RealtimeAgent();
  private readonly testAgent = new TestAgent();

  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeService,
    private huggingFace: HuggingFaceService,
    private scaffoldService: ScaffoldService
  ) {
    super();
  }

  async process(job: Job<BuildJob>): Promise<any> {
    const { projectId, buildId, ideaId, spec, config } = job.data;

    this.logger.log(`Processing build job for project ${projectId}`);

    try {
      // Update build status
      await this.updateBuildStatus(buildId, 'RUNNING', { startedAt: new Date() });

      // Step 1: Plan the application
      await this.updateBuildLog(buildId, 'Planning application architecture...');
      const plannedSpec = await this.plannerAgent.plan(spec);
      await this.updateProgress(buildId, 10);

      // Step 2: Generate design tokens
      await this.updateBuildLog(buildId, 'Generating design tokens...');
      const tokens = await this.uiDesignerAgent.generateTokens(plannedSpec);
      await this.saveTokens(projectId, tokens);
      await this.updateProgress(buildId, 20);

      // Step 3: Generate frontend code with AI
      await this.updateBuildLog(buildId, 'Generating frontend code with AI...');
      const frontendFiles = await this.frontendAgent.generateFrontend(plannedSpec);
      await this.updateProgress(buildId, 40);

      // Step 3b: Review and optimize generated code
      await this.updateBuildLog(buildId, 'Reviewing and optimizing code...');
      // Code review and optimization would happen here

      // Step 3c: Generate scaffold
      await this.updateBuildLog(buildId, 'Generating project scaffold...');
      const scaffoldPath = await this.scaffoldService.generateScaffold(ideaId, plannedSpec.name);
      await this.updateProgress(buildId, 50);

      // Update build with scaffold path
      await this.updateBuildStatus(buildId, 'RUNNING', {
        outputPath: scaffoldPath,
      });

      // Step 4: Generate backend code
      await this.updateBuildLog(buildId, 'Generating backend code...');
      const backendFiles = await this.backendAgent.generateBackend(plannedSpec);
      await this.updateProgress(buildId, 60);

      // Step 5: Generate real-time code
      await this.updateBuildLog(buildId, 'Generating real-time endpoints...');
      const realtimeFiles = await this.realtimeAgent.generateRealtime(plannedSpec);
      await this.updateProgress(buildId, 75);

      // Step 6: Generate tests
      await this.updateBuildLog(buildId, 'Generating tests...');
      const testFiles = await this.testAgent.generateTests(plannedSpec);
      await this.updateProgress(buildId, 85);

      // Step 7: Write all files
      await this.updateBuildLog(buildId, 'Writing generated files...');
      const outputPath = await this.writeFiles(projectId, {
        ...frontendFiles.files,
        ...backendFiles.files,
        ...realtimeFiles.files,
        ...testFiles.files,
      });
      await this.updateProgress(buildId, 95);

      // Step 8: Install dependencies
      await this.updateBuildLog(buildId, 'Installing dependencies...');
      await this.installDependencies(outputPath);

      // Update build status
      await this.updateBuildStatus(buildId, 'SUCCESS', {
        outputPath,
        completedAt: new Date(),
        agent: 'Multi-Agent Build Engine',
      });

      await this.realtime.emit(`build:${buildId}`, 'build.completed', {
        buildId,
        status: 'SUCCESS',
        outputPath,
      });

      this.logger.log(`Successfully built project ${projectId}`);

      return { projectId, buildId, outputPath };
    } catch (error) {
      this.logger.error(`Error building project ${projectId}:`, error);

      await this.updateBuildStatus(buildId, 'FAILED', {
        error: error.message,
        completedAt: new Date(),
      });

      await this.realtime.emit(`build:${buildId}`, 'build.failed', {
        buildId,
        error: error.message,
      });

      throw error;
    }
  }

  private async updateBuildStatus(
    buildId: string,
    status: string,
    data: Record<string, any>
  ): Promise<void> {
    await this.prisma.build.update({
      where: { id: buildId },
      data: { status: status as any, ...data },
    });
  }

  private async updateBuildLog(buildId: string, message: string): Promise<void> {
    const build = await this.prisma.build.findUnique({ where: { id: buildId } });
    const currentLogs = build?.logs || '';
    const timestamp = new Date().toISOString();
    const newLogs = `${currentLogs}[${timestamp}] ${message}\n`;

    await this.prisma.build.update({
      where: { id: buildId },
      data: { logs: newLogs },
    });

    await this.realtime.emit(`build:${buildId}`, 'build.log', { message, timestamp });
  }

  private async updateProgress(buildId: string, progress: number): Promise<void> {
    await this.realtime.emit(`build:${buildId}`, 'build.progress', { progress });
  }

  private async saveTokens(projectId: string, tokens: Record<string, any>): Promise<void> {
    // Save tokens to database
    for (const [category, values] of Object.entries(tokens)) {
      if (typeof values === 'object') {
        for (const [key, value] of Object.entries(values)) {
          await this.prisma.designToken.upsert({
            where: {
              projectId_key: {
                projectId,
                key: `${category}.${key}`,
              },
            },
            update: { value: String(value) },
            create: {
              projectId,
              key: `${category}.${key}`,
              value: String(value),
              category,
            },
          });
        }
      }
    }
  }

  private async writeFiles(
    projectId: string,
    files: Array<{ path: string; content: string }>
  ): Promise<string> {
    const outputDir = path.join(process.cwd(), 'output', projectId);
    await fs.mkdir(outputDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    return outputDir;
  }

  private async installDependencies(outputPath: string): Promise<void> {
    try {
      await execAsync('npm install', { cwd: outputPath });
    } catch (error) {
      this.logger.warn(`Failed to install dependencies: ${error.message}`);
    }
  }
}
