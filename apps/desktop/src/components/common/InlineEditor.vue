<script setup>
import { ref, nextTick, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Enter text...',
  },
  maxLength: {
    type: Number,
    default: 100,
  },
  variant: {
    type: String,
    default: 'outlined',
  },
  density: {
    type: String,
    default: 'compact',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'save',
  'cancel',
  'edit-start',
  'edit-end',
]);

// Component state
const isEditing = ref(false);
const editValue = ref('');
const inputRef = ref(null);

// Start editing
const startEdit = async () => {
  if (props.disabled || props.readonly) return;
  
  isEditing.value = true;
  editValue.value = props.modelValue;
  emit('edit-start');
  
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
    inputRef.value.select();
  }
};

// Save changes
const saveEdit = () => {
  const trimmedValue = editValue.value.trim();
  
  if (trimmedValue && trimmedValue !== props.modelValue) {
    emit('update:modelValue', trimmedValue);
    emit('save', trimmedValue);
  }
  
  cancelEdit();
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
  editValue.value = '';
  emit('edit-end');
  emit('cancel');
};

// Handle keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    saveEdit();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelEdit();
  }
};

// Handle input blur (save on focus loss)
const handleBlur = () => {
  // Small delay to allow button clicks to register
  setTimeout(() => {
    if (isEditing.value) {
      saveEdit();
    }
  }, 150);
};

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (!isEditing.value) {
    editValue.value = newValue;
  }
});
</script>

<template>
  <div class="inline-editor d-flex align-center">
    <!-- Display Mode -->
    <div
      v-if="!isEditing"
      class="inline-editor-display d-flex align-center flex-grow-1"
      :class="{ 
        'cursor-pointer': !disabled && !readonly,
        'text-medium-emphasis': !modelValue
      }"
      @click="startEdit"
    >
      <span class="text-truncate">
        {{ modelValue || placeholder }}
      </span>
    </div>

    <!-- Edit Mode -->
    <div
      v-else
      class="inline-editor-edit d-flex align-center ga-2 flex-grow-1"
    >
      <v-text-field
        ref="inputRef"
        v-model="editValue"
        :placeholder="placeholder"
        :maxlength="maxLength"
        :variant="variant"
        :density="density"
        hide-details
        class="flex-grow-1"
        @keydown="handleKeydown"
        @blur="handleBlur"
      />
      
      <!-- Action Buttons -->
      <div class="d-flex align-center ga-1">
        <v-btn
          size="x-small"
          variant="text"
          color="success"
          icon="mdi-check"
          @click="saveEdit"
        >
          <v-tooltip activator="parent" location="bottom">
            Save (Enter)
          </v-tooltip>
        </v-btn>
        
        <v-btn
          size="x-small"
          variant="text"
          color="error"
          icon="mdi-close"
          @click="cancelEdit"
        >
          <v-tooltip activator="parent" location="bottom">
            Cancel (Esc)
          </v-tooltip>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inline-editor-display {
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.inline-editor-display.cursor-pointer:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.inline-editor-edit {
  min-height: 32px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
