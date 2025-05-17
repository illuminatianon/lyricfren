<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api.js';

const lyrics = ref(`[verse 1]
row, row, row your boat
gently down the stream
merrily merrily merrily merrily
life is but a dream
`);

const meterResults = ref([]);
const loading = ref(false);
const error = ref('');

// Function to analyze the meter
const analyzeMeter = async () => {
  if (!lyrics.value.trim()) {
    error.value = 'Please enter some lyrics to analyze';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await api.post('/meter/count', { text: lyrics.value });
    meterResults.value = result;
  } catch (err) {
    console.error('Error analyzing meter:', err);
    error.value = 'Failed to analyze meter';
  } finally {
    loading.value = false;
  }
};

// Clear the form
const clearForm = () => {
  lyrics.value = '';
  meterResults.value = [];
  error.value = '';
};
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
              <Textarea
                v-model="lyrics"
                rows="15"
                class="w-full"
                placeholder="Enter your lyrics here..."
              />
            </div>
            <div class="flex gap-2">
              <Button label="Analyze Meter" icon="pi pi-calculator" @click="analyzeMeter" :loading="loading" />
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
            <div v-if="meterResults.length > 0">
              <div class="mb-3">
                <p>Total lines: {{ meterResults.length }}</p>
                <p>Total syllables: {{ meterResults.reduce((sum, [_, count]) => sum + count, 0) }}</p>
              </div>
              <div class="overflow-y-auto" style="max-height: 400px;">
                <div
                  v-for="(result, index) in meterResults"
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
              <p>Enter lyrics and click "Analyze Meter" to see syllable counts</p>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
