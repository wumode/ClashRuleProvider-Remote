<script setup lang="ts">
import {PropType} from "vue";
import {RuleData} from "@/components/types";
import {isSystemRule} from "@/components/utils";

defineProps({
  rule: {
    type: Object as PropType<RuleData>,
    required: true
  }
})

const emit = defineEmits<{
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
      <v-tooltip activator="parent" location="top" v-if="isSystemRule(rule)">
        根据规则集自动添加
      </v-tooltip>
    </template>
    <v-list density="compact">
      <v-list-item @click="emit('changeStatus', !rule.meta?.disabled)">
        <template v-slot:prepend>
          <v-icon size="small" :color="rule.meta?.disabled ? 'success' : 'grey'">
            {{ rule.meta?.disabled ? 'mdi-play-circle-outline' : 'mdi-stop-circle-outline' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ rule.meta?.disabled ? '启用' : '禁用' }}</v-list-item-title>
      </v-list-item>
      <v-list-item
          @click="emit('edit')"
          :disabled="isSystemRule(rule)"
      >
        <template v-slot:prepend>
          <v-icon size="small" color="primary">mdi-file-edit-outline</v-icon>
        </template>
        <v-list-item-title>编辑</v-list-item-title>
      </v-list-item>
      <v-list-item
          @click="emit('delete')"
          :disabled="isSystemRule(rule)"
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