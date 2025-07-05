<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api.js';

const styles = ref([]);
const selectedStyle = ref(null);
const systemPrompt = ref('');
const loading = ref(false);
const message = ref('');

// Fetch styles from the API
const fetchStyles = async () => {
  loading.value = true;
  try {
    const data = await api.get('/styles');
    styles.value = data;
    if (data.length > 0) {
      selectedStyle.value = data[0].id;
      systemPrompt.value = data[0].systemPrompt;
    }
  } catch (error) {
    console.error('Error fetching styles:', error);
    message.value = 'Failed to load styles';
  } finally {
    loading.value = false;
  }
};

// Handle style selection change
const handleStyleChange = (e) => {
  const style = styles.value.find(s => s.id === e.value);
  if (style) {
    systemPrompt.value = style.systemPrompt;
  }
};

// Save the current style
const saveStyle = async () => {
  if (!selectedStyle.value || !systemPrompt.value) {
    message.value = 'Please select a style and enter a system prompt';
    return;
  }

  loading.value = true;
  try {
    const style = styles.value.find(s => s.id === selectedStyle.value);

    await api.put(`/styles/${selectedStyle.value}`, {
      name: style.name,
      systemPrompt: systemPrompt.value
    });

    message.value = 'Style saved successfully';
    await fetchStyles(); // Refresh styles
  } catch (error) {
    console.error('Error saving style:', error);
    message.value = 'Failed to save style';
  } finally {
    loading.value = false;
  }
};

// Create a new style
const createNewStyle = async () => {
  const name = prompt('Enter a name for the new style:');
  if (!name) return;

  loading.value = true;
  try {
    await api.post('/styles', {
      name,
      systemPrompt: 'You are a helpful assistant that writes song lyrics.'
    });

    message.value = 'New style created';
    await fetchStyles(); // Refresh styles
  } catch (error) {
    console.error('Error creating style:', error);
    message.value = 'Failed to create style';
  } finally {
    loading.value = false;
  }
};

// Delete the current style
const deleteStyle = async () => {
  if (!selectedStyle.value) {
    message.value = 'Please select a style to delete';
    return;
  }

  if (!confirm('Are you sure you want to delete this style?')) {
    return;
  }

  loading.value = true;
  try {
    await api.delete(`/styles/${selectedStyle.value}`);

    message.value = 'Style deleted successfully';
    await fetchStyles(); // Refresh styles
  } catch (error) {
    console.error('Error deleting style:', error);
    message.value = 'Failed to delete style';
  } finally {
    loading.value = false;
  }
};

// Load styles on component mount
onMounted(() => {
  fetchStyles();
});
</script>

<template>
  <div>
    <h3 class="text-h5 font-weight-bold mb-4 text-primary">Style Editor</h3>

    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate />
      <p class="mt-2">Loading...</p>
    </div>

    <div v-else>
      <div class="mb-4 d-flex align-center ga-2">
        <v-select
          v-model="selectedStyle"
          :items="styles"
          item-title="name"
          item-value="id"
          label="Select a style"
          variant="outlined"
          class="flex-grow-1"
          @update:model-value="handleStyleChange"
        />
        <v-btn icon="mdi-plus" @click="createNewStyle" />
        <v-btn icon="mdi-delete" color="error" @click="deleteStyle" />
      </div>

      <div class="mb-4">
        <v-textarea
          v-model="systemPrompt"
          label="System Prompt"
          rows="8"
          variant="outlined"
          placeholder="Enter system prompt..."
        />
      </div>

      <div class="d-flex justify-space-between align-center">
        <v-alert
          v-if="message"
          :type="message.includes('Failed') ? 'error' : 'success'"
          variant="text"
          density="compact"
        >
          {{ message }}
        </v-alert>
        <v-btn
          @click="saveStyle"
          prepend-icon="mdi-content-save"
          color="primary"
        >
          Save Prompt
        </v-btn>
      </div>
    </div>
  </div>
</template>
