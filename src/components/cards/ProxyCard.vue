<script setup lang="ts">
import {PropType} from "vue";
import {ProxyData} from "@/components/types";
import {getProxyColor, getSourceColor} from '@/components/utils'
import ProxyActionMenu from "@/components/menu/ProxyActionMenu.vue";

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
  (e: 'changeStatus', name: string, disabled: boolean): void
}>()

</script>

<template>
  <v-card rounded="lg" elevation="2" class="proxy-card h-100 transition-swing">
    <div class="d-flex justify-space-between align-center px-4 pt-3">
      <span class="font-weight-bold text-truncate" :title="proxyData.data.name">{{ proxyData.data.name }}</span>
      <v-chip size="small" :color="getSourceColor(proxyData.meta.source)" variant="outlined">
        {{ proxyData.meta.source }}
      </v-chip>
    </div>

    <v-card-text class="pt-2 pb-4">
      <v-row no-gutters class="mb-2 align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">类型</v-col>
        <v-col cols="9">
          <v-chip :color="getProxyColor(proxyData.data.type)" size="x-small" label variant="tonal" class="font-weight-medium">
            {{ proxyData.data.type }}
          </v-chip>
        </v-col>
      </v-row>

      <v-row no-gutters class="align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">服务器</v-col>
        <v-col cols="9" class="text-body-2 text-truncate font-weight-medium">
          <span :title="proxyData.data.server">{{ proxyData.data.server }}</span>
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
      <ProxyActionMenu
          :proxy="proxyData"
          @change-status="(disabled) => emit('changeStatus', proxyData.data.name, disabled)"
          @show-yaml="emit('showYaml', proxyData.data)"
          @edit="emit('editProxy', proxyData)"
          @delete="emit('deleteProxy', proxyData.data.name)"
          @copy-to-clipboard="(text) => emit('copyToClipboard', text)"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.proxy-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
</style>