<script setup>
import { onMounted, ref } from 'vue';
import { useSettingsStore } from '../stores/settings';

const settingsStore = useSettingsStore();
const message = ref('');

onMounted(() => {
  settingsStore.fetchConfig();
});

const saveSettings = async () => {
  try {
    await settingsStore.saveConfig();
    message.value = 'Settings saved successfully';
    setTimeout(() => {
      message.value = '';
    }, 3000);
  } catch (error) {
    message.value = 'Error saving settings';
  }
};
</script>

<template>
  <div class="container mx-auto">
    <div class="grid">
      <div class="col-12 md:col-8 lg:col-6 mx-auto">
        <Card>
          <template #content>
            <form @submit.prevent="saveSettings">
              <div class="mb-4">
                <label
                  for="openai-key"
                  class="block mb-2"
                >OpenAI API Key</label>
                <InputText
                  id="openai-key"
                  v-model="settingsStore.openaiApiKey"
                  type="password"
                  class="w-full"
                  placeholder="Enter your OpenAI API key"
                />
              </div>

              <div class="mb-4">
                <label
                  for="suno-key"
                  class="block mb-2"
                >Suno API Key (Optional)</label>
                <InputText
                  id="suno-key"
                  v-model="settingsStore.sunoApiKey"
                  type="password"
                  class="w-full"
                  placeholder="Enter your Suno API key"
                />
              </div>

              <div class="flex justify-content-between align-items-center">
                <Button
                  type="submit"
                  label="Save Settings"
                  icon="pi pi-save"
                />
                <span
                  v-if="message"
                  class="text-sm"
                  :class="{ 'text-green-500': message.includes('success'), 'text-red-500': message.includes('Error') }"
                >
                  {{ message }}
                </span>
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
