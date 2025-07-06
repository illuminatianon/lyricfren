import fs from 'fs';
import * as yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import { getWorkspacePath } from '../config.ts';

export interface WorkspaceData {
  id: string;
  name: string;
  description: string;
  created: Date;
  modified: Date;
  version: string;
  layout: {
    panelOrder: string[];
    panelWidths: Record<string, number>;
    globalSidebarWidth: number;
    workspaceWidth: number;
    resetToAuto: boolean;
  };
  panels: Record<string, any>;
  ui: {
    activePanel: string | null;
    workspaceToolbarVisible: boolean;
    statusBarVisible: boolean;
  };
}

/**
 * Workspace persistence service
 */
class WorkspaceService {
  /**
   * Save workspace to YAML file
   */
  async saveWorkspace(workspaceData: WorkspaceData): Promise<string> {
    try {
      const filename = `${workspaceData.id}.yaml`;
      const filePath = getWorkspacePath(filename);
      
      // Prepare data for saving (convert dates to ISO strings)
      const dataToSave = {
        ...workspaceData,
        created: workspaceData.created.toISOString(),
        modified: new Date().toISOString(),
      };

      // Convert to YAML and save
      const yamlContent = yaml.dump(dataToSave, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      });

      fs.writeFileSync(filePath, yamlContent, 'utf8');
      console.log(`Workspace saved: ${filePath}`);
      
      return workspaceData.id;
    } catch (error) {
      console.error('Error saving workspace:', error);
      throw new Error(`Failed to save workspace: ${error.message}`);
    }
  }

  /**
   * Load workspace from YAML file
   */
  async loadWorkspace(workspaceId: string): Promise<WorkspaceData | null> {
    try {
      const filename = `${workspaceId}.yaml`;
      const filePath = getWorkspacePath(filename);

      if (!fs.existsSync(filePath)) {
        console.warn(`Workspace file not found: ${filePath}`);
        return null;
      }

      const yamlContent = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(yamlContent) as any;

      // Convert ISO strings back to Date objects
      return {
        ...data,
        created: new Date(data.created),
        modified: new Date(data.modified),
      };
    } catch (error) {
      console.error('Error loading workspace:', error);
      throw new Error(`Failed to load workspace: ${error.message}`);
    }
  }

  /**
   * List all available workspaces
   */
  async listWorkspaces(): Promise<Array<{ id: string; name: string; modified: Date; description: string }>> {
    try {
      const workspacesDir = getWorkspacePath('');
      
      if (!fs.existsSync(workspacesDir)) {
        return [];
      }

      const files = fs.readdirSync(workspacesDir)
        .filter(file => file.endsWith('.yaml'))
        .map(file => file.replace('.yaml', ''));

      const workspaces = [];
      
      for (const workspaceId of files) {
        try {
          const workspace = await this.loadWorkspace(workspaceId);
          if (workspace) {
            workspaces.push({
              id: workspace.id,
              name: workspace.name,
              modified: workspace.modified,
              description: workspace.description,
            });
          }
        } catch (error) {
          console.warn(`Failed to load workspace ${workspaceId}:`, error.message);
        }
      }

      // Sort by modified date (newest first)
      return workspaces.sort((a, b) => b.modified.getTime() - a.modified.getTime());
    } catch (error) {
      console.error('Error listing workspaces:', error);
      throw new Error(`Failed to list workspaces: ${error.message}`);
    }
  }

  /**
   * Delete workspace file
   */
  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    try {
      const filename = `${workspaceId}.yaml`;
      const filePath = getWorkspacePath(filename);

      if (!fs.existsSync(filePath)) {
        console.warn(`Workspace file not found for deletion: ${filePath}`);
        return false;
      }

      fs.unlinkSync(filePath);
      console.log(`Workspace deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw new Error(`Failed to delete workspace: ${error.message}`);
    }
  }

  /**
   * Duplicate workspace with new ID and name
   */
  async duplicateWorkspace(workspaceId: string, newName: string): Promise<string> {
    try {
      const originalWorkspace = await this.loadWorkspace(workspaceId);
      if (!originalWorkspace) {
        throw new Error(`Workspace ${workspaceId} not found`);
      }

      const newWorkspace: WorkspaceData = {
        ...originalWorkspace,
        id: uuidv4(),
        name: newName,
        created: new Date(),
        modified: new Date(),
      };

      await this.saveWorkspace(newWorkspace);
      return newWorkspace.id;
    } catch (error) {
      console.error('Error duplicating workspace:', error);
      throw new Error(`Failed to duplicate workspace: ${error.message}`);
    }
  }

  /**
   * Check if workspace exists
   */
  async workspaceExists(workspaceId: string): Promise<boolean> {
    const filename = `${workspaceId}.yaml`;
    const filePath = getWorkspacePath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Get workspace metadata without loading full data
   */
  async getWorkspaceMetadata(workspaceId: string): Promise<{ id: string; name: string; modified: Date; description: string } | null> {
    try {
      const workspace = await this.loadWorkspace(workspaceId);
      if (!workspace) return null;

      return {
        id: workspace.id,
        name: workspace.name,
        modified: workspace.modified,
        description: workspace.description,
      };
    } catch (error) {
      console.error('Error getting workspace metadata:', error);
      return null;
    }
  }
}

// Export singleton instance
const workspaceService = new WorkspaceService();
export default workspaceService;
