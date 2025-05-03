<script setup>
import { ref, onMounted } from 'vue';
import { OpenAI } from 'openai';

const userPrompt = ref('');
const loading = ref(false);
const styles = ref([]);
const selectedStyle = ref(null);
const apiKey = ref('');
const error = ref('');

// Event to emit the generated result
const emit = defineEmits(['result']);

// Fetch styles from the API
const fetchStyles = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/mvp/styles');
    const data = await response.json();
    styles.value = data;
    if (data.length > 0) {
      selectedStyle.value = data[0].id;
    }
  } catch (err) {
    console.error('Error fetching styles:', err);
    error.value = 'Failed to load styles';
  }
};

// Fetch API key from config
const fetchConfig = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/config');
    const data = await response.json();
    apiKey.value = data.openaiApiKey || '';
  } catch (err) {
    console.error('Error fetching config:', err);
  }
};

// Generate lyrics using OpenAI API
const generateLyrics = async () => {
  if (!userPrompt.value) {
    error.value = 'Please enter a prompt';
    return;
  }
  
  if (!selectedStyle.value) {
    error.value = 'Please select a style';
    return;
  }
  
  if (!apiKey.value || apiKey.value.includes('...')) {
    error.value = 'Please set your OpenAI API key in the settings';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    // Get the selected style's system prompt
    const style = styles.value.find(s => s.id === selectedStyle.value);
    if (!style) {
      throw new Error('Selected style not found');
    }
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey.value,
      dangerouslyAllowBrowser: true // For demo purposes only
    });
    
    // Call the API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: style.systemPrompt },
        { role: 'user', content: userPrompt.value }
      ],
      temperature: 0.7,
      max_tokens: 512
    });
    
    // Emit the result
    if (response.choices && response.choices.length > 0) {
      emit('result', response.choices[0].message.content);
    } else {
      throw new Error('No response from API');
    }
  } catch (err) {
    console.error('Error generating lyrics:', err);
    error.value = err.message || 'Failed to generate lyrics';
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  fetchStyles();
  fetchConfig();
});
</script>

<template>
  <div class="prompt-composer p-4 bg-slate-800 rounded-lg shadow-lg">
    <h2 class="text-xl font-bold mb-4">Prompt Composer</h2>
    
    <div class="mb-4">
      <label for="style-select" class="block mb-2">Select Style</label>
      <select 
        id="style-select" 
        v-model="selectedStyle"
        class="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:ring focus:ring-blue-200"
      >
        <option v-for="style in styles" :key="style.id" :value="style.id">
          {{ style.name }}
        </option>
      </select>
    </div>
    
    <div class="mb-4">
      <label for="user-prompt" class="block mb-2">Your Prompt</label>
      <textarea 
        id="user-prompt" 
        v-model="userPrompt" 
        rows="6"
        class="w-full p-2 bg-slate-700 rounded border border-slate-600 focus:border-blue-500 focus:ring focus:ring-blue-200"
        placeholder="Enter your prompt here..."
      ></textarea>
    </div>
    
    <div class="flex justify-between items-center">
      <button 
        @click="generateLyrics" 
        class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
        :disabled="loading"
      >
        <span v-if="loading">
          <i class="pi pi-spin pi-spinner mr-2"></i>Generating...
        </span>
        <span v-else>Generate</span>
      </button>
      
      <span v-if="error" class="text-sm text-red-400">
        {{ error }}
      </span>
    </div>
  </div>
</template>
