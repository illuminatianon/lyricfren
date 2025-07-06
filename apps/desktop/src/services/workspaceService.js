/**
 * Frontend service for workspace operations
 * Communicates with Electron main process via IPC
 */

class WorkspaceService {
  /**
   * Save workspace data
   * @param {Object} workspaceData - Complete workspace data object
   * @returns {Promise<string>} Workspace ID
   */
  async saveWorkspace(workspaceData) {
    try {
      return await window.api.saveWorkspace(workspaceData);
    } catch (error) {
      console.error('Failed to save workspace:', error);
      throw error;
    }
  }

  /**
   * Load workspace by ID
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Object|null>} Workspace data or null if not found
   */
  async loadWorkspace(workspaceId) {
    try {
      return await window.api.loadWorkspace(workspaceId);
    } catch (error) {
      console.error('Failed to load workspace:', error);
      throw error;
    }
  }

  /**
   * List all available workspaces
   * @returns {Promise<Array>} Array of workspace metadata
   */
  async listWorkspaces() {
    try {
      return await window.api.listWorkspaces();
    } catch (error) {
      console.error('Failed to list workspaces:', error);
      throw error;
    }
  }

  /**
   * Delete workspace by ID
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteWorkspace(workspaceId) {
    try {
      return await window.api.deleteWorkspace(workspaceId);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }

  /**
   * Duplicate workspace with new name
   * @param {string} workspaceId - Original workspace ID
   * @param {string} newName - Name for the duplicated workspace
   * @returns {Promise<string>} New workspace ID
   */
  async duplicateWorkspace(workspaceId, newName) {
    try {
      return await window.api.duplicateWorkspace(workspaceId, newName);
    } catch (error) {
      console.error('Failed to duplicate workspace:', error);
      throw error;
    }
  }

  /**
   * Check if workspace exists
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<boolean>} True if workspace exists
   */
  async workspaceExists(workspaceId) {
    try {
      return await window.api.workspaceExists(workspaceId);
    } catch (error) {
      console.error('Failed to check workspace existence:', error);
      throw error;
    }
  }

  /**
   * Get workspace metadata without loading full data
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Object|null>} Workspace metadata or null if not found
   */
  async getWorkspaceMetadata(workspaceId) {
    try {
      return await window.api.getWorkspaceMetadata(workspaceId);
    } catch (error) {
      console.error('Failed to get workspace metadata:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new WorkspaceService();
