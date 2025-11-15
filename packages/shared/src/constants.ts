export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export const CHANNELS = {
  IDEA: (id: string) => `idea:${id}`,
  BUILD: (id: string) => `build:${id}`,
  DEPLOYMENT: (id: string) => `deployment:${id}`,
  PROJECT: (id: string) => `project:${id}`,
  PREVIEW: (id: string) => `preview:${id}`,
  PRESENCE: 'presence',
  COMMENTS: (id: string) => `comments:${id}`,
};

export const EVENTS = {
  IDEA_CREATED: 'idea.created',
  IDEA_UPDATED: 'idea.updated',
  IDEA_COMMITTED: 'idea.committed',
  IDEA_BRANCHED: 'idea.branched',
  IDEA_PARSED: 'idea.parsed',
  BUILD_CREATED: 'build.created',
  BUILD_STARTED: 'build.started',
  BUILD_UPDATED: 'build.updated',
  BUILD_COMPLETED: 'build.completed',
  DEPLOYMENT_CREATED: 'deployment.created',
  DEPLOYMENT_STARTED: 'deployment.started',
  DEPLOYMENT_UPDATED: 'deployment.updated',
  DEPLOYMENT_COMPLETED: 'deployment.completed',
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
};

