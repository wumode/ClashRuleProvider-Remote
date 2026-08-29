<script setup lang="ts">
import { computed, ref, toRaw } from 'vue'
import { useDisplay } from 'vuetify'
import RulesetRulesDesktop from './ruleset/RulesetRulesDesktop.vue'
import RulesetRulesMobile from './ruleset/RulesetRulesMobile.vue'
import RuleDialog from '../dialog/RuleDialog.vue'
import { defaultRule } from '@/components/constants'
import { RuleData, RuleSetType, GeoRules } from '@/components/types'

const props = defineProps<{
  rules: RuleData[]
  rulesetPrefix: string
  api: any
  ruleProviderNames: string[]
  geoRules: GeoRules
  customOutbounds: string[]
}>()

const emit = defineEmits<{
  (e: 'refresh', regions: string[]): void
  (e: 'show-error', msg: string): void
}>()

// Vuetify 响应式断点
const { smAndDown } = useDisplay()

const searchRulesetRule = ref('')
const pageRuleset = ref(1)
const itemsPerPageRuleset = ref(10)
const loading = ref(false)
// 是否要分组
const group = ref(false)

// Dialog State
const ruleDialogVisible = ref(false)
const editingPriority = ref<number | null>(null)
const currentRule = ref<RuleData>({ ...defaultRule })
const editingType = ref<RuleSetType>('ruleset')

const filteredRulesetRules = computed(() => {
  if (!searchRulesetRule.value) return props.rules
  const keyword = searchRulesetRule.value.toLowerCase()
  return props.rules.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(keyword))
  )
})

const pageCountRuleset = computed(() => {
  if (itemsPerPageRuleset.value === -1) {
    return 1
  }
  return Math.ceil(filteredRulesetRules.value.length / itemsPerPageRuleset.value)
})

const paginatedRulesetRules = computed(() => {
  const start = (pageRuleset.value - 1) * itemsPerPageRuleset.value
  const end = start + itemsPerPageRuleset.value
  return filteredRulesetRules.value.slice(start, end)
})

// Actions
function openAddRuleDialog() {
  editingPriority.value = null
  const nextPriority = props.rules.length > 0 ? props.rules[props.rules.length - 1].priority + 1 : 0
  currentRule.value = { ...defaultRule }
  currentRule.value.priority = nextPriority
  ruleDialogVisible.value = true
}

function editRule(priority: number) {
  const rule = props.rules.find((r) => r.priority === priority)
  if (rule) {
    editingPriority.value = priority
    currentRule.value = structuredClone(toRaw(rule))
    ruleDialogVisible.value = true
  }
}

async function deleteRule(priority: number) {
  loading.value = true
  try {
    await props.api.delete(`/plugin/ClashRuleProvider/rules/ruleset/${priority}`)
    emit('refresh', ['top', 'ruleset'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除规则失败')
    }
  } finally {
    loading.value = false
  }
}

async function deleteRules(priorities: number[]) {
  loading.value = true
  try {
    await props.api.delete('/plugin/ClashRuleProvider/rules/ruleset', {
      data: { rules_priority: priorities }
    })
    emit('refresh', ['top', 'ruleset'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '批量删除规则失败')
    }
  } finally {
    loading.value = false
  }
}

async function handleReorderRule(targetPriority: number, movedPriority: number) {
  loading.value = true
  try {
    await props.api.put(`/plugin/ClashRuleProvider/reorder-rules/ruleset/${targetPriority}`, {
      moved_priority: movedPriority
    })
    emit('refresh', ['top', 'ruleset'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '重排序失败')
    }
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(priority: number, disabled: boolean) {
  loading.value = true
  try {
    await props.api.post(`/plugin/ClashRuleProvider/rules/ruleset/metadata/disabled`, {
      [priority]: disabled
    })
    emit('refresh', ['top', 'ruleset'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '更新规则状态失败')
    }
  } finally {
    loading.value = false
  }
}

async function handleBatchStatusChange(priorities: number[], disabled: boolean) {
  loading.value = true
  try {
    const payload = priorities.reduce((acc, p) => ({ ...acc, [p]: disabled }), {})
    await props.api.post(`/plugin/ClashRuleProvider/rules/ruleset/metadata/disabled`, payload)
    emit('refresh', ['top', 'ruleset'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '批量更新规则状态失败')
    }
  } finally {
    loading.value = false
  }
}

function closeRuleDialog() {
  ruleDialogVisible.value = false
}
</script>

<template>
  <div class="mb-2 position-relative">
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <!-- 移动端视图 -->
    <RulesetRulesMobile
      v-if="smAndDown"
      :paginated-rules="paginatedRulesetRules"
      :search="searchRulesetRule"
      :page="pageRuleset"
      :page-count="pageCountRuleset"
      :loading="loading"
      @update:search="(v) => (searchRulesetRule = v)"
      @update:page="(v) => (pageRuleset = v)"
      @open-add-dialog="openAddRuleDialog"
      @edit="editRule"
      @delete="deleteRule"
      @change-status="handleStatusChange"
    />

    <!-- 桌面端视图 -->
    <RulesetRulesDesktop
      v-else
      :rules="rules"
      :ruleset-prefix="rulesetPrefix"
      :search="searchRulesetRule"
      :group="group"
      :page="pageRuleset"
      :items-per-page="itemsPerPageRuleset"
      :page-count="pageCountRuleset"
      :loading="loading"
      @update:search="(v) => (searchRulesetRule = v)"
      @update:group="(v) => (group = v)"
      @update:page="(v) => (pageRuleset = v)"
      @update:items-per-page="(v) => (itemsPerPageRuleset = v)"
      @open-add-dialog="openAddRuleDialog"
      @edit="editRule"
      @delete="deleteRule"
      @delete-batch="deleteRules"
      @reorder="handleReorderRule"
      @change-status="handleStatusChange"
      @change-status-batch="handleBatchStatusChange"
    />

    <v-divider></v-divider>
    <!-- 说明文字 -->
    <div class="text-caption text-grey mt-2">* 对规则集的修改会在 Clash 中立即生效。</div>

    <RuleDialog
      v-if="ruleDialogVisible"
      v-model="ruleDialogVisible"
      :initial-rule="currentRule"
      :is-adding="editingPriority === null"
      :editing-type="editingType"
      :rule-provider-names="ruleProviderNames"
      :geo-rules="geoRules"
      :custom-outbounds="customOutbounds"
      :api="api"
      @refresh="(v: string[]) => emit('refresh', v)"
      @show-error="(msg) => emit('show-error', msg)"
      @close="closeRuleDialog"
    ></RuleDialog>
  </div>
</template>

<style scoped></style>
