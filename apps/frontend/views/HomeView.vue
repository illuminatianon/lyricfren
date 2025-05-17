<script setup>
import { ref } from 'vue';
import SettingsDialog from '../components/SettingsDialog.vue';

const settingsDialogVisible = ref(false);

const openSettings = () => {
  settingsDialogVisible.value = true;
};
</script>

<template>
  <div class="container mx-auto">
    <div class="grid">
      <div class="col-12 md:col-8 lg:col-6 mx-auto">
        <Card>
          <template #title>
            Get Started
          </template>
          <template #content>
            <p class="mb-4">
              LyricFren helps you create amazing lyrics for your music using AI.
            </p>
            <div class="flex justify-content-center">
              <router-link to="/prompt">
                <Button label="Create Lyrics" icon="pi pi-pencil" class="mr-2" />
              </router-link>
              <Button label="Settings" icon="pi pi-cog" severity="secondary" @click="openSettings" />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>

  <!-- Settings Dialog -->
  <SettingsDialog v-model:visible="settingsDialogVisible" />
</template>
