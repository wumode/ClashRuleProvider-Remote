<script setup lang="ts">
import {PropType} from "vue";
import {ProxyGroupData} from "@/components/types";
import {isManual, isTemplate, isRegion, getProxyGroupTypeColor} from '@/components/utils'

const props = defineProps({
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
  <v-card rounded="lg" elevation="1">
    <v-card-title class="d-flex justify-space-between align-center">
      <v-row align="center">
        <v-icon start v-if="isManual(proxyGroupData.source)" size="x-small" color="primary">mdi-feather
        </v-icon>
        <v-icon start v-else-if="isRegion(proxyGroupData.source)" size="x-small" color="info">mdi-earth
        </v-icon>
        <v-icon start v-else-if="isTemplate(proxyGroupData.source)" size="x-small" color="success">
          mdi-file-code-outline
        </v-icon>
        <v-chip v-else size="small" label>item.source</v-chip>
        <span class="font-weight-bold">{{ proxyGroupData.proxy_group.name }}</span>
      </v-row>
      <v-chip :color="getProxyGroupTypeColor(proxyGroupData.proxy_group.type)" size="small" label>
        {{ proxyGroupData.proxy_group.type }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <div class="text-body-2"><strong>类型：</strong>{{ proxyGroupData.proxy_group.type }}</div>
    </v-card-text>
    <v-divider></v-divider>

    <v-card-actions class="d-flex justify-center">

      <v-btn icon size="small" color="primary" variant="text"
             @click="emit('editProxyGroup', proxyGroupData.proxy_group.name)"
             :disabled="!(isManual(proxyGroupData.source)||isRegion(proxyGroupData.source))"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon size="small" color="info" variant="text"
             @click="emit('showYaml', proxyGroupData.proxy_group)">
        <v-icon>mdi-code-json</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon size="small" color="error" variant="text"
             @click="emit('deleteProxyGroup', proxyGroupData.proxy_group.name)"
             :disabled="!isManual(proxyGroupData.source)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>