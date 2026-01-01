<script setup lang="ts">
import {PropType} from "vue";
import {ProxyGroupData} from "@/components/types";
import {getProxyGroupTypeColor, getSourceColor} from '@/components/utils'
import ProxyGroupActionMenu from "@/components/menu/ProxyGroupActionMenu.vue";

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
  (e: 'changeStatus', name: string, disabled: boolean): void
}>()
</script>

<template>
  <v-card rounded="lg" elevation="2" class="proxy-group-card h-100 transition-swing">
    <div class="d-flex justify-space-between align-center px-4 pt-3">
      <span class="font-weight-bold text-truncate"
            :title="proxyGroupData.data.name">{{ proxyGroupData.data.name }}</span>
      <v-chip size="small" :color="getSourceColor(proxyGroupData.meta.source)" variant="outlined">
        {{ proxyGroupData.meta.source }}
      </v-chip>
    </div>
    <v-card-text class="pt-2 pb-4">
      <v-row no-gutters class="align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">类型</v-col>
        <v-col cols="9">
          <v-chip :color="getProxyGroupTypeColor(proxyGroupData.data.type)" size="x-small" label variant="tonal"
                  class="font-weight-medium">
            {{ proxyGroupData.data.type }}
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

      <ProxyGroupActionMenu
          :proxy-group="proxyGroupData"
          @change-status="(disabled) => emit('changeStatus', proxyGroupData.data.name, disabled)"
          @show-yaml="emit('showYaml', proxyGroupData.data)"
          @edit="emit('editProxyGroup', proxyGroupData.data.name)"
          @delete="emit('deleteProxyGroup', proxyGroupData.data.name)"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.proxy-group-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>