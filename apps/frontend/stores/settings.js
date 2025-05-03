import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api.js';

export const useSettingsStore = defineStore('settings', () => {
  // State
  const openaiApiKey = ref('');
  const sunoApiKey = ref('');
  const defaultModelParams = ref({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 512,
    topP: 1.0
  });
  const loading = ref(false);
  const error = ref('');

  // Actions
  const fetchConfig = async () => {
    loading.value = true;
    error.value = '';

    try {
      const data = await api.get('/config');

      openaiApiKey.value = data.openaiApiKey || '';
      sunoApiKey.value = data.sunoApiKey || '';

      if (data.defaultModelParams) {
        defaultModelParams.value = {
          ...defaultModelParams.value,
          ...data.defaultModelParams
        };
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      error.value = 'Failed to load configuration';
    } finally {
      loading.value = false;
    }
  };

  const saveConfig = async () => {
    loading.value = true;
    error.value = '';

    try {
      const response = await fetch(`${apiBaseUrl}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          openaiApiKey: openaiApiKey.value,
          sunoApiKey: sunoApiKey.value,
          defaultModelParams: defaultModelParams.value
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save configuration');
      }
    } catch (err) {
      console.error('Error saving config:', err);
      error.value = err.message || 'Failed to save configuration';
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    openaiApiKey,
    sunoApiKey,
    defaultModelParams,
    loading,
    error,

    // Actions
    fetchConfig,
    saveConfig
  };
});
