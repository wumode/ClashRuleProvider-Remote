<script setup lang="ts">
import {PropType} from "vue";
import {RuleProviderData} from "@/components/types";
import {isManual, getBehaviorColor, getSourceColor} from '@/components/utils'
import RuleProviderActionMenu from "@/components/menu/RuleProviderActionMenu.vue";

defineProps({
  ruleProviderData: {
    type: Object as PropType<RuleProviderData>,
    required: true,
  },
})
const emit = defineEmits<{
  (e: 'editRuleProvider', name: string): void
  (e: 'deleteRuleProvider', name: string): void
  (e: 'showYaml', obj: any): void
  (e: 'changeStatus', name: string, disabled: boolean): void
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
          <span class="text-body-2 font-weight-medium">{{ ruleProviderData.data.type }}</span>
        </v-col>
      </v-row>

      <v-row no-gutters class="mb-2 align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">行为</v-col>
        <v-col cols="9">
           <v-chip v-if="ruleProviderData.data?.behavior" :color="getBehaviorColor(ruleProviderData.data.behavior)" size="x-small" label variant="tonal" class="font-weight-medium">
            {{ ruleProviderData.data.behavior }}
          </v-chip>
        </v-col>
      </v-row>

       <v-row no-gutters class="align-center">
        <v-col cols="3" class="text-caption text-medium-emphasis">内容</v-col>
        <v-col cols="9" class="text-body-2 text-truncate font-weight-medium">
          <span :title="ruleProviderData.data.format">{{ ruleProviderData.data.format }}</span>
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
      <RuleProviderActionMenu
          :rule-provider="ruleProviderData"
          @change-status="(disabled) => emit('changeStatus', ruleProviderData.name, disabled)"
          @edit="emit('editRuleProvider', ruleProviderData.name)"
          @show-yaml="emit('showYaml', ruleProviderData.data)"
          @delete="emit('deleteRuleProvider', ruleProviderData.name)"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.rule-provider-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
}
</style>