<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useMeterStore } from '../stores/meter.js';
import debounce from 'lodash.debounce';
import CodeMirror from 'vue-codemirror6';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Enter your lyrics here...'
  }
});

const emit = defineEmits(['update:modelValue']);
const meterStore = useMeterStore();
const editorRef = ref(null);

// Create a debounced version of the meter analysis function
const debouncedAnalyzeMeter = debounce((text) => {
  meterStore.analyzeMeter(text);
}, 500);

const syllableGutter = lineNumbers({
  formatNumber: (lineNo, state) => {
    const idx = lineNo - 1;
    const info = meterStore.lineCounts[idx];
    return info ? String(info[1]) : '';
  }
});

// CodeMirror extensions
const extensions = computed(() => [
  oneDark,
  syllableGutter,
  keymap.of(defaultKeymap)
]);

// Watch for changes to modelValue
watch(() => props.modelValue, (newValue) => {
  // Analyze the meter when the value changes
  debouncedAnalyzeMeter(newValue);

  if (newValue && !newValue.trim()) {
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
</script>

<template>
  <div class="lyric-editor">
    <CodeMirror
      ref="editorRef"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :extensions="extensions"
      basic
      wrap
      class="editor-container"
    />
  </div>
</template>

<style>
.lyric-editor {
  width: 100%;
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  overflow: hidden;
}

.editor-container {
  height: 300px;
  overflow: auto;
}

:deep(.syllable-gutter) {
  width: 30px;
  color: var(--text-color-secondary);
  background-color: var(--surface-ground);
  border-right: 1px solid var(--surface-border);
}

:deep(.syllable-count) {
  padding: 0 4px;
  text-align: center;
  font-size: 0.85em;
  line-height: 1.5em;
}

:deep(.syllable-count.has-syllables) {
  color: var(--primary-color);
  font-weight: bold;
  background-color: var(--surface-hover);
  border-radius: 4px;
  margin: 2px 4px;
}

/* Override CodeMirror dark theme to match our app theme */
:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.cm-content) {
  white-space: pre-wrap;
}

:deep(.cm-line) {
  padding: 0 4px;
}
</style>
