<script setup>
import { ref, watch } from 'vue';
import { useMeterStore } from '../stores/meter.js';
import debounce from 'lodash.debounce';

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

// Create a debounced version of the meter analysis function
const debouncedAnalyzeMeter = debounce((text) => {
  meterStore.analyzeMeter(text);
}, 500);

// Handle text changes
const handleInput = (event) => {
  const value = event.target.value;
  emit('update:modelValue', value);
  debouncedAnalyzeMeter(value);
};

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && !newValue.trim()) {
    // If the value is cleared, also clear the meter results
    meterStore.lineCounts.value = [];
  }
});
</script>

<template>
  <div class="lyric-editor">
    <textarea
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      class="editor-textarea"
      rows="15"
    ></textarea>
    <div class="meter-annotations">
      <div
        v-for="(lineCount, index) in meterStore.lineCounts"
        :key="index"
        class="meter-line"
        :style="{ top: `${index * 1.5}em` }"
      >
        <span class="meter-count" v-if="lineCount[1] > 0">{{ lineCount[1] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lyric-editor {
  width: 100%;
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.editor-textarea {
  width: 100%;
  padding: 8px;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  resize: vertical;
  background-color: var(--surface-ground);
  color: var(--text-color);
}

.editor-textarea:focus {
  outline: none;
}

.meter-annotations {
  position: absolute;
  right: 8px;
  top: 8px;
  pointer-events: none;
}

.meter-line {
  position: absolute;
  right: 0;
}

.meter-count {
  display: inline-block;
  padding: 0 4px;
  font-size: 0.85em;
  color: #888;
}
</style>
