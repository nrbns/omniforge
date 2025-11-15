import { AppSpec, DataModelSpec } from '@omniforge/shared';

export class BackendAgent {
  /**
   * Generates comprehensive backend API code
   */
  async generateBackend(spec: AppSpec): Promise<{ files: Array<{ path: string; content: string }> }> {
    const files: Array<{ path: string; content: string }> = [];

    // Generate Prisma schema
    files.push(this.generatePrismaSchema(spec.dataModels || []));

    // Generate API routes
    for (const api of spec.apis || []) {
      files.push(this.generateAPIRoute(api));
    }

    // Generate controllers
    files.push(...this.generateControllers(spec.dataModels || []));

    // Generate services
    files.push(...this.generateServices(spec.dataModels || []));

    // Generate DTOs
    files.push(...this.generateDTOs(spec.dataModels || []));

    // Generate package.json
    files.push(this.generatePackageJson());

    // Generate main.ts
    files.push(this.generateMainFile());

    return { files };
  }

  private generatePrismaSchema(models: DataModelSpec[]): { path: string; content: string } {
    const modelsCode = models
      .map((model) => {
        const fields = model.fields
          .map((field) => {
            const required = field.required !== false ? '' : '?';
            const typeMap: Record<string, string> = {
              String: 'String',
              Int: 'Int',
              Float: 'Float',
              Boolean: 'Boolean',
              DateTime: 'DateTime',
              Json: 'Json',
            };
            return `  ${field.name}${required} ${typeMap[field.type] || 'String'}`;
          })
          .join('\n');

        return `model ${model.name} {
  id        String   @id @default(cuid())
${fields}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
      })
      .join('\n\n');

    return {
      path: 'prisma/schema.prisma',
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${modelsCode}
`,
    };
  }

  private generateAPIRoute(api: any): { path: string; content: string } {
    const routeName = api.path.replace(/[^a-zA-Z0-9]/g, '_');
    const method = api.method.toLowerCase();

    return {
      path: `src/routes/${routeName}.ts`,
      content: `import { Request, Response } from 'express';
import { ${this.toPascalCase(routeName)}Service } from '../services/${routeName}.service';

const service = new ${this.toPascalCase(routeName)}Service();

export async function handle${this.toPascalCase(method)}${this.toPascalCase(routeName)}(
  req: Request,
  res: Response
) {
  try {
    // TODO: Implement ${api.method} ${api.path}
    const result = await service.${method}(req.params, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
`,
    };
  }

  private generateControllers(models: DataModelSpec[]): Array<{ path: string; content: string }> {
    return models.map((model) => ({
      path: `src/controllers/${model.name.toLowerCase()}.controller.ts`,
      content: `import { Request, Response } from 'express';
import { ${model.name}Service } from '../services/${model.name.toLowerCase()}.service';

const service = new ${model.name}Service();

export class ${model.name}Controller {
  async getAll(req: Request, res: Response) {
    try {
      const items = await service.findAll(req.query);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const item = await service.findOne(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const item = await service.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
`,
    }));
  }

  private generateServices(models: DataModelSpec[]): Array<{ path: string; content: string }> {
    return models.map((model) => ({
      path: `src/services/${model.name.toLowerCase()}.service.ts`,
      content: `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ${model.name}Service {
  async findAll(query?: any) {
    return prisma.${model.name.toLowerCase()}.findMany({
      where: query,
    });
  }

  async findOne(id: string) {
    return prisma.${model.name.toLowerCase()}.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return prisma.${model.name.toLowerCase()}.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.${model.name.toLowerCase()}.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.${model.name.toLowerCase()}.delete({
      where: { id },
    });
  }
}
`,
    }));
  }

  private generateDTOs(models: DataModelSpec[]): Array<{ path: string; content: string }> {
    return models.map((model) => ({
      path: `src/dto/${model.name.toLowerCase()}.dto.ts`,
      content: `export class Create${model.name}Dto {
${model.fields
  .filter((f) => f.name !== 'id' && f.name !== 'createdAt' && f.name !== 'updatedAt')
  .map((f) => `  ${f.name}${f.required !== false ? '' : '?'}: ${f.type.toLowerCase()};`)
  .join('\n')}
}

export class Update${model.name}Dto {
${model.fields
  .filter((f) => f.name !== 'id' && f.name !== 'createdAt' && f.name !== 'updatedAt')
  .map((f) => `  ${f.name}?: ${f.type.toLowerCase()};`)
  .join('\n')}
}
`,
    }));
  }

  private generatePackageJson(): { path: string; content: string } {
    return {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: 'omniforge-generated-backend',
          version: '0.1.0',
          scripts: {
            dev: 'ts-node-dev src/main.ts',
            build: 'tsc',
            start: 'node dist/main.js',
          },
          dependencies: {
            express: '^4.18.2',
            '@prisma/client': '^5.8.0',
            cors: '^2.8.5',
            dotenv: '^16.3.1',
          },
          devDependencies: {
            '@types/express': '^4.17.21',
            '@types/node': '^20.10.0',
            'ts-node-dev': '^2.0.0',
            typescript: '^5.3.3',
            prisma: '^5.8.0',
          },
        },
        null,
        2
      ),
    };
  }

  private generateMainFile(): { path: string; content: string } {
    return {
      path: 'src/main.ts',
      content: `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// TODO: Add API routes

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
});
`,
    };
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
