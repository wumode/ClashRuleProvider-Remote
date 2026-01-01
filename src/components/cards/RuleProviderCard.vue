<script setup lang="ts">
import {PropType} from "vue";
import {RuleProviderData} from "@/components/types";
import {isManual, isTemplate, getBehaviorColor, getSourceColor} from '@/components/utils'

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
  <v-card rounded="lg" elevation="2" class="rule-provider-card h-100 transition-swing">
    <div class="d-flex justify-space-between align-center px-4 pt-3">
      <span class="font-weight-bold text-truncate" :title="ruleProviderData.name">{{ ruleProviderData.name }}</span>
      <v-chip size="small" :color="getSourceColor(ruleProviderData.meta.source)" variant="outlined">
        {{ ruleProviderData.meta.source }}
      </v-chip>
    </div>

    <v-card-text class="pt-2 pb-4">
      <v-row no-gutters class="mb-2 align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">类型</v-col>
        <v-col cols="9">
          <span class="text-body-2 font-weight-medium">{{ ruleProviderData.rule_provider.type }}</span>
        </v-col>
      </v-row>

      <v-row no-gutters class="mb-2 align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">行为</v-col>
        <v-col cols="9">
           <v-chip v-if="ruleProviderData.rule_provider?.behavior" :color="getBehaviorColor(ruleProviderData.rule_provider.behavior)" size="x-small" label variant="tonal" class="font-weight-medium">
            {{ ruleProviderData.rule_provider.behavior }}
          </v-chip>
        </v-col>
      </v-row>

       <v-row no-gutters class="align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">内容</v-col>
        <v-col cols="9" class="text-body-2 text-truncate font-weight-medium">
          <span :title="ruleProviderData.rule_provider.format">{{ ruleProviderData.rule_provider.format }}</span>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-icon
          :color="ruleProviderData.meta.disabled ? 'grey' : 'success'"
      >
        {{ ruleProviderData.meta.disabled ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
      </v-icon>
      <v-spacer></v-spacer>
      <v-menu min-width="140">
        <template v-slot:activator="{ props }">
          <v-btn
              color="secondary"
              icon
              size="small"
              variant="text"
              v-bind="props"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item
              @click="emit('editRuleProvider', ruleProviderData.name)"
              :disabled="!isManual(ruleProviderData.meta.source)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-pencil</v-icon>
            </template>
            <v-list-item-title>编辑</v-list-item-title>
          </v-list-item>

          <v-list-item
              @click="emit('deleteRuleProvider', ruleProviderData.name)"
              :disabled="!isManual(ruleProviderData.meta.source)"
          >
            <template v-slot:prepend>
              <v-icon size="small" color="error">mdi-trash-can-outline</v-icon>
            </template>
            <v-list-item-title>删除</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.rule-provider-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
</style>