<script setup lang="ts">
import {PropType} from "vue";
import {ProxyGroupData} from "@/components/types";
import {isManual, isRegion} from "@/components/utils";

defineProps({
  proxyGroup: {
    type: Object as PropType<ProxyGroupData>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'showYaml'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'changeStatus', disabled: boolean): void
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
      <v-list-item
          :disabled="!isManual(proxyGroup.meta.source)"
          @click="emit('changeStatus', !proxyGroup.meta.disabled)">
        <template v-slot:prepend>
          <v-icon size="small" :color="proxyGroup.meta.disabled ? 'success' : 'grey'">
            {{ proxyGroup.meta.disabled ? 'mdi-play-circle-outline' : 'mdi-stop-circle-outline' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ proxyGroup.meta.disabled ? '启用' : '禁用' }}</v-list-item-title>
      </v-list-item>

      <v-list-item @click="emit('showYaml')">
        <template v-slot:prepend>
          <v-icon size="small" color="info">mdi-code-json</v-icon>
        </template>
        <v-list-item-title>查看配置</v-list-item-title>
      </v-list-item>

      <v-list-item
          @click="emit('edit')"
          :disabled="!(isManual(proxyGroup.meta.source)||isRegion(proxyGroup.meta.source))"
      >
        <template v-slot:prepend>
          <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
        </template>
        <v-list-item-title>编辑</v-list-item-title>
      </v-list-item>
      
      <v-list-item
          @click="emit('delete')"
          :disabled="!isManual(proxyGroup.meta.source)"
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