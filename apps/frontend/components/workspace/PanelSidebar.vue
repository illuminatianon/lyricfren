<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  panel: {
    type: Object,
    required: true
  },
  config: {
    type: Object,
    default: () => ({ standard: [], custom: [] })
  }
});

const emit = defineEmits([
  'close',
  'data-change'
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
    ExampleLibraryWidget: 'Example Library'
  }[componentConfig.component] || 'Unknown Widget';
};
</script>

<template>
  <div 
    class="panel-sidebar surface-ground border-left-1 border-surface"
    :style="{ width: `${sidebarWidth}px` }"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header flex align-items-center justify-content-between px-3 py-2 border-bottom-1 border-surface">
      <h4 class="text-base font-medium m-0">Panel Tools</h4>
      <Button
        icon="pi pi-times"
        size="small"
        text
        @click="handleClose"
        v-tooltip="'Close sidebar'"
      />
    </div>
    
    <!-- Sidebar Content -->
    <div class="sidebar-content p-3 overflow-y-auto">
      <!-- Component Placeholders -->
      <div 
        v-for="componentConfig in allComponents"
        :key="componentConfig.component"
        class="sidebar-widget mb-4"
      >
        <Card>
          <template #header>
            <div class="px-3 py-2">
              <h5 class="text-sm font-medium m-0">{{ renderComponent(componentConfig) }}</h5>
            </div>
          </template>
          
          <template #content>
            <div class="px-3 pb-3">
              <!-- Metadata Widget Placeholder -->
              <div v-if="componentConfig.component === 'MetadataWidget'" class="flex flex-column gap-3">
                <div class="field">
                  <label class="block text-sm font-medium mb-1">Title</label>
                  <InputText 
                    :model-value="panel.data.metadata.title"
                    @update:model-value="handleDataChange('metadata.title', $event)"
                    class="w-full"
                    size="small"
                  />
                </div>
                <div class="field">
                  <label class="block text-sm font-medium mb-1">Description</label>
                  <Textarea 
                    :model-value="panel.data.metadata.description"
                    @update:model-value="handleDataChange('metadata.description', $event)"
                    class="w-full"
                    rows="3"
                    size="small"
                  />
                </div>
                <div class="field">
                  <small class="text-color-secondary">
                    Created: {{ new Date(panel.data.metadata.created).toLocaleDateString() }}
                  </small>
                </div>
              </div>
              
              <!-- Tags Widget Placeholder -->
              <div v-else-if="componentConfig.component === 'TagsWidget'" class="flex flex-column gap-2">
                <div class="field">
                  <label class="block text-sm font-medium mb-1">Tags</label>
                  <div class="flex flex-wrap gap-1 mb-2">
                    <Chip 
                      v-for="tag in panel.data.tags" 
                      :key="tag"
                      :label="tag"
                      removable
                      @remove="handleDataChange('tags', panel.data.tags.filter(t => t !== tag))"
                    />
                  </div>
                  <InputText 
                    placeholder="Add tag..."
                    class="w-full"
                    size="small"
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
              <div v-else class="text-center py-4">
                <i class="pi pi-cog text-2xl text-color-secondary mb-2"></i>
                <p class="text-sm text-color-secondary m-0">
                  {{ renderComponent(componentConfig) }} widget not yet implemented
                </p>
              </div>
            </div>
          </template>
        </Card>
      </div>
      
      <!-- Empty State -->
      <div v-if="allComponents.length === 0" class="text-center py-6">
        <i class="pi pi-inbox text-3xl text-color-secondary mb-3"></i>
        <p class="text-color-secondary m-0">No sidebar tools configured</p>
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
}

.sidebar-header {
  height: 48px;
  background: var(--surface-section);
  flex-shrink: 0;
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
