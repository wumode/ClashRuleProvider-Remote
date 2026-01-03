<script setup lang="ts">
import {PropType} from "vue";
import {RuleProviderData} from "@/components/types";
import {isManual} from "@/components/utils";

defineProps({
  ruleProvider: {
    type: Object as PropType<RuleProviderData>,
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
          @click="emit('changeStatus', !ruleProvider.meta.disabled)"
          :disabled="!isManual(ruleProvider.meta.source)"
      >
        <template v-slot:prepend>
          <v-icon size="small" :color="ruleProvider.meta.disabled ? 'success' : 'grey'">
            {{ ruleProvider.meta.disabled ? 'mdi-play-circle-outline' : 'mdi-stop-circle-outline' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ ruleProvider.meta.disabled ? '启用' : '禁用' }}</v-list-item-title>
      </v-list-item>

      <v-list-item
          @click="emit('edit')"
          :disabled="!isManual(ruleProvider.meta.source)"
      >
        <template v-slot:prepend>
          <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
        </template>
        <v-list-item-title>编辑</v-list-item-title>
      </v-list-item>

      <v-list-item @click="emit('showYaml')">
        <template v-slot:prepend>
          <v-icon size="small" color="info">mdi-code-json</v-icon>
        </template>
        <v-list-item-title>查看配置</v-list-item-title>
      </v-list-item>

      <v-list-item
          @click="emit('delete')"
          :disabled="!isManual(ruleProvider.meta.source)"
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