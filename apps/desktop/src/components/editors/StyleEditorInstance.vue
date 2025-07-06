<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  panelData: {
    type: Object,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'content-change',
  'metadata-change',
]);

// Local content state
const content = ref(props.panelData.content || '');

// Watch for content changes
watch(content, (newContent) => {
  emit('content-change', newContent);
});

// Watch for external content changes
watch(() => props.panelData.content, (newContent) => {
  if (newContent !== content.value) {
    content.value = newContent || '';
  }
});
</script>

<template>
  <div class="style-editor-instance h-full flex flex-column align-items-center justify-content-center">
    <div class="text-center">
      <i class="pi pi-palette text-6xl text-color-secondary mb-4"></i>
      <h3 class="text-color-secondary mb-2">Style Editor</h3>
      <p class="text-color-secondary mb-4">This editor will be implemented soon</p>

      <!-- Temporary textarea for testing -->
      <div class="w-full max-w-md">
        <Textarea
          v-model="content"
          placeholder="Temporary style editor..."
          class="w-full"
          rows="6"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.style-editor-instance {
  background: var(--surface-card);
  padding: 2rem;
}
</style>
