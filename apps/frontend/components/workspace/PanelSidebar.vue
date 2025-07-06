<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  panel: {
    type: Object,
    required: true,
  },
  config: {
    type: Object,
    default: () => ({ standard: [], custom: [] }),
  },
});

const emit = defineEmits([
  'close',
  'data-change',
]);

// Component state
const sidebarWidth = ref(300);

// Computed properties
const allComponents = computed(() => {
  const components = [...props.config.standard, ...props.config.custom];
  return components.sort((a, b) => a.order - b.order);
});

// Action handlers
const handleClose = () => {
  emit('close');
};

const handleDataChange = (path, value) => {
  emit('data-change', path, value);
};

// Placeholder component renderer
const renderComponent = (componentConfig) => {
  // For now, return placeholder content
  // This will be replaced with actual sidebar widgets
  return {
    MetadataWidget: 'Metadata Editor',
    TagsWidget: 'Tags Manager',
    ExportWidget: 'Export Options',
    HistoryWidget: 'Version History',
    MeterSettingsWidget: 'Meter Settings',
    LLMAssistantWidget: 'LLM Assistant',
    StyleSelectorWidget: 'Style Selector',
    TemplateLibraryWidget: 'Template Library',
    GenerationSettingsWidget: 'Generation Settings',
    StyleTestingWidget: 'Style Testing',
    ExampleLibraryWidget: 'Example Library',
  }[ componentConfig.component ] || 'Unknown Widget';
};
</script>

<template>
  <div
    class="panel-sidebar surface-ground border-left-1 border-surface"
    :style="{ width: `${sidebarWidth}px` }"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header d-flex align-center justify-space-between px-3 py-2 border-b">
      <h4 class="text-h6 font-weight-medium ma-0">Panel Tools</h4>
      <v-btn
        icon="mdi-close"
        size="small"
        variant="text"
        @click="handleClose"
      >
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          Close sidebar
        </v-tooltip>
      </v-btn>
    </div>

    <!-- Sidebar Content -->
    <div class="sidebar-content pa-3 overflow-y-auto">
      <!-- Component Placeholders -->
      <div
        v-for="componentConfig in allComponents"
        :key="componentConfig.component"
        class="sidebar-widget mb-4"
      >
        <v-card>
          <v-card-title class="px-3 py-2">
            <h5 class="text-subtitle-2 font-weight-medium ma-0">{{ renderComponent(componentConfig) }}</h5>
          </v-card-title>

          <v-card-text class="px-3 pb-3">
            <!-- Metadata Widget Placeholder -->
            <div
              v-if="componentConfig.component === 'MetadataWidget'"
              class="d-flex flex-column ga-3"
            >
              <v-text-field
                label="Title"
                :model-value="panel.data.metadata.title"
                @update:model-value="handleDataChange('metadata.title', $event)"
                variant="outlined"
                density="compact"
              />
              <v-textarea
                label="Description"
                :model-value="panel.data.metadata.description"
                @update:model-value="handleDataChange('metadata.description', $event)"
                variant="outlined"
                density="compact"
                rows="3"
              />
              <div class="text-caption text-medium-emphasis">
                Created: {{ new Date(panel.data.metadata.created).toLocaleDateString() }}
              </div>
            </div>

            <!-- Tags Widget Placeholder -->
            <div
              v-else-if="componentConfig.component === 'TagsWidget'"
              class="d-flex flex-column ga-2"
            >
              <div>
                <label class="text-subtitle-2 font-weight-medium mb-1 d-block">Tags</label>
                <div class="d-flex flex-wrap ga-1 mb-2">
                  <v-chip
                    v-for="tag in panel.data.tags"
                    :key="tag"
                    :text="tag"
                    closable
                    size="small"
                    @click:close="handleDataChange('tags', panel.data.tags.filter(t => t !== tag))"
                  />
                </div>
                <v-text-field
                  placeholder="Add tag..."
                  variant="outlined"
                  density="compact"
                  @keyup.enter="(e) => {
                      if (e.target.value.trim()) {
                        handleDataChange('tags', [...panel.data.tags, e.target.value.trim()]);
                        e.target.value = '';
                      }
                    }"
                />
              </div>
            </div>

            <!-- Generic Placeholder for other widgets -->
            <div
              v-else
              class="text-center py-4"
            >
              <v-icon
                icon="mdi-cog"
                size="32"
                color="medium-emphasis"
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis ma-0">
                {{ renderComponent(componentConfig) }} widget not yet implemented
              </p>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Empty State -->
      <div
        v-if="allComponents.length === 0"
        class="text-center py-6"
      >
        <v-icon
          icon="mdi-inbox"
          size="48"
          color="medium-emphasis"
          class="mb-3"
        />
        <p class="text-medium-emphasis ma-0">No sidebar tools configured</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-sidebar {
  height: 100%;
  min-width: 250px;
  max-width: 500px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface-50);
}

.sidebar-header {
  height: 48px;
  background: var(--surface-100);
  flex-shrink: 0;
  border-bottom: 1px solid var(--surface-200);
}

.sidebar-content {
  flex: 1;
  min-height: 0;
}

.sidebar-widget {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-widget :deep(.p-card) {
  box-shadow: none;
  border: 1px solid var(--surface-border);
}

.sidebar-widget :deep(.p-card-header) {
  background: var(--surface-section);
  border-bottom: 1px solid var(--surface-border);
}

.sidebar-widget :deep(.p-card-content) {
  padding: 0;
}

.field {
  margin-bottom: 0;
}

.field label {
  color: var(--text-color);
}
</style>
