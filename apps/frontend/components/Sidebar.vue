<script setup>
	const props = defineProps({
		sidebarVisible: Boolean,
	});

	const emit = defineEmits(['toggle-sidebar']);
	const toggleSidebar = () => {
		emit('toggle-sidebar');
	};

	const menuItems = [
		{ label: 'Home', icon: 'pi pi-home', to: '/' },
		{ label: 'Settings', icon: 'pi pi-cog', to: '/settings' },
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
	</aside>
</template>
