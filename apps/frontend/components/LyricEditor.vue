<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useMeterStore } from '../stores/meter.js';
import debounce from 'lodash.debounce';
import { EditorView, lineNumbers, gutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

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
let editorView = null;

// Create a debounced version of the meter analysis function
const debouncedAnalyzeMeter = debounce((text) => {
  meterStore.analyzeMeter(text);
}, 500);

// Create a custom gutter for syllable counts
const syllableGutter = gutter({
  class: "syllable-gutter",
  renderElement: (view, line) => {
    const lineNumber = view.state.doc.lineAt(line.from).number - 1; // 0-based index
    const lineInfo = meterStore.lineCounts.value[lineNumber];
    const syllableCount = lineInfo ? lineInfo[1] : 0;

    const element = document.createElement("div");
    element.className = "syllable-count";

    if (syllableCount > 0) {
      element.textContent = syllableCount;
      element.classList.add("has-syllables");
    }

    return element;
  }
});

// Initialize CodeMirror editor
const initEditor = () => {
  if (editorRef.value) {
    // Create the editor state
    const state = EditorState.create({
      doc: props.modelValue,
      extensions: [
        defaultKeymap,
        oneDark,
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            const value = update.state.doc.toString();
            emit('update:modelValue', value);
            debouncedAnalyzeMeter(value);
          }
        }),
        syllableGutter
      ]
    });

    // Create the editor view
    editorView = new EditorView({
      state,
      parent: editorRef.value
    });
  }
};

// Update the editor when modelValue changes externally
watch(() => props.modelValue, (newValue) => {
  if (editorView && newValue !== editorView.state.doc.toString()) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: newValue || ''
      }
    });
  }

  if (newValue && !newValue.trim()) {
    // If the value is cleared, also clear the meter results
    meterStore.lineCounts.value = [];
  }
});

// Update the gutter when syllable counts change
watch(() => meterStore.lineCounts.value, () => {
  if (editorView) {
    // Force a redraw of the gutter
    editorView.dispatch({});
  }
});

// Initialize the editor on mount
onMounted(() => {
  initEditor();
});

// Clean up on unmount
onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy();
  }
});
</script>

<template>
  <div class="lyric-editor">
    <div ref="editorRef" class="editor-container"></div>
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

.syllable-gutter {
  width: 30px;
  color: var(--text-color-secondary);
  background-color: var(--surface-ground);
  border-right: 1px solid var(--surface-border);
}

.syllable-count {
  padding: 0 4px;
  text-align: center;
  font-size: 0.85em;
  line-height: 1.5em;
}

.syllable-count.has-syllables {
  color: var(--primary-color);
  font-weight: bold;
  background-color: var(--surface-hover);
  border-radius: 4px;
  margin: 2px 4px;
}

/* Override CodeMirror dark theme to match our app theme */
.cm-editor {
  height: 100%;
}

.cm-scroller {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

.cm-content {
  white-space: pre-wrap;
}

.cm-line {
  padding: 0 4px;
}
</style>
