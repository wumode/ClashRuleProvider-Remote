<script setup lang="ts">
import {PropType} from "vue";
import {RuleData, RuleSetType} from "@/components/types";
import {getActionColor, getRuleTypeColor, isSystemRule} from '@/components/utils'

const props = defineProps({
  rule: {
    type: Object as PropType<RuleData>,
    required: true
  },
  ruleset: {
    type: Object as PropType<RuleSetType>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'edit', priority: number, type: RuleSetType): void
  (e: 'delete', priority: number, type: RuleSetType): void
}>()

function editRule(priority: number) {
  emit('edit', priority, props.ruleset);
}

function deleteRule(priority: number) {
  emit('delete', priority, props.ruleset);
}
</script>

<template>
  <v-card rounded="lg" elevation="1">
    <v-card-title class="d-flex justify-space-between align-center">
      <div>
        <v-icon small class="mr-1">mdi-order-numeric-ascending</v-icon>
        <span class="font-weight-bold">优先级 {{ rule.priority }}</span>
      </div>
      <v-chip :color="getActionColor(rule.action)" size="small" label>
        {{ rule.action }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <div class="text-body-2 mb-2">
        <strong>类型：</strong>
        <v-chip :color="getRuleTypeColor(rule.type)" size="x-small" label>
          {{ rule.type }}
        </v-chip>
      </div>
      <div class="text-body-2"><strong>内容：</strong>{{ rule.payload }}</div>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="d-flex justify-center">
      <v-btn
          icon color="primary"
          size="small"
          :disabled="isSystemRule(rule)"
          @click="editRule(rule.priority)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
          icon color="error"
          size="small"
          @click="deleteRule(rule.priority)"
          :disabled="isSystemRule(rule)"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>