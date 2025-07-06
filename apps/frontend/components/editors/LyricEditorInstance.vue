<script setup>
import { ref, watch, computed } from 'vue';
import { useMeterStore } from '../../stores/meter.js';
import debounce from 'lodash.debounce';
import CodeMirror from 'vue-codemirror6';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';

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
const editorRef = ref(null);

// Local content state
const content = ref(props.panelData.content || '');

// Debounced meter analysis (250ms)
const debouncedAnalyzeMeter = debounce((text) => {
  meterStore.analyzeMeter(text);
}, 250);

// Perform analysis immediately if not done recently
defineExpose({
  forceAnalyze(text) {
    meterStore.analyzeMeter(text);
  }
});

const syllableGutter = lineNumbers({
  // noinspection JSUnusedLocalSymbols
  formatNumber: (lineNo, state) => {
    const idx = lineNo - 1;
    const info = meterStore.lineCounts[idx];
    // Return empty string for lines with no count or count of 0
    return info && info[1] > 0 ? String(info[1]) : '';
  }
});

// CodeMirror extensions
const extensions = computed(() => [
  oneDark,
  syllableGutter,
  keymap.of(defaultKeymap)
]);

// Watch for content changes with advanced meter analysis
let lastAnalyzeTime = 0;

watch(content, (newContent) => {
  emit('content-change', newContent);

  const now = performance.now();
  // If more than 1s (1000ms) since last analyze, run immediately
  if (now - lastAnalyzeTime > 1000) {
    meterStore.analyzeMeter(newContent);
    lastAnalyzeTime = now;
  } else {
    debouncedAnalyzeMeter(newContent);
    // When the debounced function fires, update lastAnalyzeTime
    debouncedAnalyzeMeter.flush && debouncedAnalyzeMeter.flush();
    lastAnalyzeTime = performance.now();
  }

  if (newContent && !newContent.trim()) {
    // If the value is cleared, also clear the meter results
    meterStore.lineCounts.value = [];
  }
});

// Update the gutter when syllable counts change
watch(() => meterStore.lineCounts.value, () => {
  if (editorRef.value?.view) {
    // Force a redraw of the editor
    editorRef.value.view.dispatch({});
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
  if (isActive && editorRef.value) {
    editorRef.value.focus();
  }
});

// Handle title change
const handleTitleChange = (newTitle) => {
  emit('metadata-change', 'title', newTitle);
};

// Handle editor click to ensure focus
const handleEditorClick = () => {
  if (editorRef.value) {
    editorRef.value.focus();
  }
};
</script>

<template>
  <div class="lyric-editor-instance h-100 d-flex flex-column">
    <!-- Editor Content - takes full space -->
    <div class="editor-content flex-grow-1 pa-0">
      <CodeMirror
        ref="editorRef"
        :model-value="content"
        @update:model-value="content = $event"
        placeholder="Enter your lyrics here..."
        :extensions="extensions"
        basic
        wrap

        class="editor-container h-100"
        @click="handleEditorClick"
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
.lyric-editor-instance {
  background: transparent;
}

.editor-content {
  min-height: 0; /* Allow flex child to shrink */
  overflow: hidden;
  background: transparent;
}

.editor-container {
  height: 100%;
  min-height: 300px;
  overflow: auto;
  background: transparent;
}
.editor-status-bar {
  height: 32px;
  flex-shrink: 0;
  font-size: 12px;
}

.lyric-editor-instance :deep(.cm-editor) {
  height: 100%;
}

.lyric-editor-instance :deep(.cm-scroller) {
  height: 100%;
  background: transparent !important;
}

.lyric-editor-instance :deep(.cm-content) {
  min-height: 100%;
}

.lyric-editor-instance :deep(.cm-focused) {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  //outline: none !important;
}

.lyric-editor-instance :deep(.cm-activeLineGutter) {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));

}

.lyric-editor-instance :deep(.cm-lineNumbers) {
  width: 36px;
  margin-right: -4px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgb(var(--v-theme-on-surface-variant));
  text-align: right;
}
</style>
