<script setup lang="ts">
import {PropType} from "vue";
import {HostData} from "@/components/types";
import {getBoolColor} from '@/components/utils'

const props = defineProps({
  hostData: {
    type: Object as PropType<HostData>,
    required: true,
  },
  bestCloudflareIPs: {
      type: Array as PropType<string[]>,
      required: true
  }
})

const emit = defineEmits<{
  (e: 'editHost', domain: string): void
  (e: 'deleteHost', domain: string): void
}>()
</script>

<template>
  <v-card rounded="lg" elevation="2" class="host-card h-100 transition-swing">
    <div class="d-flex justify-space-between align-center px-4 pt-3">
      <div class="d-flex align-center text-truncate">
        <span class="font-weight-bold text-truncate" :title="hostData.domain">{{ hostData.domain }}</span>
      </div>
    </div>

    <v-card-text class="pt-2 pb-4">
      <v-row no-gutters class="mb-2 align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">类型</v-col>
        <v-col cols="9">
           <v-chip :color="getBoolColor(hostData.using_cloudflare)" size="x-small" label variant="tonal" class="font-weight-medium">
                {{ hostData.using_cloudflare ? 'Cloudflare' : 'hosts' }}
          </v-chip>
        </v-col>
      </v-row>

      <v-row no-gutters class="align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">IP</v-col>
        <v-col cols="9">
          <div class="d-flex flex-wrap gap-1">
             <v-chip
                v-for="ip in (hostData.using_cloudflare ? bestCloudflareIPs : hostData.value)"
                :key="ip"
                size="x-small"
                class="mr-1 mb-1"
                variant="outlined"
            >
              {{ ip }}
            </v-chip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-icon
          :color="hostData.meta.disabled ? 'grey' : 'success'"
      >
        {{ hostData.meta.disabled ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
      </v-icon>
      <v-spacer></v-spacer>
      <v-menu min-width="140">
        <template v-slot:activator="{ props }">
          <v-btn
              color="secondary"
              icon
              size="small"
              variant="text"
              v-bind="props"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item @click="emit('editHost', hostData.domain)">
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>

          <v-list-item @click="emit('deleteHost', hostData.domain)">
            <template v-slot:prepend>
              <v-icon size="small" color="error">mdi-trash-can-outline</v-icon>
            </template>
            <v-list-item-title>删除</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.host-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
</style>