<script setup lang="ts">
import {PropType} from "vue";
import {ProxyData} from "@/components/types";
import {isManual, getProxyColor, getSourceColor} from '@/components/utils'

defineProps({
  proxyData: {
    type: Object as PropType<ProxyData>,
    required: true,
  },
})

const emit = defineEmits<{
  (e: 'copyToClipboard', content: string): void,
  (e: 'showYaml', obj: any): void,
  (e: 'editProxy', proxyData: ProxyData): void
  (e: 'deleteProxy', name: string): void
}>()

</script>

<template>
  <v-card rounded="lg" elevation="2" class="proxy-card h-100 transition-swing">
    <div class="d-flex justify-space-between align-center px-4 pt-3">
      <span class="font-weight-bold text-truncate" :title="proxyData.proxy.name">{{ proxyData.proxy.name }}</span>
      <v-chip size="small" :color="getSourceColor(proxyData.meta.source)" variant="outlined">
        {{ proxyData.meta.source }}
      </v-chip>
    </div>

    <v-card-text class="pt-2 pb-4">
      <v-row no-gutters class="mb-2 align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">类型</v-col>
        <v-col cols="9">
          <v-chip :color="getProxyColor(proxyData.proxy.type)" size="x-small" label variant="tonal" class="font-weight-medium">
            {{ proxyData.proxy.type }}
          </v-chip>
        </v-col>
      </v-row>

      <v-row no-gutters class="align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">服务器</v-col>
        <v-col cols="9" class="text-body-2 text-truncate font-weight-medium">
          <span :title="proxyData.proxy.server">{{ proxyData.proxy.server }}</span>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-icon
          :color="proxyData.meta.disabled ? 'grey' : 'success'"
      >
        {{ proxyData.meta.disabled ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
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
              @click="emit('editProxy', proxyData)"
              :disabled="!isManual(proxyData.meta.source)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="primary" v-if="proxyData.meta.patched">mdi-wrench-check</v-icon>
              <v-icon size="small" color="primary" v-else>mdi-pencil</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>

          <v-list-item @click="emit('showYaml', proxyData.proxy)">
            <template v-slot:prepend>
              <v-icon size="small" color="info">mdi-code-json</v-icon>
            </template>
            <v-list-item-title>查看YAML</v-list-item-title>
          </v-list-item>

          <v-list-item
              v-if="proxyData.v2ray_link"
              @click="emit('copyToClipboard', proxyData.v2ray_link)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="secondary">mdi-link</v-icon>
            </template>
            <v-list-item-title>复制链接</v-list-item-title>
          </v-list-item>

          <v-list-item
              @click="emit('deleteProxy', proxyData.proxy.name)"
              :disabled="!isManual(proxyData.meta.source)"
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
.proxy-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
</style>