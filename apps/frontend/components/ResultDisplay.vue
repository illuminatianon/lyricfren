<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  result: {
    type: String,
    default: ''
  }
});

const formattedResult = ref('');

// Format the result with line breaks
watch(() => props.result, (newResult) => {
  if (newResult) {
    formattedResult.value = newResult.replace(/\n/g, '<br>');
  } else {
    formattedResult.value = '';
  }
}, { immediate: true });
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4 text-primary">Generated Result</h2>

    <div
      v-if="result"
      class="result-content p-4 surface-card border-1 border-round text-left overflow-auto max-h-30rem"
      v-html="formattedResult"
    ></div>

    <div
      v-else
      class="empty-state p-5 text-center text-color-secondary surface-card border-1 border-round"
    >
      <i class="pi pi-file-o text-4xl mb-2"></i>
      <p>Generated content will appear here</p>
    </div>
  </div>
</template>

<style scoped>
.result-content {
  white-space: pre-wrap;
}
</style>
