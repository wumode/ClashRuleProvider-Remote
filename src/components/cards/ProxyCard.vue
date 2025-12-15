<script setup lang="ts">
import {PropType} from "vue";
import {ProxyData} from "@/components/types";
import {isManual, isTemplate, getProxyColor} from '@/components/utils'

const props = defineProps({
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
  <v-card rounded="lg" elevation="1">
    <v-card-title class="d-flex justify-space-between align-center">
      <v-row align="center">
        <v-icon start v-if="isManual(proxyData.source)" size="x-small" color="primary">mdi-feather
        </v-icon>
        <v-icon start v-else-if="isTemplate(proxyData.source)" size="x-small" color="success">
          mdi-file-code-outline
        </v-icon>
        <v-icon start v-else size="x-small" color="info">mdi-file-download-outline</v-icon>
        <span class="font-weight-bold">{{ proxyData.proxy.name }}</span>
        <v-btn v-if="proxyData.v2ray_link" icon size="small" color="secondary" variant="text"
               @click="emit('copyToClipboard', proxyData.v2ray_link)">
          <v-icon>mdi-link</v-icon>
        </v-btn>
      </v-row>
      <v-chip :color="getProxyColor(proxyData.proxy.type)" size="small" label>
        {{ proxyData.proxy.type }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <div class="text-body-2"><strong>类型：</strong>{{ proxyData.proxy.type }}</div>
      <div class="text-body-2"><strong>服务器：</strong>{{ proxyData.proxy.server }}</div>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="d-flex justify-center">
      <v-btn icon size="small" color="primary" variant="text"
             @click="emit('editProxy', proxyData)"
      >
        <v-icon v-if="proxyData.patched">mdi-wrench-check</v-icon>
        <v-icon v-else>mdi-cog</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon size="small" color="info" variant="text"
             @click="emit('showYaml', proxyData.proxy)">
        <v-icon>mdi-code-json</v-icon>
      </v-btn>

      <v-spacer></v-spacer>
      <v-btn icon size="small" color="error" variant="text"
             @click="emit('deleteProxy', proxyData.proxy.name)"
             :disabled="!isManual(proxyData.source)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>