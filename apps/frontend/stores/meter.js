import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import api from '../services/api.js';

export const useMeterStore = defineStore('meter', () => {
  // State
  const lineCounts = ref([]);
  const loading = ref(false);
  const error = ref('');
  const totalSyllables = computed(() => {
    return lineCounts.value.reduce((sum, [_, count]) => sum + count, 0);
  });

  // Actions
  const analyzeMeter = async (text) => {
    if (!text.trim()) {
      lineCounts.value = [];
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      lineCounts.value = await api.post('/meter/count', { text });
    } catch (err) {
      console.error('Error analyzing meter:', err);
      error.value = 'Failed to analyze meter';
    } finally {
      loading.value = false;
    }
  };

  const analyzeLineMetrics = async (line) => {
    try {
      const result = await api.post('/meter/count-line', { line });
      return result.syllableCount;
    } catch (err) {
      console.error('Error analyzing line metrics:', err);
      return 0;
    }
  };

  return {
    // State
    lineCounts,
    loading,
    error,
    totalSyllables,

    // Actions
    analyzeMeter,
    analyzeLineMetrics,
  };
});
