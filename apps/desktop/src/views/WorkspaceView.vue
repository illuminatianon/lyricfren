<script setup>
import { onMounted } from 'vue';
import EditorWorkspace from '../components/workspace/EditorWorkspace.vue';
import { useWorkspaceManager } from '../stores/workspaceManager.js';

const workspaceManager = useWorkspaceManager();

// Initialize workspace on mount
onMounted(() => {
  console.log('WorkspaceView mounted');
  console.log('Current workspace:', workspaceManager.currentWorkspace);
});
</script>

<template>
  <div class="workspace-view">
    <EditorWorkspace />
  </div>
</template>

<style scoped>
.workspace-view {
  /* Remove the parent padding and make this full height */
  margin: -1rem;
  height: calc(100vh - 64px); /* Account for header only */
  overflow: hidden;
}
</style>
