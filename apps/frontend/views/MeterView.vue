<script setup>
import { ref, onMounted } from 'vue';

</script>

<template>
  <div class="container mx-auto">
    <div class="grid">
        <Card class="col-6 md:col-6 lg:col-4 p-2">
          <template #title>
            Lyrics
          </template>
          <template #content>
          </template>
        </Card>
        <Card class="col-6 md:col-6 lg:col-4 p-2">
          <template #title>
            Analysis
          </template>
          <template #content>
          </template>
        </Card>
    </div>
  </div>
</template>
