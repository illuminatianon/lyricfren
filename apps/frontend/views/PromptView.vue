<script setup>
import { ref } from 'vue';
import StyleEditor from "../components/StyleEditor.vue";
import PromptComposer from "../components/PromptComposer.vue";
import ResultDisplay from "../components/ResultDisplay.vue";

const generatedResult = ref('');

const handleResult = (result) => {
  generatedResult.value = result;
};
</script>

<template>
  <div class="container mx-auto">
    <div class="mb-5 text-center md:text-left">
      <h2 class="text-3xl font-bold mb-2 text-primary">LyricFren - Style Prompting</h2>
      <p class="text-lg text-color-secondary">Your friendly Suno companion</p>
    </div>

    <div class="grid">
      <div class="col-12 md:col-6 lg:col-4 p-2">
        <!-- Style Editor -->
        <Card class="h-full">
          <template #content>
            <StyleEditor />
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-4 p-2">
        <!-- Prompt Composer -->
        <Card class="h-full">
          <template #content>
            <PromptComposer @result="handleResult" />
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-6 lg:col-4 p-2">
        <!-- Result Display -->
        <Card class="h-full">
          <template #content>
            <ResultDisplay :result="generatedResult" />
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
