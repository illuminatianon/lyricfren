<script setup>
import { ref, onMounted, watch } from 'vue';
import LyricEditor from '../components/LyricEditor.vue';
import { useMeterStore } from '../stores/meter.js';

const lyrics = ref(`[verse 1]
row, row, row your boat
gently down the stream
merrily merrily merrily merrily
life is but a dream
`);

const meterStore = useMeterStore();
const error = ref('');

// Clear the form
const clearForm = () => {
  lyrics.value = '';
  meterStore.lineCounts.value = [];
  error.value = '';
};

// Initial meter analysis
onMounted(() => {
  meterStore.analyzeMeter(lyrics.value);
});

// Watch for changes to the lyrics
watch(() => lyrics.value, (newValue) => {
  error.value = '';
});
</script>

<template>
  <div class="h-full flex flex-column">
    <LyricEditor
      v-model="lyrics"
      placeholder="Enter your lyrics here..."
      class="flex-1"
    />
    <small v-if="error" class="p-error block mt-2">{{ error }}</small>
  </div>
</template>
