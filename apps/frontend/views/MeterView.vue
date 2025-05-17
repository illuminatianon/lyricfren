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
      <div class="col-12 md:col-6 p-2">
        <Card class="h-full">
          <template #title>
            Lyrics
          </template>
          <template #content>
            <div class="mb-3">
              <LyricEditor
                v-model="lyrics"
                placeholder="Enter your lyrics here..."
              />
            </div>
            <div class="flex gap-2">
              <Button label="Clear" icon="pi pi-trash" @click="clearForm" severity="secondary" />
            </div>
            <small v-if="error" class="p-error block mt-2">{{ error }}</small>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-6 p-2">
        <Card class="h-full">
          <template #title>
            Syllable Analysis
          </template>
          <template #content>
            <div v-if="meterStore.lineCounts.length > 0">
              <div class="mb-3">
                <p>Total lines: {{ meterStore.lineCounts.length }}</p>
                <p>Total syllables: {{ meterStore.totalSyllables }}</p>
              </div>
              <div class="overflow-y-auto" style="max-height: 400px;">
                <div
                  v-for="(result, index) in meterStore.lineCounts"
                  :key="index"
                  class="p-2 mb-1 border-round"
                  :class="{
                    'surface-hover': result[1] > 0,
                    'surface-ground': result[1] === 0
                  }"
                >
                  <div class="flex justify-content-between align-items-center">
                    <div class="text-overflow-ellipsis overflow-hidden">{{ result[0] }}</div>
                    <div class="font-bold ml-3">{{ result[1] }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center p-4 text-500">
              <i class="pi pi-info-circle text-xl mb-3 block"></i>
              <p>Start typing in the editor to see syllable counts</p>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
