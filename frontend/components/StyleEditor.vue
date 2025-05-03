<script setup>
import { ref, onMounted } from 'vue';

const styles = ref([]);
const selectedStyle = ref(null);
const systemPrompt = ref('');
const loading = ref(false);
const message = ref('');

// Fetch styles from the API
const fetchStyles = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://localhost:3000/api/mvp/styles');
    const data = await response.json();
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
const handleStyleChange = () => {
  const style = styles.value.find(s => s.id === selectedStyle.value);
  if (style) {
    systemPrompt.value = style.systemPrompt;
  }
};

// Save the current style
const saveStyle = async () => {
  if (!selectedStyle.value) return;
  
  loading.value = true;
  message.value = '';
  
  try {
    const style = styles.value.find(s => s.id === selectedStyle.value);
    const response = await fetch(`http://localhost:3000/api/mvp/styles/${selectedStyle.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: style.name,
        systemPrompt: systemPrompt.value
      })
    });
    
    if (response.ok) {
      message.value = 'Style saved successfully';
      // Refresh styles
      await fetchStyles();
    } else {
      const error = await response.json();
      message.value = error.error || 'Failed to save style';
    }
  } catch (error) {
    console.error('Error saving style:', error);
    message.value = 'Failed to save style';
  } finally {
    loading.value = false;
  }
};

// Load styles on component mount
onMounted(fetchStyles);
</script>

<template>
  <div class="style-editor p-4 bg-slate-800 rounded-lg shadow-lg">
    <h2 class="text-xl font-bold mb-4">Style Editor</h2>
    
    <div v-if="loading" class="text-center py-4">
      <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>
    
    <div v-else>
      <div class="mb-4">
        <label for="style-select" class="block mb-2">Select Style</label>
        <select 
          id="style-select" 
          v-model="selectedStyle" 
          @change="handleStyleChange"
          class="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:ring focus:ring-blue-200"
        >
          <option v-for="style in styles" :key="style.id" :value="style.id">
            {{ style.name }}
          </option>
        </select>
      </div>
      
      <div class="mb-4">
        <label for="system-prompt" class="block mb-2">System Prompt</label>
        <textarea 
          id="system-prompt" 
          v-model="systemPrompt" 
          rows="8"
          class="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:ring focus:ring-blue-200"
          placeholder="Enter system prompt..."
        ></textarea>
      </div>
      
      <div class="flex justify-between items-center">
        <button 
          @click="saveStyle" 
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          :disabled="loading"
        >
          Save Prompt
        </button>
        
        <span v-if="message" class="text-sm" :class="message.includes('success') ? 'text-green-400' : 'text-red-400'">
          {{ message }}
        </span>
      </div>
    </div>
  </div>
</template>
