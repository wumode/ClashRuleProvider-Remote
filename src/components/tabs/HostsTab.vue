<script setup lang="ts">
import { ref, computed, toRaw } from 'vue'
import { useDisplay } from 'vuetify'
import type { HostData } from '@/components/types'
import { defaultHost } from '@/components/constants'
import HostsDesktop from './hosts/HostsDesktop.vue'
import HostsMobile from './hosts/HostsMobile.vue'
import HostDialog from '@/components/dialog/HostDialog.vue'

const props = defineProps<{
  hosts: HostData[]
  bestCloudflareIPs: string[]
  api: any
}>()

const emit = defineEmits(['refresh', 'show-error'])

const { smAndDown } = useDisplay()

// State
const searchHosts = ref('')
const pageHosts = ref(1)
const itemsPerPageHosts = ref(10)
const hostDialogVisible = ref(false)
const currentHost = ref<HostData>({ ...defaultHost })
const isAdding = ref(true)
const loading = ref(false)

// Computed
const filteredHosts = computed(() => {
  if (!searchHosts.value) return props.hosts
  const keyword = searchHosts.value.toLowerCase()
  return props.hosts.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(keyword))
  )
})

const paginatedHosts = computed(() => {
  const start = (pageHosts.value - 1) * itemsPerPageHosts.value
  const end = start + itemsPerPageHosts.value
  return filteredHosts.value.slice(start, end)
})

const pageCountHosts = computed(() => {
  if (itemsPerPageHosts.value === -1) {
    return 1
  }
  return Math.ceil(props.hosts.length / itemsPerPageHosts.value)
})

// Methods
function openAddHostDialog() {
  currentHost.value = { ...defaultHost }
  isAdding.value = true
  hostDialogVisible.value = true
}

function editHost(domain: string) {
  const hostItem = props.hosts.find((r) => r.domain === domain)
  if (hostItem) {
    currentHost.value = structuredClone(toRaw(hostItem))
    isAdding.value = false
    hostDialogVisible.value = true
  }
}

async function deleteHost(name: string) {
  loading.value = true
  try {
    await props.api.delete(`/plugin/ClashRuleProvider/hosts/${encodeURIComponent(name)}`)
    emit('refresh')
  } catch (err: any) {
    emit('show-error', err.message || '删除 host 失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mb-2 position-relative">
    <v-overlay v-model="loading" contained class="align-center justify-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <!-- 移动端视图 -->
    <HostsMobile
      v-if="smAndDown"
      :paginated-hosts="paginatedHosts"
      :best-cloudflare-i-ps="bestCloudflareIPs"
      :search="searchHosts"
      :page="pageHosts"
      :page-count="pageCountHosts"
      :loading="loading"
      @update:search="(v) => (searchHosts = v)"
      @update:page="(v) => (pageHosts = v)"
      @open-add-dialog="openAddHostDialog"
      @edit="editHost"
      @delete="deleteHost"
    />

    <!-- 桌面端视图 -->
    <HostsDesktop
      v-else
      :hosts="filteredHosts"
      :search="searchHosts"
      :page="pageHosts"
      :items-per-page="itemsPerPageHosts"
      :page-count="pageCountHosts"
      :loading="loading"
      @update:search="(v) => (searchHosts = v)"
      @update:page="(v) => (pageHosts = v)"
      @update:items-per-page="(v) => (itemsPerPageHosts = v)"
      @open-add-dialog="openAddHostDialog"
      @edit="editHost"
      @delete="deleteHost"
    />

    <v-divider></v-divider>
  </div>

  <HostDialog
    v-if="hostDialogVisible"
    v-model="hostDialogVisible"
    :initial-value="currentHost"
    :is-adding="isAdding"
    :best-cloudflare-i-ps="bestCloudflareIPs"
    :api="api"
    @refresh="emit('refresh')"
    @show-error="(v) => emit('show-error', v)"
    @close="hostDialogVisible = false"
  />
</template>

<style scoped></style>
