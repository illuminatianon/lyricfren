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
  <div class="result-display p-4 bg-slate-800 rounded-lg shadow-lg">
    <h2 class="text-xl font-bold mb-4">Generated Result</h2>
    
    <div 
      v-if="result" 
      class="result-content p-4 bg-slate-700 rounded border border-slate-600 text-left overflow-auto max-h-[500px]"
      v-html="formattedResult"
    ></div>
    
    <div 
      v-else 
      class="empty-state p-8 text-center text-slate-400 bg-slate-700 rounded border border-slate-600"
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
