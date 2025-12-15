<script setup lang="ts">
import {PropType} from "vue";
import {RuleProviderData} from "@/components/types";
import {isManual, isTemplate, getBehaviorColor} from '@/components/utils'

const props = defineProps({
  ruleProviderData: {
    type: Object as PropType<RuleProviderData>,
    required: true,
  },
})
const emit = defineEmits<{
  (e: 'editRuleProvider', name: string): void
  (e: 'deleteRuleProvider', name: string): void
}>()
</script>

<template>
  <v-card rounded="lg" elevation="1">
    <v-card-title class="d-flex justify-space-between align-center">
      <v-row align="center">
        <v-icon start v-if="isManual(ruleProviderData.source)" size="x-small" color="primary">mdi-feather
        </v-icon>
        <v-icon start v-else-if="isTemplate(ruleProviderData.source)" size="x-small" color="success">
          mdi-file-code-outline
        </v-icon>
        <v-icon start v-else size="x-small" color="info">mdi-file-download-outline</v-icon>
        <span class="font-weight-bold">{{ ruleProviderData.name }}</span>
      </v-row>
      <v-chip v-if="ruleProviderData.rule_provider?.behavior" :color="getBehaviorColor(ruleProviderData.rule_provider.behavior)" size="small" label>
        {{ ruleProviderData.rule_provider.behavior }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <div class="text-body-2"><strong>类型：</strong>{{ ruleProviderData.rule_provider.type }}</div>
      <div class="text-body-2"><strong>内容：</strong>{{ ruleProviderData.rule_provider.format }}</div>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions class="d-flex justify-center">
      <v-btn icon size="small" color="primary" variant="text"
             @click="emit('editRuleProvider', ruleProviderData.name)"
             :disabled="!isManual(ruleProviderData.source)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon size="small" color="error" variant="text"
             @click="emit('deleteRuleProvider', ruleProviderData.name)"
             :disabled="!isManual(ruleProviderData.source)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>