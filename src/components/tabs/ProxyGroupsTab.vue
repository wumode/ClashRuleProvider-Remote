<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import ProxyGroupsDesktop from './proxy_groups/ProxyGroupsDesktop.vue'
import ProxyGroupsMobile from './proxy_groups/ProxyGroupsMobile.vue'
import ProxyGroupsDialog from '@/components/dialog/ProxyGroupsDialog.vue'
import { Metadata, ProxyGroupData, ProxyProviderData } from '@/components/types'

const props = defineProps<{
  proxyGroups: ProxyGroupData[]
  proxyProviders: ProxyProviderData[]
  customOutbounds: string[]
  api: any
}>()

const emit = defineEmits<{
  (e: 'refresh', regions: string[]): void
  (e: 'show-error', msg: string): void
  (e: 'show-yaml', obj: any): void
  (e: 'copy-to-clipboard', text: string): void
  (e: 'edit-visibility', meta: Metadata, endpoint: string, region: string): void
}>()

const { smAndDown } = useDisplay()

const searchProxyGroups = ref('')
const pageProxyGroup = ref(1)
const itemsPerPageProxyGroup = ref(10)
const loading = ref(false)

// Dialog State
const proxyGroupDialogVisible = ref(false)
const editingProxyGroupName = ref<string | null>(null)
const currentProxyGroup = ref<ProxyGroupData | null>(null)

const filteredProxyGroups = computed(() => {
  if (!searchProxyGroups.value) return props.proxyGroups
  const keyword = searchProxyGroups.value.toLowerCase()
  return props.proxyGroups.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(keyword))
  )
})

const paginatedProxyGroups = computed(() => {
  const start = (pageProxyGroup.value - 1) * itemsPerPageProxyGroup.value
  const end = start + itemsPerPageProxyGroup.value
  return filteredProxyGroups.value.slice(start, end)
})

const pageCountProxyGroups = computed(() => {
  if (itemsPerPageProxyGroup.value === -1) {
    return 1
  }
  return Math.ceil(filteredProxyGroups.value.length / itemsPerPageProxyGroup.value)
})

// Actions
function openAddProxyGroupDialog() {
  editingProxyGroupName.value = null
  currentProxyGroup.value = null
  proxyGroupDialogVisible.value = true
}

function editProxyGroup(name: string) {
  const proxyGroupData = props.proxyGroups.find((p) => p.data.name === name)
  if (proxyGroupData) {
    editingProxyGroupName.value = name
    currentProxyGroup.value = { ...proxyGroupData }
    proxyGroupDialogVisible.value = true
  }
}

async function deleteProxyGroup(name: string) {
  loading.value = true
  try {
    const n = encodeURIComponent(name)
    await props.api.delete(`/plugin/ClashRuleProvider/proxy-groups/${n}`)
    emit('refresh', ['proxy-groups', 'clash-outbounds'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除规则失败')
    }
  } finally {
    loading.value = false
  }
}

async function deletePatch(name: string) {
  loading.value = true
  try {
    const n = encodeURIComponent(name)
    await props.api.delete(`/plugin/ClashRuleProvider/proxy-groups/${n}/patch`)
    emit('refresh', ['proxy-groups', 'clash-outbounds'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '删除补丁失败')
    }
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(name: string, disabled: boolean) {
  loading.value = true
  try {
    const group = props.proxyGroups.find((g) => g.data.name === name)
    if (!group) {
      emit('show-error', 'Proxy group not found')
      return
    }
    const n = encodeURIComponent(name)
    // Send full metadata with updated disabled status
    const newMeta = { ...group.meta, disabled: disabled }
    await props.api.patch(`/plugin/ClashRuleProvider/proxy-groups/${n}/meta`, newMeta)
    emit('refresh', ['proxy-groups', 'clash-outbounds'])
  } catch (err: unknown) {
    if (err instanceof Error) {
      emit('show-error', err.message || '更新代理组状态失败')
    }
  } finally {
    loading.value = false
  }
}

function editVisibility(name: string) {
  const group = props.proxyGroups.find((g) => g.data.name === name)
  if (!group) {
    emit('show-error', 'Proxy group not found')
    return
  }
  const n = encodeURIComponent(name)
  emit(
    'edit-visibility',
    group.meta,
    `/plugin/ClashRuleProvider/proxy-groups/${n}/meta`,
    'proxy-groups'
  )
}

function closeProxyGroupsDialog() {
  currentProxyGroup.value = null
  proxyGroupDialogVisible.value = false
}
</script>

<template>
  <div class="mb-2 position-relative">
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <!-- 移动端视图 -->
    <ProxyGroupsMobile
      v-if="smAndDown"
      :paginated-proxy-groups="paginatedProxyGroups"
      :search="searchProxyGroups"
      :page="pageProxyGroup"
      :page-count="pageCountProxyGroups"
      :loading="loading"
      @update:search="(v) => (searchProxyGroups = v)"
      @update:page="(v) => (pageProxyGroup = v)"
      @open-add-dialog="openAddProxyGroupDialog"
      @edit-proxy-group="editProxyGroup"
      @delete-proxy-group="deleteProxyGroup"
      @delete-patch="deletePatch"
      @change-status="handleStatusChange"
      @edit-visibility="editVisibility"
      @show-yaml="(o) => emit('show-yaml', o)"
    />

    <!-- 桌面端视图 -->
    <ProxyGroupsDesktop
      v-else
      :proxy-groups="proxyGroups"
      :search="searchProxyGroups"
      :page="pageProxyGroup"
      :items-per-page="itemsPerPageProxyGroup"
      :page-count="pageCountProxyGroups"
      :loading="loading"
      @update:search="(v) => (searchProxyGroups = v)"
      @update:page="(v) => (pageProxyGroup = v)"
      @update:items-per-page="(v) => (itemsPerPageProxyGroup = v)"
      @open-add-dialog="openAddProxyGroupDialog"
      @edit-proxy-group="editProxyGroup"
      @delete-proxy-group="deleteProxyGroup"
      @delete-patch="deletePatch"
      @change-status="handleStatusChange"
      @edit-visibility="editVisibility"
      @copy-to-clipboard="(t) => emit('copy-to-clipboard', t)"
      @show-yaml="(o) => emit('show-yaml', o)"
    />

    <v-divider></v-divider>

    <!-- Add ProxyGroup Dialog -->
    <ProxyGroupsDialog
      v-if="proxyGroupDialogVisible"
      v-model="proxyGroupDialogVisible"
      :initial-value="currentProxyGroup"
      :is-adding="editingProxyGroupName === null"
      :proxy-providers="proxyProviders"
      :custom-outbounds="customOutbounds"
      :api="api"
      @close="closeProxyGroupsDialog"
      @refresh="emit('refresh', ['clash-outbounds', 'proxy-groups'])"
      @show-error="(msg) => emit('show-error', msg)"
    />
  </div>
</template>

<style scoped></style>
