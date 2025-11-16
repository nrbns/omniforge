import * as fs from 'fs/promises';
import * as path from 'path';
import * as tar from 'tar';

interface AppSpec {
  version: string;
  name: string;
  description: string;
  pages: PageSpec[];
  dataModels: DataModelSpec[];
  apis: ApiSpec[];
  realtime: RealtimeSpec[];
  integrations: IntegrationSpec[];
  ui: UISpec;
  generatedAt: string;
}

interface PageSpec {
  id: string;
  name: string;
  path: string;
  components: ComponentSpec[];
}

interface ComponentSpec {
  type: string;
  props: Record<string, any>;
}

interface DataModelSpec {
  name: string;
  fields: FieldSpec[];
}

interface FieldSpec {
  name: string;
  type: string;
  required?: boolean;
}

interface ApiSpec {
  path: string;
  method: string;
}

interface RealtimeSpec {
  channel: string;
  events: string[];
}

interface IntegrationSpec {
  name: string;
  type: string;
  config?: Record<string, any>;
}

interface UISpec {
  theme: string;
  primaryColor: string;
}

export class ScaffoldGenerator {
  private outputDir: string;

  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
  }

  /**
   * Generate a project scaffold from a specification
   */
  async generate(spec: AppSpec, projectName: string = 'generated-app'): Promise<string> {
    const projectDir = path.join(this.outputDir, projectName);

    // Create project directory
    await fs.mkdir(projectDir, { recursive: true });

    // Generate package.json
    await this.generatePackageJson(projectDir, spec);

    // Generate Next.js structure
    await this.generateNextJSStructure(projectDir, spec);

    // Generate API structure
    await this.generateAPIStructure(projectDir, spec);

    // Generate Prisma schema
    await this.generatePrismaSchema(projectDir, spec);

    // Generate README
    await this.generateREADME(projectDir, spec);

    // Generate .env.example
    await this.generateEnvExample(projectDir);

    // Generate tailwind.config.js
    await this.generateTailwindConfig(projectDir, spec);

    // Generate next.config.js
    await this.generateNextConfig(projectDir);

    // Generate tsconfig.json
    await this.generateTsConfig(projectDir);

    // Create tarball
    const tarPath = await this.createTarBall(projectDir, projectName);

    return tarPath;
  }

  private async generatePackageJson(projectDir: string, spec: AppSpec): Promise<void> {
    const packageJson = {
      name: spec.name.toLowerCase().replace(/\s+/g, '-'),
      version: spec.version || '1.0.0',
      description: spec.description,
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
      },
      dependencies: {
        next: '14.0.4',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        '@prisma/client': '^5.8.0',
        axios: '^1.6.2',
        'socket.io-client': '^4.6.1',
      },
      devDependencies: {
        '@types/node': '^20.10.0',
        '@types/react': '^18.2.45',
        '@types/react-dom': '^18.2.18',
        typescript: '^5.3.3',
        prisma: '^5.8.0',
        tailwindcss: '^3.4.0',
        autoprefixer: '^10.4.16',
        postcss: '^8.4.32',
      },
    };

    await fs.writeFile(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  }

  private async generateNextJSStructure(projectDir: string, spec: AppSpec): Promise<void> {
    const appDir = path.join(projectDir, 'app');
    await fs.mkdir(appDir, { recursive: true });

    // Generate layout
    const layout = `import './globals.css';

export const metadata = {
  title: '${spec.name}',
  description: '${spec.description}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;

    await fs.writeFile(path.join(appDir, 'layout.tsx'), layout);

    // Generate globals.css
    const globalsCSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: ${spec.ui?.primaryColor || '#3b82f6'};
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`;

    await fs.writeFile(path.join(appDir, 'globals.css'), globalsCSS);

    // Generate pages
    for (const page of spec.pages || []) {
      const pageContent = this.generatePageComponent(page, spec);
      const pagePath =
        page.path === '/'
          ? 'page.tsx'
          : `${page.path.replace(/^\//, '').replace(/\//g, '/')}/page.tsx`;
      const fullPath = path.join(appDir, pagePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, pageContent);
    }
  }

  private generatePageComponent(page: PageSpec, spec: AppSpec): string {
    const componentName = page.name.replace(/\s+/g, '');
    return `'use client';

export default function ${componentName}Page() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-${spec.ui?.primaryColor?.replace('#', '') || 'blue-600'} text-white p-4">
        <h1 className="text-2xl font-bold">${page.name}</h1>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">${page.name}</h2>
        <p>This is the ${page.name} page.</p>
        ${
          page.components?.length > 0
            ? `
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Components</h3>
          <div className="space-y-4">
            ${page.components.map((c) => `<div className="p-4 border rounded">${c.type} component</div>`).join('\n            ')}
          </div>
        </div>`
            : ''
        }
      </main>
    </div>
  );
}`;
  }

  private async generateAPIStructure(projectDir: string, spec: AppSpec): Promise<void> {
    const apiDir = path.join(projectDir, 'app', 'api');
    await fs.mkdir(apiDir, { recursive: true });

    // Generate API routes
    for (const api of spec.apis || []) {
      const routeContent = this.generateAPIRoute(api);
      const routePath = api.path.replace('/api/', '').replace(/:(\w+)/g, '[$1]');
      const fullPath = path.join(apiDir, routePath, 'route.ts');
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, routeContent);
    }
  }

  private generateAPIRoute(api: ApiSpec): string {
    const method = api.method.toLowerCase();
    const methodUpper = method.toUpperCase();
    return `import { NextRequest, NextResponse } from 'next/server';

export async function ${methodUpper}(
  request: NextRequest
) {
  try {
    // TODO: Implement ${api.method} ${api.path}
    return NextResponse.json({ 
      message: '${api.method} ${api.path} endpoint',
      data: []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`;
  }

  private async generatePrismaSchema(projectDir: string, spec: AppSpec): Promise<void> {
    const prismaDir = path.join(projectDir, 'prisma');
    await fs.mkdir(prismaDir, { recursive: true });

    let schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

    // Generate models
    for (const model of spec.dataModels || []) {
      schema += `model ${model.name} {
`;
      // Add id field
      schema += `  id        String   @id @default(cuid())\n`;

      // Add fields
      for (const field of model.fields || []) {
        const type = this.mapPrismaType(field.type);
        const optional = field.required === false ? '?' : '';
        schema += `  ${field.name}      ${type}${optional}\n`;
      }

      schema += `  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

`;
    }

    await fs.writeFile(path.join(prismaDir, 'schema.prisma'), schema);
  }

  private mapPrismaType(type: string): string {
    const typeMap: Record<string, string> = {
      String: 'String',
      Int: 'Int',
      Float: 'Float',
      Boolean: 'Boolean',
      DateTime: 'DateTime',
      Json: 'Json',
    };
    return typeMap[type] || 'String';
  }

  private async generateREADME(projectDir: string, spec: AppSpec): Promise<void> {
    const readme = `# ${spec.name}

${spec.description}

## Generated by OmniForge

This project was automatically generated by OmniForge on ${new Date(spec.generatedAt || new Date()).toLocaleString()}.

## Features

- ${spec.pages?.length || 0} pages
- ${spec.apis?.length || 0} API endpoints
- ${spec.dataModels?.length || 0} data models
- ${spec.realtime?.length || 0} real-time channels
- ${spec.integrations?.length || 0} integrations

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
\`\`\`

Visit http://localhost:3000

## Pages

${spec.pages?.map((p) => `- ${p.name} (${p.path})`).join('\n') || 'None'}

## API Endpoints

${spec.apis?.map((a) => `- ${a.method} ${a.path}`).join('\n') || 'None'}

## Data Models

${spec.dataModels?.map((m) => `- ${m.name}`).join('\n') || 'None'}
`;

    await fs.writeFile(path.join(projectDir, 'README.md'), readme);
  }

  private async generateEnvExample(projectDir: string): Promise<void> {
    const envExample = `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
`;

    await fs.writeFile(path.join(projectDir, '.env.example'), envExample);
  }

  private async generateTailwindConfig(projectDir: string, spec: AppSpec): Promise<void> {
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${spec.ui?.primaryColor || '#3b82f6'}',
      },
    },
  },
  plugins: [],
};
`;

    await fs.writeFile(path.join(projectDir, 'tailwind.config.js'), tailwindConfig);
  }

  private async generateNextConfig(projectDir: string): Promise<void> {
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;

    await fs.writeFile(path.join(projectDir, 'next.config.js'), nextConfig);
  }

  private async generateTsConfig(projectDir: string): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next',
          },
        ],
        paths: {
          '@/*': ['./*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    };

    await fs.writeFile(path.join(projectDir, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
  }

  private async createTarBall(projectDir: string, projectName: string): Promise<string> {
    const tarPath = path.join(this.outputDir, `${projectName}.tar.gz`);

    try {
      await tar.create(
        {
          gzip: true,
          file: tarPath,
          cwd: this.outputDir,
        },
        [projectName]
      );

      return tarPath;
    } catch (error) {
      throw new Error(`Failed to create tarball: ${error.message}`);
    }
  }
}
