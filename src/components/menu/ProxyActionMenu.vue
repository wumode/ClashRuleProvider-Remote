<script setup lang="ts">
import {PropType} from "vue";
import {ProxyData} from "@/components/types";
import {isManual, isInvalid} from "@/components/utils";

defineProps({
  proxy: {
    type: Object as PropType<ProxyData>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'showYaml'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'changeStatus', disabled: boolean): void
  (e: 'copyToClipboard', text: string): void
}>()
</script>

<template>
  <v-menu min-width="120">
    <template v-slot:activator="{ props }">
      <v-btn color="secondary" icon size="small" variant="text" v-bind="props">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list density="compact">
      <v-list-item :disabled="!isManual(proxy.meta.source)" @click="emit('changeStatus', !proxy.meta.disabled)">
        <template v-slot:prepend>
          <v-icon size="small" :color="proxy.meta.disabled ? 'success' : 'warning'">
            {{ proxy.meta.disabled ? 'mdi-check' : 'mdi-close' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ proxy.meta.disabled ? '启用' : '禁用' }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="emit('showYaml')">
        <template v-slot:prepend>
          <v-icon size="small" color="info">mdi-code-json</v-icon>
        </template>
        <v-list-item-title>查看配置</v-list-item-title>
      </v-list-item>

      <v-list-item @click="emit('edit')">
        <template v-slot:prepend>
          <v-icon size="small" color="primary" v-if="proxy.meta.patched">mdi-wrench-check</v-icon>
          <v-icon size="small" color="primary" v-else>mdi-file-edit-outline</v-icon>
        </template>
        <v-list-item-title>编辑</v-list-item-title>
      </v-list-item>
      
      <v-list-item
          v-if="proxy.v2ray_link"
          @click="emit('copyToClipboard', proxy.v2ray_link)"
      >
        <template v-slot:prepend>
          <v-icon size="small" color="secondary">mdi-link</v-icon>
        </template>
        <v-list-item-title>复制链接</v-list-item-title>
      </v-list-item>

      <v-list-item
          @click="emit('delete')"
          :disabled="!(isManual(proxy.meta.source)||isInvalid(proxy.meta.source))"
      >
        <template v-slot:prepend>
          <v-icon size="small" color="error">mdi-trash-can-outline</v-icon>
        </template>
        <v-list-item-title>删除</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
</style>