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
  <div class="lyric-editor-instance h-100 d-flex flex-column">
    <!-- Editor Content -->
    <div class="editor-content flex-grow-1 pa-3">
      <v-textarea
        ref="textareaRef"
        :model-value="content"
        @update:model-value="content = $event"
        placeholder="Enter your lyrics here..."
        class="w-100 h-100 lyric-textarea"
        variant="plain"
        no-resize
        hide-details
      />
    </div>

    <!-- Status Bar -->
    <div class="editor-status-bar d-flex align-center justify-space-between px-3 py-2 bg-surface border-t">
      <div class="d-flex align-center ga-4">
        <span class="text-caption text-medium-emphasis">
          Lines: {{ lineCount }}
        </span>
        <span class="text-caption text-medium-emphasis">
          Words: {{ wordCount }}
        </span>
        <span class="text-caption text-medium-emphasis">
          Syllables: {{ totalSyllables }}
        </span>
      </div>

      <div class="d-flex align-center ga-2">
        <span
          v-if="meterStore.loading"
          class="text-caption text-medium-emphasis"
        >
          <v-progress-circular indeterminate size="16" width="2" class="mr-1" />
          Analyzing...
        </span>
        <span
          v-else-if="meterStore.error"
          class="text-caption text-error"
        >
          <v-icon icon="mdi-alert-circle" size="16" class="mr-1" />
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
