<script setup>
import { ref, watch, computed } from 'vue';
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

// Watch for changes to modelValue
let lastAnalyzeTime = 0;

watch(() => props.modelValue, (newValue) => {
  const now = performance.now();
  // If more than 1s (1000ms) since last analyze, run immediately
  if (now - lastAnalyzeTime > 1000) {
    meterStore.analyzeMeter(newValue);
    lastAnalyzeTime = now;
  } else {
    debouncedAnalyzeMeter(newValue);
    // When the debounced function fires, update lastAnalyzeTime
    debouncedAnalyzeMeter.flush && debouncedAnalyzeMeter.flush();
    lastAnalyzeTime = performance.now();
  }

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
  <div class="lyric-editor h-full flex flex-column">
    <CodeMirror
      ref="editorRef"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :extensions="extensions"
      basic
      wrap
      class="editor-container flex-1"
    />
  </div>
</template>

<style>
.lyric-editor {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  overflow: hidden;
}

.editor-container {
  height: 100%;
  min-height: 300px;
  overflow: auto;
}

:deep(.cm-lineNumbers) {
  width: 38px;
  background: var(--surface-ground);
  border-right: 1px solid var(--surface-border);
  color: var(--text-color-secondary);
  text-align: center;
}

/* only cells that actually contain a number */
:deep(.cm-lineNumbers span) {
  font-weight: 600;
  color: var(--primary-color);
}

/* Ensure CodeMirror editor fills the container */
:deep(.cm-editor) {
  height: 100%;
}

:deep(.cm-scroller) {
  height: 100%;
}
</style>
