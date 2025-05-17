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
  <div class="container mx-auto">
    <div class="grid">
      <div class="col-12 p-2">
        <Card class="h-full">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>Lyrics</span>
              <Button icon="pi pi-trash" @click="clearForm" severity="secondary" text aria-label="Clear" tooltip="Clear" />
            </div>
          </template>
          <template #content>
            <div class="mb-3">
              <LyricEditor
                v-model="lyrics"
                placeholder="Enter your lyrics here..."
              />
            </div>
            <small v-if="error" class="p-error block mt-2">{{ error }}</small>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
