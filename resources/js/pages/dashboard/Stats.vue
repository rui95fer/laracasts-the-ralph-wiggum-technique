<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { dashboard } from '@/routes';
import { stats } from '@/routes/dashboard';

defineProps<{
    totalUsers: number;
}>();

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: dashboard(),
            },
            {
                title: 'Stats',
                href: stats.url(),
            },
        ],
    },
});
</script>

<template>
    <Head title="Dashboard Stats" />

    <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
            <div
                class="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-center"
            >
                <div class="text-center">
                    <p class="text-sm text-muted-foreground">Total Users</p>
                    <p class="text-4xl font-bold">{{ totalUsers }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
