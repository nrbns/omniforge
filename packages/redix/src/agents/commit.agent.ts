import { Idea } from '@omniforge/shared';

export class CommitAgent {
  /**
   * Creates a commit for idea changes
   */
  async createCommit(idea: Idea, changes: Record<string, any>): Promise<any> {
    const diff = this.calculateDiff(idea, changes);

    return {
      ideaId: idea.id,
      type: 'UPDATE',
      message: this.generateCommitMessage(changes),
      branch: idea.branch,
      diff,
      specSnapshot: idea.specJson,
    };
  }

  private calculateDiff(oldIdea: Idea, changes: Record<string, any>): Record<string, any> {
    const diff: Record<string, any> = {};

    if (changes.title && changes.title !== oldIdea.title) {
      diff.title = { old: oldIdea.title, new: changes.title };
    }

    if (changes.description && changes.description !== oldIdea.description) {
      diff.description = { old: oldIdea.description, new: changes.description };
    }

    if (changes.specJson && JSON.stringify(changes.specJson) !== JSON.stringify(oldIdea.specJson)) {
      diff.specJson = { old: oldIdea.specJson, new: changes.specJson };
    }

    return diff;
  }

  private generateCommitMessage(changes: Record<string, any>): string {
    const messages: string[] = [];

    if (changes.title) messages.push(`Update title`);
    if (changes.description) messages.push(`Update description`);
    if (changes.specJson) messages.push(`Update spec`);

    return messages.join(', ') || 'Update idea';
  }
}

