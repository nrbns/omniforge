export interface Idea {
  id: string;
  userId: string;
  title: string;
  description?: string;
  rawInput?: string;
  specJson?: any;
  status: 'DRAFT' | 'PARSING' | 'PARSED' | 'BUILDING' | 'BUILT' | 'DEPLOYED' | 'FAILED';
  branch: string;
  parentIdeaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  ideaId: string;
  userId: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Build {
  id: string;
  projectId: string;
  status: 'PENDING' | 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  agent?: string;
  logs?: string;
  outputPath?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface Deployment {
  id: string;
  projectId: string;
  userId: string;
  buildId?: string;
  status: 'PENDING' | 'BUILDING' | 'DEPLOYING' | 'LIVE' | 'FAILED' | 'ROLLED_BACK';
  platform: string;
  url?: string;
  version?: string;
  config?: Record<string, any>;
  error?: string;
  deployedAt?: Date;
  createdAt: Date;
}

export interface DesignToken {
  id: string;
  projectId?: string;
  key: string;
  value: string;
  category: string;
  figmaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSpec {
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

export interface PageSpec {
  id: string;
  name: string;
  path: string;
  components: ComponentSpec[];
}

export interface ComponentSpec {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: ComponentSpec[];
}

export interface DataModelSpec {
  name: string;
  fields: FieldSpec[];
}

export interface FieldSpec {
  name: string;
  type: string;
  required?: boolean;
}

export interface ApiSpec {
  path: string;
  method: string;
  handler?: string;
}

export interface RealtimeSpec {
  channel: string;
  events: string[];
}

export interface IntegrationSpec {
  name: string;
  type: string;
  config?: Record<string, any>;
}

export interface UISpec {
  theme: 'light' | 'dark';
  primaryColor: string;
  tokens?: Record<string, any>;
}

