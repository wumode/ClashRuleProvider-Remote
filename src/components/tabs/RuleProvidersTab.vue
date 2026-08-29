<script setup lang="ts">
import { ref, computed, toRaw } from 'vue'
import { useDisplay } from 'vuetify'
import { Metadata, RuleProviderData } from '@/components/types'
import RuleProvidersDesktop from './rule_providers/RuleProvidersDesktop.vue'
import RuleProvidersMobile from './rule_providers/RuleProvidersMobile.vue'
import RuleProviderDialog from '@/components/dialog/RuleProviderDialog.vue'

const props = defineProps<{
  ruleProviders: RuleProviderData[]
  api: any
}>()

const emit = defineEmits<{
  (e: 'refresh', regions: string[]): void
  (e: 'show-error', msg: string): void
  (e: 'show-yaml', obj: any): void
  (e: 'edit-visibility', meta: Metadata, endpoint: string, region: string): void
}>()

const { smAndDown } = useDisplay()

const searchRuleProviders = ref('')
const pageRuleProviders = ref(1)
const itemsPerPageRuleProviders = ref(10)

// Dialog State
const ruleProviderDialogVisible = ref(false)
const editingRuleProvider = ref<RuleProviderData | null>(null)
const editingRuleProviderName = ref<string | null>(null)
const loading = ref(false)

const filteredExtraRuleProviders = computed(() => {
  if (!searchRuleProviders.value) return props.ruleProviders
  const keyword = searchRuleProviders.value.toLowerCase()
  return props.ruleProviders.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(keyword))
  )
})

const paginatedExtraRuleProviders = computed(() => {
  const start = (pageRuleProviders.value - 1) * itemsPerPageRuleProviders.value
  const end = start + itemsPerPageRuleProviders.value
  return filteredExtraRuleProviders.value.slice(start, end)
})

const pageCountExtraRuleProviders = computed(() => {
  if (itemsPerPageRuleProviders.value === -1) {
    return 1
  }
  return Math.ceil(props.ruleProviders.length / itemsPerPageRuleProviders.value)
})

// Actions
function openAddRuleProviderDialog() {
  editingRuleProviderName.value = null
  editingRuleProvider.value = null
  ruleProviderDialogVisible.value = true
}

function editRuleProvider(name: string) {
  const ruleProvider = props.ruleProviders.find((r) => r.name === name)
  if (ruleProvider) {
    editingRuleProviderName.value = name
    editingRuleProvider.value = structuredClone(toRaw(ruleProvider))
    ruleProviderDialogVisible.value = true
  }
}

async function deleteRuleProvider(name: string) {
  loading.value = true
  try {
    const n = encodeURIComponent(name)
    await props.api.delete(`/plugin/ClashRuleProvider/rule-providers/${n}`)
    emit('refresh', ['rule-providers'])
  } catch (err: unknown) {
    if (err instanceof Error) emit('show-error', err.message || '删除规则集合失败')
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(name: string, disabled: boolean) {
  loading.value = true
  try {
    const provider = props.ruleProviders.find((p) => p.name === name)
    if (!provider) {
      emit('show-error', 'Rule provider not found')
      return
    }
    const n = encodeURIComponent(name)
    // Send full metadata with updated disabled status
    const newMeta = { ...provider.meta, disabled: disabled }
    await props.api.patch(`/plugin/ClashRuleProvider/rule-providers/${n}/meta`, newMeta)
    emit('refresh', ['rule-providers'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '更新规则集合状态失败')
    }
  } finally {
    loading.value = false
  }
}

function editVisibility(name: string) {
  const provider = props.ruleProviders.find((p) => p.name === name)
  if (!provider) {
    emit('show-error', 'Rule provider not found')
    return
  }
  const n = encodeURIComponent(name)
  emit(
    'edit-visibility',
    provider.meta,
    `/plugin/ClashRuleProvider/rule-providers/${n}/meta`,
    'rule-providers'
  )
}

function closeRuleProviderDialog() {
  editingRuleProviderName.value = null
  ruleProviderDialogVisible.value = false
}
</script>

<template>
  <div class="mb-2 position-relative">
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <!-- 移动端视图 -->
    <RuleProvidersMobile
      v-if="smAndDown"
      :paginated-rule-providers="paginatedExtraRuleProviders"
      :search="searchRuleProviders"
      :page="pageRuleProviders"
      :page-count="pageCountExtraRuleProviders"
      :loading="loading"
      @update:search="(v) => (searchRuleProviders = v)"
      @update:page="(v) => (pageRuleProviders = v)"
      @open-add-dialog="openAddRuleProviderDialog"
      @edit-rule-provider="editRuleProvider"
      @delete-rule-provider="deleteRuleProvider"
      @show-yaml="(o) => emit('show-yaml', o)"
      @change-status="handleStatusChange"
      @edit-visibility="editVisibility"
    />

    <!-- 桌面端视图 -->
    <RuleProvidersDesktop
      v-else
      :rule-providers="filteredExtraRuleProviders"
      :search="searchRuleProviders"
      :page="pageRuleProviders"
      :items-per-page="itemsPerPageRuleProviders"
      :page-count="pageCountExtraRuleProviders"
      :loading="loading"
      @update:search="(v) => (searchRuleProviders = v)"
      @update:page="(v) => (pageRuleProviders = v)"
      @update:items-per-page="(v) => (itemsPerPageRuleProviders = v)"
      @open-add-dialog="openAddRuleProviderDialog"
      @edit-rule-provider="editRuleProvider"
      @delete-rule-provider="deleteRuleProvider"
      @show-yaml="(o) => emit('show-yaml', o)"
      @change-status="handleStatusChange"
      @edit-visibility="editVisibility"
    />

    <v-divider></v-divider>

    <RuleProviderDialog
      v-if="ruleProviderDialogVisible"
      v-model="ruleProviderDialogVisible"
      :initial-value="editingRuleProvider"
      :is-adding="editingRuleProviderName === null"
      :api="api"
      @close="closeRuleProviderDialog"
      @refresh="emit('refresh', ['rule-providers'])"
      @show-error="(msg) => emit('show-error', msg)"
    />
  </div>
</template>

<style scoped></style>
