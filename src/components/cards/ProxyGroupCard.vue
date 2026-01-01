<script setup lang="ts">
import {PropType} from "vue";
import {ProxyGroupData} from "@/components/types";
import {isManual, isRegion, getProxyGroupTypeColor, getSourceColor} from '@/components/utils'

defineProps({
  proxyGroupData: {
    type: Object as PropType<ProxyGroupData>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'showYaml', obj: any): void,
  (e: 'editProxyGroup', name: string): void
  (e: 'deleteProxyGroup', name: string): void
}>()
</script>

<template>
  <v-card rounded="lg" elevation="2" class="proxy-group-card h-100 transition-swing">
    <div class="d-flex justify-space-between align-center px-4 pt-3">
      <span class="font-weight-bold text-truncate"
            :title="proxyGroupData.proxy_group.name">{{ proxyGroupData.proxy_group.name }}</span>
      <v-chip size="small" :color="getSourceColor(proxyGroupData.meta.source)" variant="outlined">
        {{ proxyGroupData.meta.source }}
      </v-chip>
    </div>
    <v-card-text class="pt-2 pb-4">
      <v-row no-gutters class="align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">类型</v-col>
        <v-col cols="9">
          <v-chip :color="getProxyGroupTypeColor(proxyGroupData.proxy_group.type)" size="x-small" label variant="tonal"
                  class="font-weight-medium">
            {{ proxyGroupData.proxy_group.type }}
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-icon
          :color="proxyGroupData.meta.disabled ? 'grey' : 'success'"
      >
        {{ proxyGroupData.meta.disabled ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
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
          <v-list-item
              @click="emit('editProxyGroup', proxyGroupData.proxy_group.name)"
              :disabled="!(isManual(proxyGroupData.meta.source)||isRegion(proxyGroupData.meta.source))"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-pencil</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>

          <v-list-item @click="emit('showYaml', proxyGroupData.proxy_group)">
            <template v-slot:prepend>
              <v-icon size="small" color="info">mdi-code-json</v-icon>
            </template>
            <v-list-item-title>查看配置</v-list-item-title>
          </v-list-item>

          <v-list-item
              @click="emit('deleteProxyGroup', proxyGroupData.proxy_group.name)"
              :disabled="!isManual(proxyGroupData.meta.source)"
          >
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
.proxy-group-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>