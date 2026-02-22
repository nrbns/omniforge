import { Injectable, Logger } from '@nestjs/common';

export interface VercelDeployResult {
  url: string;
  status: string;
  deploymentId?: string;
}

/**
 * Vercel deployment service.
 * Uses Vercel REST API when VERCEL_TOKEN is set.
 */
@Injectable()
export class VercelService {
  private readonly logger = new Logger(VercelService.name);
  private readonly token = process.env.VERCEL_TOKEN;
  private readonly teamId = process.env.VERCEL_TEAM_ID;

  async deployFromLayout(projectName: string, layoutJson: any): Promise<VercelDeployResult> {
    if (!this.token) {
      this.logger.warn('VERCEL_TOKEN not set - returning placeholder URL');
      return {
        url: `https://${projectName.toLowerCase().replace(/\s+/g, '-')}-omniforge.vercel.app`,
        status: 'mock',
      };
    }

    try {
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          project: projectName,
          ...(this.teamId && { teamId: this.teamId }),
          files: this.layoutToVercelFiles(layoutJson),
          projectSettings: {
            framework: 'nextjs',
            buildCommand: 'npm run build',
            outputDirectory: '.next',
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Vercel API error: ${response.status} - ${err}`);
      }

      const data = await response.json();
      const url = data.url || data.readyState?.url || `https://${data.name}.vercel.app`;

      return {
        url: url.startsWith('http') ? url : `https://${url}`,
        status: 'deployed',
        deploymentId: data.id,
      };
    } catch (error) {
      this.logger.error('Vercel deploy failed', error);
      return {
        url: `https://${projectName}-demo.vercel.app`,
        status: 'error_fallback',
      };
    }
  }

  private layoutToVercelFiles(layout: any): Array<{ file: string; data: string }> {
    const files: Array<{ file: string; data: string }> = [];
    const pageContent = this.layoutToJSX(layout?.children || []);

    files.push({
      file: 'package.json',
      data: JSON.stringify({
        name: 'omniforge-app',
        dependencies: { next: '14.0.4', react: '^18.2.0', 'react-dom': '^18.2.0' },
      }),
    });
    files.push({
      file: 'app/page.jsx',
      data: `export default function Page() { return <div>${pageContent}</div>; }`,
    });
    files.push({
      file: 'app/layout.jsx',
      data: `export default function Layout({ children }) { return <html><body>{children}</body></html>; }`,
    });

    return files;
  }

  private layoutToJSX(children: any[]): string {
    if (!children?.length) return 'Empty';
    return children.map((n: any) => `<section key="${n.id}">${n.type}</section>`).join('');
  }
}
