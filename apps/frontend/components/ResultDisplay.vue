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
    <h2 class="text-h5 font-weight-bold mb-4 text-primary">Generated Result</h2>

    <v-card
      v-if="result"
      class="result-content pa-4 text-left overflow-auto"
      style="max-height: 480px"
      variant="outlined"
    >
      <div v-html="formattedResult"></div>
    </v-card>

    <v-card
      v-else
      class="empty-state pa-8 text-center"
      variant="outlined"
    >
      <v-icon icon="mdi-file-document-outline" size="64" color="medium-emphasis" class="mb-2" />
      <p class="text-medium-emphasis">Generated content will appear here</p>
    </v-card>
  </div>
</template>

<style scoped>
.result-content {
  white-space: pre-wrap;
}
</style>
