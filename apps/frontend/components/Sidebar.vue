<script setup>
import { ref } from 'vue';
import SettingsDialog from './SettingsDialog.vue';

const props = defineProps({
	sidebarVisible: Boolean,
});

const emit = defineEmits(['toggle-sidebar']);
const settingsDialogVisible = ref(false);

const toggleSidebar = () => {
	emit('toggle-sidebar');
};

const openSettings = () => {
	settingsDialogVisible.value = true;
	// Close sidebar on mobile after clicking a menu item
	if (window.innerWidth < 768) {
		emit('toggle-sidebar');
	}
};

const menuItems = [
	{
		label: 'Home',
		icon: 'pi pi-home',
		command: () => {
			// Close sidebar on mobile after clicking a menu item
			if (window.innerWidth < 768) {
				emit('toggle-sidebar');
			}
		}
	},
];
</script>

<template>
	<aside
		class="app-sidebar shadow-2 transition-all transition-duration-300 fixed md:static top-0 bottom-0 left-0 z-1 h-full md:h-auto"
		:class="{ '-translate-x-100 md:translate-x-0': !sidebarVisible, 'translate-x-0': sidebarVisible }">
		<div class="flex justify-content-end md:hidden">
			<Button icon="pi pi-times" text @click="toggleSidebar" />
		</div>
		<Menu :model="menuItems" class="w-full" />

		<!-- Settings Dialog -->
		<SettingsDialog v-model:visible="settingsDialogVisible" />
	</aside>
</template>
