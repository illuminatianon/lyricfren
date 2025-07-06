<script setup>
import { computed, ref, watch } from 'vue';
import { useSettingsStore } from '../stores/settings';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
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

// Dialog visibility computed property
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// Ensure numeric values are properly handled
const handleTemperatureChange = (value) => {
  temperature.value = parseFloat(value);
};

const handleMaxTokensChange = (value) => {
  maxTokens.value = parseInt(value);
};

const handleTopPChange = (value) => {
  topP.value = parseFloat(value);
};

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
      temperature: Number(temperature.value),
      maxTokens: Number(maxTokens.value),
      topP: Number(topP.value),
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

// Watch for dialog visibility changes to load settings
watch(() => props.visible, (newValue) => {
  if (newValue) {
    onDialogShow();
  }
});
</script>

<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="500px"
    @update:model-value="(val) => emit('update:visible', val)"
  >
    <v-card>
      <v-card-title>Settings</v-card-title>

      <v-card-text>
        <div class="mb-6">
          <h3 class="text-h6 mb-3">API Keys</h3>

          <v-text-field
            id="openai-key"
            v-model="openaiKey"
            label="OpenAI API Key"
            placeholder="sk-..."
            type="password"
            variant="outlined"
            :hint="`Current: ${maskedOpenaiKey || 'Not set'}`"
            persistent-hint
            class="mb-3"
          />
        </div>

        <v-divider class="mb-6" />

        <div class="mb-4">
          <h3 class="text-h6 mb-3">Model Parameters</h3>

          <v-select
            id="model"
            v-model="model"
            :items="['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']"
            label="Model"
            variant="outlined"
            class="mb-3"
          />

          <div class="mb-3">
            <label class="text-subtitle-2 mb-2 d-block">Temperature</label>
            <div class="d-flex align-center ga-3">
              <v-slider
                v-model="temperature"
                :min="0"
                :max="2"
                :step="0.1"
                class="flex-grow-1"
                @update:model-value="handleTemperatureChange"
              />
              <v-text-field
                v-model="temperature"
                type="number"
                :min="0"
                :max="2"
                :step="0.1"
                variant="outlined"
                density="compact"
                style="width: 80px"
                @update:model-value="handleTemperatureChange"
              />
            </div>
            <div class="text-caption text-medium-emphasis">
              Controls randomness (0 = deterministic, 2 = maximum creativity)
            </div>
          </div>

          <div class="mb-3">
            <label class="text-subtitle-2 mb-2 d-block">Max Tokens</label>
            <div class="d-flex align-center ga-3">
              <v-slider
                v-model="maxTokens"
                :min="1"
                :max="4096"
                :step="1"
                class="flex-grow-1"
                @update:model-value="handleMaxTokensChange"
              />
              <v-text-field
                v-model="maxTokens"
                type="number"
                :min="1"
                :max="4096"
                :step="1"
                variant="outlined"
                density="compact"
                style="width: 100px"
                @update:model-value="handleMaxTokensChange"
              />
            </div>
            <div class="text-caption text-medium-emphasis">
              Maximum length of generated text
            </div>
          </div>

          <div class="mb-3">
            <label class="text-subtitle-2 mb-2 d-block">Top P</label>
            <div class="d-flex align-center ga-3">
              <v-slider
                v-model="topP"
                :min="0"
                :max="1"
                :step="0.05"
                class="flex-grow-1"
                @update:model-value="handleTopPChange"
              />
              <v-text-field
                v-model="topP"
                type="number"
                :min="0"
                :max="1"
                :step="0.05"
                variant="outlined"
                density="compact"
                style="width: 80px"
                @update:model-value="handleTopPChange"
              />
            </div>
            <div class="text-caption text-medium-emphasis">
              Controls diversity via nucleus sampling
            </div>
          </div>
        </div>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-3"
        >
          {{ successMessage }}
        </v-alert>

        <v-alert
          v-if="settingsStore.error"
          type="error"
          variant="tonal"
          class="mb-3"
        >
          {{ settingsStore.error }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          @click="saveSettings"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Custom styles for the settings dialog */
</style>
