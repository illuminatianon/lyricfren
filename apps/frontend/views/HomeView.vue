<script setup>
// Home view component
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
              <router-link to="/settings">
                <Button label="Settings" icon="pi pi-cog" severity="secondary" />
              </router-link>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>
