<script setup>
import { onMounted, ref } from 'vue';
// import { OpenAI } from 'openai';
import api from '../services/api.js';

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
    const data = await api.get('/styles');
    styles.value = data;
    if (data.length > 0) {
      selectedStyle.value = data[ 0 ].id;
    }
  } catch (err) {
    console.error('Error fetching styles:', err);
    error.value = 'Failed to load styles';
  }
};

// Fetch API key from config
const fetchConfig = async () => {
  try {
    const data = await api.get('/config');
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

  // try {
  //   // Get the selected style's system prompt
  //   const style = styles.value.find(s => s.id === selectedStyle.value);
  //   if (!style) {
  //     throw new Error('Selected style not found');
  //   }
  //
  //   // Initialize OpenAI client
  //   const openai = new OpenAI({
  //     apiKey: apiKey.value,
  //     dangerouslyAllowBrowser: true // For demo purposes only
  //   });
  //
  //   // Call the API
  //   const response = await openai.chat.completions.create({
  //     model: 'gpt-4',
  //     messages: [
  //       { role: 'system', content: style.systemPrompt },
  //       { role: 'user', content: userPrompt.value }
  //     ],
  //     temperature: 0.7,
  //     max_tokens: 512
  //   });
  //
  //   // Emit the result
  //   if (response.choices && response.choices.length > 0) {
  //     emit('result', response.choices[0].message.content);
  //   } else {
  //     throw new Error('No response from API');
  //   }
  // } catch (err) {
  //   console.error('Error generating lyrics:', err);
  //   error.value = err.message || 'Failed to generate lyrics';
  // } finally {
  //   loading.value = false;
  // }
};

// Load data on component mount
onMounted(() => {
  fetchStyles();
  fetchConfig();
});
</script>

<template>
  <div>
    <h2 class="text-h5 font-weight-bold mb-4 text-primary">Prompt Composer</h2>

    <div class="mb-4">
      <v-select
        v-model="selectedStyle"
        :items="styles"
        item-title="name"
        item-value="id"
        label="Select Style"
        variant="outlined"
      />
    </div>

    <div class="mb-4">
      <v-textarea
        v-model="userPrompt"
        label="Your Prompt"
        rows="6"
        variant="outlined"
        placeholder="Enter your prompt here..."
      />
    </div>

    <div class="d-flex justify-space-between align-center">
      <v-btn
        @click="generateLyrics"
        prepend-icon="mdi-play"
        color="primary"
        :loading="loading"
      >
        Generate
      </v-btn>

      <v-alert
        v-if="error"
        type="error"
        variant="text"
        density="compact"
      >
        {{ error }}
      </v-alert>
    </div>
  </div>
</template>
