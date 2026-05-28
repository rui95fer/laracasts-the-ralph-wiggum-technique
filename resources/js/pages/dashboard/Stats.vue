<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { dashboard } from '@/routes';
import { stats } from '@/routes/dashboard';
import { ref } from 'vue';

defineProps<{
    totalUsers: number;
    lastRefreshed: string;
}>();

const copied = ref(false);

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    });
}

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
                    <button
                        @click="copyToClipboard(String(totalUsers))"
                        class="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        {{ copied ? 'Copied!' : 'Copy to clipboard' }}
                    </button>
                </div>
            </div>
        </div>

        <p class="text-sm text-muted-foreground">Last refreshed: {{ lastRefreshed }}</p>
    </div>
</template>
