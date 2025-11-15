export interface IdeaCommit {
  id: string;
  ideaId: string;
  userId: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'MERGE' | 'BRANCH';
  message: string;
  branch: string;
  diff?: Record<string, any>;
  specSnapshot?: Record<string, any>;
  createdAt: Date;
}

export interface IdeaBranch {
  id: string;
  parentId: string;
  name: string;
  createdAt: Date;
}

