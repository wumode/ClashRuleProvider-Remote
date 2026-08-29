<script setup lang="ts">
import { computed, ref, toRaw } from 'vue'
import { useDisplay } from 'vuetify'
import TopRulesDesktop from './top_rules/TopRulesDesktop.vue'
import TopRulesMobile from './top_rules/TopRulesMobile.vue'
import RuleDialog from '../dialog/RuleDialog.vue'
import ImportRuleDialog from '../dialog/ImportRuleDialog.vue'
import { defaultRule } from '@/components/constants'
import { RuleData, RuleSetType, GeoRules, Metadata } from '@/components/types'

const props = defineProps<{
  rules: RuleData[]
  api: any
  ruleProviderNames: string[]
  geoRules: GeoRules
  customOutbounds: string[]
}>()

const emit = defineEmits<{
  (e: 'refresh', regions: string[]): void
  (e: 'show-error', msg: string): void
  (e: 'edit-visibility', meta: Metadata, endpoint: string, region: string): void
}>()

const { smAndDown } = useDisplay()

const searchTopRule = ref('')
const page = ref(1)
const itemsPerPage = ref(10)
const loading = ref(false)

// Dialog State
const ruleDialogVisible = ref(false)
const importRuleDialog = ref(false)
const editingPriority = ref<number | null>(null)
const currentRule = ref<RuleData>({ ...defaultRule })
const editingType = ref<RuleSetType>('top')

const filteredRules = computed(() => {
  if (!searchTopRule.value) return props.rules
  const keyword = searchTopRule.value.toLowerCase()
  return props.rules.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(keyword))
  )
})

const pageCount = computed(() => {
  if (itemsPerPage.value === -1) {
    return 1
  }
  return Math.ceil(filteredRules.value.length / itemsPerPage.value)
})

const paginatedTopRules = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRules.value.slice(start, end)
})

// Actions
function openImportRuleDialog() {
  importRuleDialog.value = true
}

function openAddRuleDialog() {
  editingPriority.value = null
  const nextPriority = props.rules.length > 0 ? props.rules[props.rules.length - 1].priority + 1 : 0
  currentRule.value = { ...defaultRule }
  currentRule.value.priority = nextPriority
  ruleDialogVisible.value = true
}

function closeRuleDialog() {
  ruleDialogVisible.value = false
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
    await props.api.delete(`/plugin/ClashRuleProvider/rules/top/${priority}`)
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
    await props.api.delete('/plugin/ClashRuleProvider/rules/top', {
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
    await props.api.put(`/plugin/ClashRuleProvider/reorder-rules/top/${targetPriority}`, {
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
    await props.api.post(`/plugin/ClashRuleProvider/rules/top/metadata/disabled`, {
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
    await props.api.post(`/plugin/ClashRuleProvider/rules/top/metadata/disabled`, payload)
    emit('refresh', ['top', 'ruleset'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '批量更新规则状态失败')
    }
  } finally {
    loading.value = false
  }
}

function editVisibility(priority: number, type: RuleSetType) {
  const rule = props.rules.find((r) => r.priority === priority)
  if (!rule) {
    emit('show-error', 'Rule not found')
    return
  }
  emit(
    'edit-visibility',
    rule.meta,
    `/plugin/ClashRuleProvider/rules/${type}/${priority}/meta`,
    type
  )
}
</script>

<template>
  <div class="mb-2 position-relative">
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <!-- 移动端视图 -->
    <TopRulesMobile
      v-if="smAndDown"
      :paginated-rules="paginatedTopRules"
      :search="searchTopRule"
      :page="page"
      :page-count="pageCount"
      :loading="loading"
      @update:search="(v) => (searchTopRule = v)"
      @update:page="(v) => (page = v)"
      @open-import-dialog="openImportRuleDialog"
      @open-add-dialog="openAddRuleDialog"
      @edit="editRule"
      @delete="deleteRule"
      @change-status="handleStatusChange"
      @edit-visibility="editVisibility"
    />

    <!-- 桌面端视图 -->
    <TopRulesDesktop
      v-else
      :rules="rules"
      :search="searchTopRule"
      :page="page"
      :items-per-page="itemsPerPage"
      :page-count="pageCount"
      :loading="loading"
      @update:search="(v) => (searchTopRule = v)"
      @update:page="(v) => (page = v)"
      @update:items-per-page="(v) => (itemsPerPage = v)"
      @open-import-dialog="openImportRuleDialog"
      @open-add-dialog="openAddRuleDialog"
      @edit="editRule"
      @delete="deleteRule"
      @delete-batch="deleteRules"
      @reorder="handleReorderRule"
      @change-status="handleStatusChange"
      @change-status-batch="handleBatchStatusChange"
      @edit-visibility="editVisibility"
    />

    <v-divider></v-divider>
    <div class="text-caption text-grey mt-2">
      *置顶规则用于管理来自规则集的匹配规则，这些规则会动态更新。
    </div>
    <div class="text-caption text-grey mt-2">*对置顶规则的修改只有Clash更新配置后才会生效。</div>

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
    <ImportRuleDialog
      v-if="importRuleDialog"
      v-model="importRuleDialog"
      :api="api"
      @refresh="emit('refresh', ['top'])"
      @show-error="(msg) => emit('show-error', msg)"
    />
  </div>
</template>

<style scoped></style>
