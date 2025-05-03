<script setup>
import { ref, computed } from 'vue';
import { useSettingsStore } from '../stores/settings';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible']);

const settingsStore = useSettingsStore();

// Local state for form values
const openaiKey = ref('');
const model = ref('');
const temperature = ref(0.7);
const maxTokens = ref(512);
const topP = ref(1.0);
const saving = ref(false);
const successMessage = ref('');

// Computed property to mask API keys
const maskedOpenaiKey = computed(() => {
  const key = settingsStore.openaiApiKey;
  if (!key) return '';
  if (key.startsWith('sk-')) {
    return `sk-...${key.slice(-4)}`;
  }
  return key;
});

// Load settings when dialog is opened
const onDialogShow = () => {
  openaiKey.value = settingsStore.openaiApiKey;
  model.value = settingsStore.defaultModelParams.model;
  temperature.value = settingsStore.defaultModelParams.temperature;
  maxTokens.value = settingsStore.defaultModelParams.maxTokens;
  topP.value = settingsStore.defaultModelParams.topP;
  successMessage.value = '';
};

// Save settings
const saveSettings = async () => {
  saving.value = true;

  try {
    // Update store values
    settingsStore.openaiApiKey = openaiKey.value;
    settingsStore.defaultModelParams = {
      model: model.value,
      temperature: parseFloat(temperature.value),
      maxTokens: parseInt(maxTokens.value),
      topP: parseFloat(topP.value)
    };

    // Save to backend
    await settingsStore.saveConfig();
    successMessage.value = 'Settings saved successfully!';

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Error saving settings:', error);
  } finally {
    saving.value = false;
  }
};

// Close dialog
const closeDialog = () => {
  emit('update:visible', false);
};
</script>

<template>
  <Dialog v-model:visible="props.visible" modal header="Settings" :style="{ width: '500px' }" :closable="true"
    @show="onDialogShow" @update:visible="(val) => emit('update:visible', val)">
    <div class="p-fluid">
      <div class="mb-4">
        <h3 class="text-xl mb-3">API Keys</h3>

        <div class="field mb-3">
          <label for="openai-key" class="block mb-2">OpenAI API Key</label>
          <InputText id="openai-key" v-model="openaiKey" placeholder="sk-..." class="w-full" type="password" />
          <small class="block mt-1 text-color-secondary">Current: {{ maskedOpenaiKey || 'Not set' }}</small>
        </div>
      </div>

      <Divider />

      <div class="mb-4">
        <h3 class="text-xl mb-3">Model Parameters</h3>

        <div class="field mb-3">
          <label for="model" class="block mb-2">Model</label>
          <Dropdown id="model" v-model="model" :options="['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']"
            placeholder="Select a model" class="w-full" />
        </div>

        <div class="field mb-3">
          <label for="temperature" class="block mb-2">Temperature: {{ temperature }}</label>
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon">0</span>
            <InputText id="temperature" v-model="temperature" type="range" min="0" max="2" step="0.1" class="w-full" />
            <span class="p-inputgroup-addon">2</span>
          </div>
          <small class="block mt-1 text-color-secondary">Controls randomness (0 = deterministic, 2 = maximum
            creativity)</small>
        </div>

        <div class="field mb-3">
          <label for="max-tokens" class="block mb-2">Max Tokens</label>
          <InputText id="max-tokens" v-model="maxTokens" type="number" min="1" max="4096" class="w-full" />
          <small class="block mt-1 text-color-secondary">Maximum length of generated text</small>
        </div>

        <div class="field">
          <label for="top-p" class="block mb-2">Top P: {{ topP }}</label>
          <div class="p-inputgroup">
            <span class="p-inputgroup-addon">0</span>
            <InputText id="top-p" v-model="topP" type="range" min="0" max="1" step="0.05" class="w-full" />
            <span class="p-inputgroup-addon">1</span>
          </div>
          <small class="block mt-1 text-color-secondary">Controls diversity via nucleus sampling</small>
        </div>
      </div>

      <div v-if="successMessage" class="my-3 p-3 bg-green-100 text-green-800 border-round">
        {{ successMessage }}
      </div>

      <div v-if="settingsStore.error" class="my-3 p-3 bg-red-100 text-red-800 border-round">
        {{ settingsStore.error }}
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" text @click="closeDialog" />
      <Button label="Save" icon="pi pi-check" @click="saveSettings" :loading="saving" />
    </template>
  </Dialog>
</template>

<style scoped>
/* Custom styles for the settings dialog */
</style>
