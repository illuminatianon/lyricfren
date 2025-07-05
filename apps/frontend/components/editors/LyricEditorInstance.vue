<script setup>
import { ref, watch, computed } from 'vue';
import { useMeterStore } from '../../stores/meter.js';
import debounce from 'lodash.debounce';

const props = defineProps({
  panelData: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'content-change',
  'metadata-change'
]);

const meterStore = useMeterStore();
const textareaRef = ref(null);

// Local content state
const content = ref(props.panelData.content || '');

// Debounced meter analysis
const debouncedAnalyzeMeter = debounce((text) => {
  meterStore.analyzeMeter(text);
}, 250);

// Watch for content changes
watch(content, (newContent) => {
  emit('content-change', newContent);

  // Analyze meter if content exists
  if (newContent.trim()) {
    debouncedAnalyzeMeter(newContent);
  } else {
    meterStore.lineCounts.value = [];
  }
});

// Watch for external content changes (from panel data)
watch(() => props.panelData.content, (newContent) => {
  if (newContent !== content.value) {
    content.value = newContent || '';
  }
});

// Computed properties
const lineCount = computed(() => {
  return content.value.split('\n').length;
});

const wordCount = computed(() => {
  return content.value.trim().split(/\s+/).filter(word => word.length > 0).length;
});

const totalSyllables = computed(() => {
  return meterStore.totalSyllables;
});

// Focus management
watch(() => props.isActive, (isActive) => {
  if (isActive && textareaRef.value) {
    textareaRef.value.$el.focus();
  }
});

// Handle textarea input
const handleInput = (event) => {
  content.value = event.target.value;
};

// Handle title change
const handleTitleChange = (newTitle) => {
  emit('metadata-change', 'title', newTitle);
};
</script>

<template>
  <div class="lyric-editor-instance h-full flex flex-column">
    <!-- Editor Content -->
    <div class="editor-content flex-1 p-3">
      <Textarea
        ref="textareaRef"
        :model-value="content"
        @update:model-value="content = $event"
        placeholder="Enter your lyrics here..."
        class="w-full h-full lyric-textarea"
        :auto-resize="false"
      />
    </div>

    <!-- Status Bar -->
    <div class="editor-status-bar flex align-items-center justify-content-between px-3 py-2 surface-section border-top-1 border-surface">
      <div class="flex align-items-center gap-4">
        <span class="text-sm text-color-secondary">
          Lines: {{ lineCount }}
        </span>
        <span class="text-sm text-color-secondary">
          Words: {{ wordCount }}
        </span>
        <span class="text-sm text-color-secondary">
          Syllables: {{ totalSyllables }}
        </span>
      </div>

      <div class="flex align-items-center gap-2">
        <span
          v-if="meterStore.loading"
          class="text-sm text-color-secondary"
        >
          <i class="pi pi-spin pi-spinner mr-1"></i>
          Analyzing...
        </span>
        <span
          v-else-if="meterStore.error"
          class="text-sm text-red-500"
        >
          <i class="pi pi-exclamation-triangle mr-1"></i>
          {{ meterStore.error }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-content {
  min-height: 0; /* Allow flex child to shrink */
}

.lyric-textarea {
  resize: none;
  border: none;
  background: transparent;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.lyric-textarea:focus {
  box-shadow: none;
  border-color: transparent;
}

.editor-status-bar {
  height: 32px;
  flex-shrink: 0;
  font-size: 12px;
}

/* Remove PrimeVue textarea default styling */
:deep(.p-textarea) {
  border: none;
  padding: 16px;
  background: transparent;
  box-shadow: none;
}

:deep(.p-textarea:focus) {
  border-color: transparent;
  box-shadow: none;
}
</style>
