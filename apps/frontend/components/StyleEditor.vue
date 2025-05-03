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
    <h3 class="text-xl font-bold mb-4 text-primary">Style Editor</h3>

    <div v-if="loading" class="text-center py-4">
      <p>Loading...</p>
    </div>

    <div v-else>
      <div class="mb-4 flex align-items-center gap-2">
        <Dropdown
          v-model="selectedStyle"
          :options="styles"
          optionLabel="name"
          optionValue="id"
          placeholder="Select a style"
          class="w-full"
          @change="handleStyleChange"
        />
        <Button icon="pi pi-plus" @click="createNewStyle" />
        <Button icon="pi pi-trash" severity="danger" @click="deleteStyle" />
      </div>

      <div class="mb-4">
        <label class="block mb-2 text-sm font-medium">System Prompt</label>
        <Textarea
          v-model="systemPrompt"
          rows="8"
          class="w-full"
          placeholder="Enter system prompt..."
        />
      </div>

      <div class="flex justify-content-between align-items-center">
        <p v-if="message" class="text-sm" :class="message.includes('Failed') ? 'text-red' : 'text-green'">
          {{ message }}
        </p>
        <Button @click="saveStyle" label="Save Prompt" icon="pi pi-save" />
      </div>
    </div>
  </div>
</template>
