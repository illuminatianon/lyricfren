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
  <v-container>
    <v-row>
      <v-col cols="12" md="6" lg="4">
        <!-- Style Editor -->
        <v-card class="h-100">
          <v-card-text>
            <StyleEditor />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <!-- Prompt Composer -->
        <v-card class="h-100">
          <v-card-text>
            <PromptComposer @result="handleResult" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="4">
        <!-- Result Display -->
        <v-card class="h-100">
          <v-card-text>
            <ResultDisplay :result="generatedResult" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
